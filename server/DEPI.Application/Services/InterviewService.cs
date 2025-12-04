using DEPI.Application.Contracts;
using DEPI.Application.DTOs;
using DEPI.DataAccess.Contracts;
using DEPI.DataAccess.Entites;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text.RegularExpressions;

namespace DEPI.Application.Services
{
    internal class InterviewService : IinterviewService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IGeminiService _geminiService;
        private readonly ILogger<InterviewService> _logger;

        public InterviewService(IUnitOfWork unitOfWork, IGeminiService geminiService, ILogger<InterviewService> logger)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _geminiService = geminiService ?? throw new ArgumentNullException(nameof(geminiService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<int> generateQuiz(GenerateQuizDTO generateQuiz)
        {
            try
            {
                // Validation 1: Check if DTO is null
                if (generateQuiz == null)
                {
                    _logger.LogWarning("GenerateQuizDTO parameter is null");
                    throw new ArgumentNullException(nameof(generateQuiz), "Generate quiz request cannot be null.");
                }

                // Validation 2: Check if parameters are valid
                if (generateQuiz.userid <= 0)
                    throw new ArgumentException("User ID must be greater than zero.", nameof(generateQuiz.userid));

                if (generateQuiz.resmueid <= 0)
                    throw new ArgumentException("Resume ID must be greater than zero.", nameof(generateQuiz.resmueid));

                if (string.IsNullOrWhiteSpace(generateQuiz.targetJob))
                    throw new ArgumentException("Target job cannot be null or empty.", nameof(generateQuiz.targetJob));

                _logger.LogInformation("Starting quiz generation for UserId {UserId}, ResumeId {ResumeId}, targetJob '{TargetJob}'",
                    generateQuiz.userid, generateQuiz.resmueid, generateQuiz.targetJob);

                // Validation 2: Check if user exists
                var user = await _unitOfWork.Users.GetByIdAsync(generateQuiz.userid);
                if (user == null)
                {
                    _logger.LogWarning("User with ID {UserId} not found", generateQuiz.userid);
                    throw new KeyNotFoundException($"User with ID {generateQuiz.userid} not found.");
                }

                // Validation 3: Check if resume exists
                var resume = await _unitOfWork.Resumes.GetByIdAsync(generateQuiz.resmueid);
                if (resume == null)
                {
                    _logger.LogWarning("Resume with ID {ResumeId} not found", generateQuiz.resmueid);
                    throw new KeyNotFoundException($"Resume with ID {generateQuiz.resmueid} not found.");
                }

                // Validation 4: Check if resume belongs to the user
                if (resume.UserId !=generateQuiz.userid)
                {
                    _logger.LogWarning("Resume {ResumeId} does not belong to user {UserId}", generateQuiz.resmueid, generateQuiz.userid);
                    throw new InvalidOperationException($"Resume with ID {generateQuiz.resmueid} does not belong to user {generateQuiz.userid}.");
                }

                // Validation 5: Check if resume has content
                if (string.IsNullOrWhiteSpace(resume.ParsedText))
                {
                    throw new InvalidDataException($"Resume with ID {generateQuiz.resmueid} has no content to generate quiz from.");
                }

                // Validation 7: Check if quiz already exists for this user, resume, and target job
                var allSessions = await _unitOfWork.InterviewSessions.GetAllAsync();
                var existingSession = allSessions.FirstOrDefault(s => 
                    s.UserId == generateQuiz.userid && 
                    s.ResumeId == generateQuiz.resmueid && 
                    !string.IsNullOrEmpty(s.QuestionsJson) && 
                    s.QuestionsJson.Contains(generateQuiz.targetJob, StringComparison.OrdinalIgnoreCase));

                if (existingSession != null)
                {
                    _logger.LogInformation("Quiz already exists for UserId {UserId}, ResumeId {ResumeId}, targetJob '{TargetJob}'", 
                        generateQuiz.userid, generateQuiz.resmueid, generateQuiz.targetJob);
                    throw new InvalidOperationException($"Quiz already exists for this user, resume, and target job '{generateQuiz.targetJob}'. Please use the existing quiz or delete it first.");
                }

                _logger.LogInformation("Generating quiz questions using Gemini API");
                string prompt = $@"
You are an AI interview assistant. Generate ONLY valid JSON without any explanations, markdown, or extra text.

Your task: Generate a professional multiple-choice interview quiz designed to evaluate the candidate's readiness for the target job.

Context:
- Candidate Resume: {resume.ParsedText}
- Target Job: {generateQuiz.targetJob}

Instructions:
1. Do NOT ask about the content of the resume directly (e.g., no questions like 'What did you write in your resume?' or 'Which project did you do?').
2. Instead, analyze the skills, tools, and experiences mentioned in the resume and use them to craft questions that test the candidate’s knowledge and ability in areas relevant to the target job.
3. Prioritize questions that align with the target job’s requirements, common technical challenges, and necessary skills.
4. Every question must evaluate a concept, technique, or competency important for the target job, not biographical details.
5. Each question should have 4 options (A, B, C, D) with only one correct answer.
6. Generate exactly 10 questions.

Return ONLY this JSON format (no markdown, no explanations):

{{
  ""targetJob"": ""{generateQuiz.targetJob}"",
  ""userId"": {generateQuiz.userid},
  ""resumeId"": {generateQuiz.resmueid},
  ""quiz"": [
    {{
      ""question"": ""What is your experience with programming languages?"",
      ""options"": {{
        ""A"": ""No experience"",
        ""B"": ""Basic knowledge"",
        ""C"": ""Intermediate level"",
        ""D"": ""Expert level""
      }},
      ""correctAnswer"": ""C""
    }}
  ]
}}
";

                string questions = await _geminiService.GenerateTextAsync(prompt);

                // Validation 7: Check if Gemini returned valid response
                if (string.IsNullOrWhiteSpace(questions))
                {
                    throw new InvalidOperationException("Gemini returned an empty response for quiz generation.");
                }

                _logger.LogInformation("Raw Gemini response length: {Length}", questions.Length);
                _logger.LogDebug("Raw Gemini response (first 500 chars): {Response}", 
                    questions.Length > 500 ? questions.Substring(0, 500) + "..." : questions);

                // Validation 8: Clean and validate the JSON from Gemini
                string cleanedQuestions = CleanJsonString(questions);
                
                _logger.LogInformation("Cleaned JSON length: {Length}", cleanedQuestions.Length);
                _logger.LogDebug("Cleaned JSON (first 500 chars): {Response}", 
                    cleanedQuestions.Length > 500 ? cleanedQuestions.Substring(0, 500) + "..." : cleanedQuestions);

                // Validate JSON format before saving
              
                    var testParse = System.Text.Json.JsonDocument.Parse(cleanedQuestions);
                    if (!testParse.RootElement.TryGetProperty("quiz", out var quizArray) ||
                        quizArray.GetArrayLength() == 0)
                    {
                        _logger.LogError("Parsed JSON missing quiz array or empty array");
                        throw new InvalidOperationException("Generated quiz does not contain valid questions.");
                    }
                    
                    _logger.LogInformation("JSON validation successful, quiz contains {Count} questions", quizArray.GetArrayLength());
                    testParse.Dispose();
                
                
                var interviewSession = new InterviewSession
                {
                    UserId = generateQuiz.userid,
                    ResumeId = generateQuiz.resmueid,
                    QuestionsJson = cleanedQuestions,
                    Score = 0,
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.InterviewSessions.AddAsync(interviewSession);
                
                _logger.LogInformation("Interview session added to context, saving to database");
                
                await _unitOfWork.SaveChangesAsync();
                

                _logger.LogInformation("Quiz generated and saved successfully for UserId {UserId}, ResumeId {ResumeId}, SessionId {SessionId}", 
                    generateQuiz.userid, generateQuiz.resmueid, interviewSession.Id);
                return interviewSession.Id;

            }
            catch (Exception ex) when (!(ex is ArgumentException || ex is KeyNotFoundException || ex is InvalidDataException || ex is InvalidOperationException))
            {
                _logger.LogError(ex, "Unexpected error during quiz generation for UserId {UserId}, ResumeId {ResumeId}", generateQuiz.userid, generateQuiz.resmueid);
                throw new InvalidOperationException($"An unexpected error occurred during quiz generation: {ex.Message}", ex);
            }
        }

        public async Task evaluateAnswers(userAnswersDTO userAnswers)
        {
            try
            {
                if (userAnswers == null)
                {
                    throw new ArgumentNullException(nameof(userAnswers), "User answers cannot be null.");
                }
                if (userAnswers.Answers == null)
                {
                    throw new ArgumentNullException(nameof(userAnswers.Answers), "Answers list cannot be null.");
                }

                _logger.LogInformation("Starting evaluation for session {SessionId}", userAnswers.resumeId);

                var session = await _unitOfWork.InterviewSessions.FindAsync(s=>s.ResumeId == userAnswers.resumeId && s.UserId == userAnswers.userId && s.Id == userAnswers.sessionId);
                if (session == null)
                {
                    throw new KeyNotFoundException($"Interview session with ID {userAnswers.resumeId} not found.");
                }

                if (string.IsNullOrWhiteSpace(session.QuestionsJson))
                {
                    throw new InvalidDataException($"Session {userAnswers.resumeId} has no questions to evaluate against.");
                }

                var questionsJson = session.QuestionsJson;
                
                // Clean the JSON in case it has formatting issues
                string cleanedJson = CleanJsonString(questionsJson);
                
                _logger.LogDebug("Original JSON length: {Original}, Cleaned JSON length: {Cleaned}", 
                    questionsJson.Length, cleanedJson.Length);

                // Parse the JSON to extract correct answers
                System.Text.Json.JsonElement quizData;
                try
                {
                    quizData = System.Text.Json.JsonSerializer.Deserialize<System.Text.Json.JsonElement>(cleanedJson);
                }
                catch (System.Text.Json.JsonException ex)
                {
                    _logger.LogError(ex, "Failed to parse questions JSON for session {SessionId}. JSON: {Json}", 
                        userAnswers.resumeId, questionsJson.Length > 100 ? questionsJson.Substring(0, 100) + "..." : questionsJson);
                    throw new InvalidDataException($"Session {userAnswers.resumeId} contains malformed JSON questions. Please regenerate the quiz.");
                }

                if (!quizData.TryGetProperty("quiz", out var quizArrayElement))
                {
                    throw new InvalidDataException($"Session {userAnswers.resumeId} questions JSON is missing 'quiz' property.");
                }

                var quizArray = quizArrayElement.EnumerateArray().ToList();

                if (userAnswers.Answers.Count != quizArray.Count)
                {
                    throw new ArgumentException($"Number of user answers ({userAnswers.Answers.Count}) does not match number of questions ({quizArray.Count}).");
                }

                int correctAnswers = 0;

                for (int i = 0; i < userAnswers.Answers.Count; i++)
                {
                    var question = quizArray[i];
                    
                    if (!question.TryGetProperty("correctAnswer", out var correctAnswerProp))
                    {
                        _logger.LogWarning("Question {QuestionIndex} missing correctAnswer property", i);
                        continue;
                    }

                    var correctAnswer = correctAnswerProp.GetString();
                    var userAnswer = userAnswers.Answers[i]?.Trim().ToUpperInvariant();

                    if (string.Equals(correctAnswer, userAnswer, StringComparison.OrdinalIgnoreCase))
                    {
                        correctAnswers++;
                    }

                    _logger.LogDebug("Question {Index}: User={UserAnswer}, Correct={CorrectAnswer}, Match={IsMatch}", 
                        i + 1, userAnswer, correctAnswer, string.Equals(correctAnswer, userAnswer, StringComparison.OrdinalIgnoreCase));
                }

                // Calculate final score as percentage
                double finalScore = (double)correctAnswers / userAnswers.Answers.Count * 100;
                session.Score = Math.Round(finalScore, 2); // number in prcentange 
                Console.WriteLine(session.Score);
                await _unitOfWork.InterviewSessions.Update(session);
                await _unitOfWork.SaveChangesAsync();

                _logger.LogInformation("Evaluation completed for session {SessionId}. Score: {Score}% ({Correct}/{Total})", 
                    userAnswers.resumeId, session.Score, correctAnswers, userAnswers.Answers.Count);
            }
            catch (Exception ex) when (!(ex is ArgumentNullException || ex is ArgumentException || ex is KeyNotFoundException || ex is InvalidDataException))
            {
                _logger.LogError(ex, "Unexpected error during answer evaluation for session {SessionId}", userAnswers?.resumeId);
                throw new InvalidOperationException($"An unexpected error occurred during answer evaluation: {ex.Message}", ex);
            }
        }
        private string CleanJsonString(string jsonString)
        {
            if (string.IsNullOrWhiteSpace(jsonString))
                return jsonString;

            // Remove any markdown code block markers
            jsonString = jsonString.Trim();
            if (jsonString.StartsWith("```json"))
            {
                jsonString = jsonString.Substring(7);
            }
            else if (jsonString.StartsWith("```"))
            {
                jsonString = jsonString.Substring(3);
            }
            
            if (jsonString.EndsWith("```"))
            {
                jsonString = jsonString.Substring(0, jsonString.Length - 3);
            }

            // Replace backticks with double quotes (common Gemini issue)
            jsonString = jsonString.Replace('`', '"');
            
            // Fix common single quote issues but be careful not to break strings
            jsonString = Regex.Replace(jsonString, @"'([^']*)':", @"""$1"":");
            jsonString = Regex.Replace(jsonString, @":\s*'([^']*)'", @": ""$1""");
            
            // Remove any leading/trailing whitespace
            jsonString = jsonString.Trim();

            return jsonString;
        }
        public async Task<object> getQuestions(InterviewQuestionDTO interviewQuestionDTO)
        {
            try
            {
                // Parameter validation
                if (interviewQuestionDTO == null)
                {
                    throw new ArgumentNullException(nameof(interviewQuestionDTO), "Interview question request cannot be null.");
                }

                if (interviewQuestionDTO.userId <= 0)
                {
                    throw new ArgumentException("User ID must be greater than zero.", nameof(interviewQuestionDTO.userId));
                }

                if (interviewQuestionDTO.resumeId <= 0)
                {
                    throw new ArgumentException("Resume ID must be greater than zero.", nameof(interviewQuestionDTO.resumeId));
                }

                _logger.LogInformation("Retrieving questions for UserId {UserId}, ResumeId {ResumeId}", 
                    interviewQuestionDTO.userId, interviewQuestionDTO.resumeId);

                // Check if user exists
                var user = await _unitOfWork.Users.GetByIdAsync(interviewQuestionDTO.userId);
                if (user == null)
                {
                    _logger.LogWarning("User with ID {UserId} not found", interviewQuestionDTO.userId);
                    throw new KeyNotFoundException($"User with ID {interviewQuestionDTO.userId} not found.");
                }

                // Check if resume exists
                var resume = await _unitOfWork.Resumes.GetByIdAsync(interviewQuestionDTO.resumeId);
                if (resume == null)
                {
                    _logger.LogWarning("Resume with ID {ResumeId} not found", interviewQuestionDTO.resumeId);
                    throw new KeyNotFoundException($"Resume with ID {interviewQuestionDTO.resumeId} not found.");
                }

                // Check if resume belongs to the user
                if (resume.UserId != interviewQuestionDTO.userId)
                {
                    _logger.LogWarning("Resume {ResumeId} does not belong to user {UserId}", 
                        interviewQuestionDTO.resumeId, interviewQuestionDTO.userId);
                    throw new UnauthorizedAccessException($"Resume with ID {interviewQuestionDTO.resumeId} does not belong to user {interviewQuestionDTO.userId}.");
                }

                // Find the interview session
                var questionsSession = await _unitOfWork.InterviewSessions.FindAsync(q => 
                    q.UserId == interviewQuestionDTO.userId && 
                    q.ResumeId == interviewQuestionDTO.resumeId && q.Id == interviewQuestionDTO.sessionId);

                if (questionsSession == null)
                {
                    _logger.LogWarning("No interview session found for UserId {UserId}, ResumeId {ResumeId}", 
                        interviewQuestionDTO.userId, interviewQuestionDTO.resumeId);
                    throw new KeyNotFoundException($"No interview session found for user {interviewQuestionDTO.userId} and resume {interviewQuestionDTO.resumeId}. Please generate a quiz first.");
                }

                // Check if session has questions
                if (string.IsNullOrWhiteSpace(questionsSession.QuestionsJson))
                {
                    _logger.LogWarning("Interview session {SessionId} has no questions", questionsSession.Id);
                    throw new InvalidDataException($"Interview session {questionsSession.Id} has no questions. Please regenerate the quiz.");
                }

                _logger.LogDebug("Found interview session {SessionId} with questions", questionsSession.Id);

                // Clean and validate the JSON
                var cleanedJson = CleanJsonString(questionsSession.QuestionsJson);
                
                if (string.IsNullOrWhiteSpace(cleanedJson))
                {
                    _logger.LogError("Cleaned JSON is empty for session {SessionId}", questionsSession.Id);
                    throw new InvalidDataException($"Interview session {questionsSession.Id} contains invalid questions data.");
                }

                // Validate JSON structure
                try
                {
                    var jsonDocument = System.Text.Json.JsonDocument.Parse(cleanedJson);
                    
                    if (!jsonDocument.RootElement.TryGetProperty("quiz", out var quizArray))
                    {
                        jsonDocument.Dispose();
                        throw new InvalidDataException($"Interview session {questionsSession.Id} questions are missing the 'quiz' property.");
                    }

                    if (quizArray.GetArrayLength() == 0)
                    {
                        jsonDocument.Dispose();
                        throw new InvalidDataException($"Interview session {questionsSession.Id} has no questions in the quiz array.");
                    }

                    _logger.LogInformation("Successfully retrieved {QuestionCount} questions for UserId {UserId}, ResumeId {ResumeId}", 
                        quizArray.GetArrayLength(), interviewQuestionDTO.userId, interviewQuestionDTO.resumeId);
                    
                    jsonDocument.Dispose();
                    
                    return cleanedJson;
                }
                catch (System.Text.Json.JsonException ex)
                {
                    _logger.LogError(ex, "Invalid JSON format in session {SessionId} questions", questionsSession.Id);
                    throw new InvalidDataException($"Interview session {questionsSession.Id} contains malformed questions data. Please regenerate the quiz.");
                }
            }
            catch (Exception ex) when (!(ex is ArgumentNullException || ex is ArgumentException || 
                                 ex is KeyNotFoundException || ex is UnauthorizedAccessException || 
                                 ex is InvalidDataException))
            {
                _logger.LogError(ex, "Unexpected error retrieving questions for UserId {UserId}, ResumeId {ResumeId}", 
                    interviewQuestionDTO?.userId, interviewQuestionDTO?.resumeId);
                throw new InvalidOperationException($"An unexpected error occurred while retrieving questions: {ex.Message}", ex);
            }
        }
        private string ExtractJsonFromText(string text)
        {
            if (string.IsNullOrWhiteSpace(text))
                return string.Empty;

            // Look for JSON object starting with { and ending with }
            var match = Regex.Match(text, @"\{.*\}", RegexOptions.Singleline | RegexOptions.IgnoreCase);
            if (match.Success)
            {
                return CleanJsonString(match.Value);
            }

            return string.Empty;
        }

        public  async Task<InterviewSession> getLastestQuiz(int userid)
        {
            var latest = await _unitOfWork.InterviewSessions.GetLatestByUserIdAsync(userid);
            return (latest);
        }

        public async Task<IEnumerable<InterviewSession>> getAllQuizzes(int userid)
        {
            IEnumerable<InterviewSession> all = await _unitOfWork.InterviewSessions.GetAllByUserIdAnalysisAsync(userid);
            return (all);
        }
    }
}
