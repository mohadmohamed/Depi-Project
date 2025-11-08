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

        public async Task generateQuiz(int userId, int ResumeId, string targetJob)
        {
            try
            {
                // Validation 1: Check if parameters are valid
                if (userId <= 0)
                    throw new ArgumentException("User ID must be greater than zero.", nameof(userId));

                if (ResumeId <= 0)
                    throw new ArgumentException("Resume ID must be greater than zero.", nameof(ResumeId));

                if (string.IsNullOrWhiteSpace(targetJob))
                    throw new ArgumentException("Target job cannot be null or empty.", nameof(targetJob));

                _logger.LogInformation("Starting quiz generation for UserId {UserId}, ResumeId {ResumeId}, targetJob '{TargetJob}'", 
                    userId, ResumeId, targetJob);

                // Validation 2: Check if user exists
                var user = await _unitOfWork.Users.GetByIdAsync(userId);
                if (user == null)
                {
                    _logger.LogWarning("User with ID {UserId} not found", userId);
                    throw new KeyNotFoundException($"User with ID {userId} not found.");
                }

                // Validation 3: Check if resume exists
                var resume = await _unitOfWork.Resumes.GetByIdAsync(ResumeId);
                if (resume == null)
                {
                    _logger.LogWarning("Resume with ID {ResumeId} not found", ResumeId);
                    throw new KeyNotFoundException($"Resume with ID {ResumeId} not found.");
                }

                // Validation 4: Check if resume belongs to the user
                if (resume.UserId != userId)
                {
                    _logger.LogWarning("Resume {ResumeId} does not belong to user {UserId}", ResumeId, userId);
                    throw new InvalidOperationException($"Resume with ID {ResumeId} does not belong to user {userId}.");
                }

                // Validation 5: Check if resume has content
                if (string.IsNullOrWhiteSpace(resume.ParsedText))
                {
                    throw new InvalidDataException($"Resume with ID {ResumeId} has no content to generate quiz from.");
                }

                // Validation 6: Check if quiz already exists for this user, resume, and target job
                var allSessions = await _unitOfWork.InterviewSessions.GetAllAsync();
                var existingSession = allSessions.FirstOrDefault(s => 
                    s.UserId == userId && 
                    s.ResumeId == ResumeId && 
                    !string.IsNullOrEmpty(s.QuestionsJson) && 
                    s.QuestionsJson.Contains(targetJob, StringComparison.OrdinalIgnoreCase));

                if (existingSession != null)
                {
                    _logger.LogInformation("Quiz already exists for UserId {UserId}, ResumeId {ResumeId}, targetJob '{TargetJob}'", 
                        userId, ResumeId, targetJob);
                    throw new InvalidOperationException($"Quiz already exists for this user, resume, and target job '{targetJob}'. Please use the existing quiz or delete it first.");
                }

                _logger.LogInformation("Generating quiz questions using Gemini API");

                string prompt = $@"
You are an AI interview assistant. Generate ONLY valid JSON without any explanations, markdown, or extra text.

Based on this information:
- Candidate Resume: {resume.ParsedText}
- Target Job: {targetJob}

Generate exactly 10 multiple-choice questions for interview assessment.

Return ONLY this JSON format (no markdown, no explanations):
{{
  ""targetJob"": ""{targetJob}"",
  ""userId"": {userId},
  ""resumeId"": {ResumeId},
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
                try
                {
                    var testParse = System.Text.Json.JsonDocument.Parse(cleanedQuestions);
                    if (!testParse.RootElement.TryGetProperty("quiz", out var quizArray) ||
                        quizArray.GetArrayLength() == 0)
                    {
                        _logger.LogError("Parsed JSON missing quiz array or empty array");
                        throw new InvalidOperationException("Generated quiz does not contain valid questions.");
                    }
                    
                    _logger.LogInformation("JSON validation successful, quiz contains {Count} questions", quizArray.GetArrayLength());
                    testParse.Dispose();
                }
                catch (System.Text.Json.JsonException ex)
                {
                    _logger.LogError(ex, "JSON parsing failed. Original response: {Original}, Cleaned: {Cleaned}", 
                        questions, cleanedQuestions);
                    
                    // Try alternative cleaning approach
                    string alternativeCleaned = ExtractJsonFromText(questions);
                    if (!string.IsNullOrEmpty(alternativeCleaned) && alternativeCleaned != cleanedQuestions)
                    {
                        try
                        {
                            var altParse = System.Text.Json.JsonDocument.Parse(alternativeCleaned);
                            if (altParse.RootElement.TryGetProperty("quiz", out var altQuizArray) &&
                                altQuizArray.GetArrayLength() > 0)
                            {
                                _logger.LogInformation("Alternative JSON extraction successful");
                                cleanedQuestions = alternativeCleaned;
                                altParse.Dispose();
                            }
                            else
                            {
                                altParse.Dispose();
                                throw new InvalidOperationException("Alternative JSON extraction failed - no valid quiz found.");
                            }
                        }
                        catch (System.Text.Json.JsonException)
                        {
                            throw new InvalidOperationException($"Gemini returned invalid JSON format. Raw response: {questions}");
                        }
                    }
                    else
                    {
                        throw new InvalidOperationException($"Gemini returned invalid JSON format that could not be cleaned. Raw response: {questions}");
                    }
                }

                var interviewSession = new InterviewSession
                {
                    UserId = userId,
                    ResumeId = ResumeId,
                    QuestionsJson = cleanedQuestions,
                    Score = 0,
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.InterviewSessions.AddAsync(interviewSession);
                
                _logger.LogInformation("Interview session added to context, saving to database");
                
                await _unitOfWork.SaveChangesAsync();

                _logger.LogInformation("Quiz generated and saved successfully for UserId {UserId}, ResumeId {ResumeId}, SessionId {SessionId}", 
                    userId, ResumeId, interviewSession.Id);
            }
            catch (Exception ex) when (!(ex is ArgumentException || ex is KeyNotFoundException || ex is InvalidDataException || ex is InvalidOperationException))
            {
                _logger.LogError(ex, "Unexpected error during quiz generation for UserId {UserId}, ResumeId {ResumeId}", userId, ResumeId);
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

                _logger.LogInformation("Starting evaluation for session {SessionId}", userAnswers.sessionid);

                var session = await _unitOfWork.InterviewSessions.GetByIdAsync(userAnswers.sessionid);
                if (session == null)
                {
                    throw new KeyNotFoundException($"Interview session with ID {userAnswers.sessionid} not found.");
                }

                if (string.IsNullOrWhiteSpace(session.QuestionsJson))
                {
                    throw new InvalidDataException($"Session {userAnswers.sessionid} has no questions to evaluate against.");
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
                        userAnswers.sessionid, questionsJson.Length > 100 ? questionsJson.Substring(0, 100) + "..." : questionsJson);
                    throw new InvalidDataException($"Session {userAnswers.sessionid} contains malformed JSON questions. Please regenerate the quiz.");
                }

                if (!quizData.TryGetProperty("quiz", out var quizArrayElement))
                {
                    throw new InvalidDataException($"Session {userAnswers.sessionid} questions JSON is missing 'quiz' property.");
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

                await _unitOfWork.InterviewSessions.Update(session);
                await _unitOfWork.SaveChangesAsync();

                _logger.LogInformation("Evaluation completed for session {SessionId}. Score: {Score}% ({Correct}/{Total})", 
                    userAnswers.sessionid, session.Score, correctAnswers, userAnswers.Answers.Count);
            }
            catch (Exception ex) when (!(ex is ArgumentNullException || ex is ArgumentException || ex is KeyNotFoundException || ex is InvalidDataException))
            {
                _logger.LogError(ex, "Unexpected error during answer evaluation for session {SessionId}", userAnswers?.sessionid);
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

        /// <summary>
        /// Attempts to extract JSON from text that might contain other content
        /// </summary>
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
    }
}
