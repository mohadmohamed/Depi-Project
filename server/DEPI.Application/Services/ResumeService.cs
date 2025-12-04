using DEPI.Application.Contracts;
using DEPI.Application.DTOs;
using DEPI.Application.Services;
using DEPI.DataAccess.Contracts;
using DEPI.DataAccess.Entites;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using UglyToad.PdfPig;

public class ResumeService : IResumeService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IGeminiService _geminiService;
    private readonly ILogger<ResumeService> _logger;

    public ResumeService(IUnitOfWork unitOfWork, IGeminiService geminiService, ILogger<ResumeService> logger)
    {
        _unitOfWork = unitOfWork;
        _geminiService = geminiService;
        _logger = logger;
    }

    public async Task<int> UploadResumeAsync(UploadResumeDTO upload)
    {
        try
        {
            // Validation 1: Check if DTO is null
            if (upload == null)
            {
                throw new ArgumentNullException(nameof(upload), "Upload request cannot be null.");
            }

            // Validation 2: Check if userId is valid
            if (upload.userId <= 0)
            {
                throw new ArgumentException("User ID must be greater than zero.", nameof(upload.userId));
            }

            // Validation 3: Check if file is provided
            if (upload.file == null || upload.file.Length == 0)
            {
                throw new ArgumentException("Invalid or empty file.", nameof(upload.file));
            }

            // Validation 4: Check if user exists
            var user = await _unitOfWork.Users.GetByIdAsync(upload.userId);
            if (user == null)
            {
                throw new KeyNotFoundException($"User with ID {upload.userId} not found.");
            }

            // Validation 5: Check file size (10MB limit)
            const long maxFileSize = 10 * 1024 * 1024; // 10MB
            if (upload.file.Length > maxFileSize)
            {
                throw new ArgumentException($"File size ({upload.file.Length:N0} bytes) exceeds the maximum allowed size of {maxFileSize:N0} bytes.");
            }

            // Validation 6: Check file extension
            var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".txt" };
            var fileExtension = Path.GetExtension(upload.file.FileName)?.ToLowerInvariant();
            
            if (string.IsNullOrEmpty(fileExtension) || !allowedExtensions.Contains(fileExtension))
            {
                throw new ArgumentException($"File type '{fileExtension}' is not supported. Allowed types: {string.Join(", ", allowedExtensions)}");
            }

            _logger.LogInformation("Starting file upload for user {UserId}, file: {FileName}", upload.userId, upload.file.FileName);

            using var memoryStream = new MemoryStream();
            await upload.file.CopyToAsync(memoryStream);
            memoryStream.Position = 0;

            string parsedText = ExtractTextFromPdf(memoryStream);

            if (string.IsNullOrWhiteSpace(parsedText))
                throw new InvalidDataException("No readable text found in the uploaded PDF.");

            var resume = new Resume
            {
                UserId = upload.userId,
                FilePath = upload.file.FileName, // Store original filename
                ParsedText = parsedText,
                UploadedAt = DateTime.UtcNow
            };

            // Check for duplicate content
            var existingResume = await _unitOfWork.Resumes.FindAsync(r => r.UserId == upload.userId && r.ParsedText == parsedText);
            
            if (existingResume != null)
            {
                throw new InvalidOperationException($"This resume already exists for user with ID {upload.userId}. Please upload a different CV.");
            }

            await _unitOfWork.Resumes.AddAsync(resume);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Resume uploaded and parsed for UserId {UserId}, ResumeId {ResumeId}", upload.userId, resume.Id);

            return resume.Id;
        }
        catch (Exception ex) when (!(ex is ArgumentNullException || ex is ArgumentException || ex is KeyNotFoundException || ex is InvalidDataException || ex is InvalidOperationException))
        {
            _logger.LogError(ex, "Unexpected error during resume upload for UserId {UserId}", upload?.userId ?? 0);
            throw new InvalidOperationException($"An unexpected error occurred during resume upload: {ex.Message}", ex);
        }
    }

    public async Task AnalyzeResumeAsync(AnalyzeResumeRequestDTO analyzeResume)
    {
        // Validation 1: Check if resumeId is valid
        if (analyzeResume.ResumeId <= 0)
            throw new ArgumentException("Resume ID must be greater than zero.", nameof(analyzeResume.ResumeId));

        // Validation 2: Check if targetJob is provided and not empty
        if (string.IsNullOrWhiteSpace(analyzeResume.TargetJob))
            throw new ArgumentException("Target job cannot be null or empty.", nameof(analyzeResume.ResumeId));

        // Validation 3: Check if resume exists
        var resume = await _unitOfWork.Resumes.GetByIdAsync(analyzeResume.ResumeId);
        if (resume == null)
            throw new KeyNotFoundException($"Resume with ID {analyzeResume.ResumeId} not found.");

        // Validation 4: Check if the associated user exists
        var user = await _unitOfWork.Users.GetByIdAsync(resume.UserId);
        if (user == null)
        {
            _logger.LogWarning("Resume {ResumeId} belongs to non-existent user {UserId}", analyzeResume.ResumeId, resume.UserId);
            throw new KeyNotFoundException($"User associated with resume ID {analyzeResume.ResumeId} not found.");
        }

        // Validation 5: Check if resume has content to analyze
        if (string.IsNullOrWhiteSpace(resume.ParsedText))
        {
            throw new InvalidDataException($"Resume with ID {analyzeResume.ResumeId} has no content to analyze.");
        }

        // Validation 6: Enhanced check - see if this user has already analyzed this resume for this target job
        var allUserResumes = await _unitOfWork.Resumes.GetAllAsync();
        var userResumes = allUserResumes.Where(r => r.UserId == resume.UserId).ToList();
        
        foreach (var userResume in userResumes)
        {
            var allAnalyses = await _unitOfWork.ResumeAnalysis.GetAllAsync();
            var resumeAnalyses = allAnalyses.Where(ra => ra.ResumeId == userResume.Id).ToList();
            
            foreach (var analysis in resumeAnalyses)
            {
                // Check if the analysis contains the target job (more sophisticated check)
                if (!string.IsNullOrEmpty(analysis.FeedbackJson))
                {
                    try
                    {
                        var jsonDoc = System.Text.Json.JsonDocument.Parse(analysis.FeedbackJson);
                        // You could store target job in the JSON or check content
                        // For now, we'll check if it contains the target job in a structured way
                        var jsonString = analysis.FeedbackJson.ToLower();
                        var targetJobLower = analyzeResume.TargetJob.ToLower();
                        
                        // More sophisticated matching - check for exact job title matches
                        if (jsonString.Contains($"target job title: **{targetJobLower}**") || 
                            jsonString.Contains($"\"targetJob\":\"{targetJobLower}\"") ||
                            jsonString.Contains(targetJobLower))
                        {
                            _logger.LogInformation("User {UserId} has already analyzed a resume for target job '{TargetJob}'", 
                                resume.UserId, analyzeResume.TargetJob);
                            throw new InvalidOperationException(
                                $"User has already analyzed a resume for the target job '{analyzeResume.TargetJob}'. " +
                                $"Previous analysis found for resume ID {userResume.Id}. " +
                                "Please use the existing analysis or delete it first.");
                        }
                        jsonDoc.Dispose();
                    }
                    catch (System.Text.Json.JsonException)
                    {
                        // If JSON parsing fails, fall back to simple string search
                        if (analysis.FeedbackJson.Contains(analyzeResume.TargetJob, StringComparison.OrdinalIgnoreCase))
                        {
                            throw new InvalidOperationException(
                                $"User has already analyzed a resume for a similar target job. " +
                                "Please review existing analyses first.");
                        }
                    }
                }
            }
        }

        _logger.LogInformation("Starting resume analysis for ResumeId {ResumeId}, UserId {UserId}, target job '{TargetJob}'", 
            analyzeResume.ResumeId, resume.UserId, analyzeResume.TargetJob);

        try
        {
            var prompt = $@"
Analyze this resume and return JSON with the following fields:
- summary
- keySkills
- education
- experience

Resume content:
{resume.ParsedText}";

            string analysisResult = await _geminiService.GenerateTextAsync(prompt);
            
            // Validation 7: Check if first analysis result is valid
            if (string.IsNullOrWhiteSpace(analysisResult))
                throw new InvalidOperationException("Gemini returned an empty response for resume analysis.");

            string prompt2 = $@"
You are a CV analysis service. Your task is to analyze the following CV data for the target job title: **{analyzeResume.TargetJob}**.

CV DATA:
{analysisResult}

REQUIRED RESPONSE:
You MUST respond with **only** a single, valid JSON object. Do not add any text, notes, or markdown (like ```json) before or after the JSON block.

The JSON object MUST follow this exact schema and include the target job for future reference:
{{
  ""targetJob"": ""{analyzeResume.TargetJob}"",
  ""analyzedForUser"": {resume.UserId},
  ""overallScore"": {{
    ""score"": <number_out_of_100>,
    ""summary"": ""<2-3 sentence summary explaining the score>""
  }},
  ""keyStrengths"": [
    ""<Strength 1: string>"",
    ""<Strength 2: string>""
  ],
  ""criticalGaps"": [
    ""<Gap 1: string>"",
    ""<Gap 2: string>""
  ],
  ""recommendations"": {{
    ""summary"": ""<Actionable advice for the 'summary' section>"",
    ""skills"": ""<Actionable advice for the 'skills' section>"",
    ""experience"": ""<Actionable advice for the 'experience' section>""
  }},
  ""finalVerdict"": {{
    ""hireDecision"": ""<Interview / No Interview>"",
    ""reasoning"": ""<Brief justification for the decision>""
  }}
}}
";

            string analyzedCv = await _geminiService.GenerateTextAsync(prompt2);
            
            // Validation 8: Check if final analysis result is valid
            if (string.IsNullOrWhiteSpace(analyzedCv))
                throw new InvalidOperationException("Gemini returned an empty response for detailed analysis.");

            var resumeAnalysis = new ResumeAnalysis
            {
                ResumeId = resume.Id,
                UserId = resume.UserId, // Add the missing UserId
                FeedbackJson = analyzedCv,
                AnalyzedAt = DateTime.UtcNow
            };

            await _unitOfWork.ResumeAnalysis.AddAsync(resumeAnalysis);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Resume analysis completed successfully for ResumeId {ResumeId}, target job '{TargetJob}'", 
                analyzeResume.ResumeId, analyzeResume.TargetJob);
        }
        catch (Exception ex) when (!(ex is ArgumentException || ex is KeyNotFoundException || ex is InvalidDataException || ex is InvalidOperationException))
        {
            _logger.LogError(ex, "Unexpected error during resume analysis for ResumeId {ResumeId}", analyzeResume.ResumeId);
            throw new InvalidOperationException($"An unexpected error occurred during resume analysis: {ex.Message}", ex);
        }
    }

    public async Task RemoveResume(int resumeId)
    {
        // Add validation similar to other methods
        if (resumeId <= 0)
            throw new ArgumentException("Resume ID must be greater than zero.", nameof(resumeId));

        var Resume = await _unitOfWork.Resumes.FindAsync(r => r.Id == resumeId);
        if (Resume == null)
        {
            throw new KeyNotFoundException($"Resume with ID {resumeId} does not exist.");
        }

        // Check if user exists (optional validation for consistency)
        var user = await _unitOfWork.Users.GetByIdAsync(Resume.UserId);
        if (user == null)
        {
            _logger.LogWarning("Attempting to delete resume {ResumeId} for non-existent user {UserId}", resumeId, Resume.UserId);
        }

        await _unitOfWork.Resumes.DeleteAsync(resumeId);
        await _unitOfWork.SaveChangesAsync();
        
        _logger.LogInformation("Resume {ResumeId} removed successfully", resumeId);
    }

    private string ExtractTextFromPdf(Stream pdfStream)
    {
        using var pdf = PdfDocument.Open(pdfStream);
        var builder = new System.Text.StringBuilder();

        foreach (var page in pdf.GetPages())
        {
            builder.AppendLine(page.Text);
        }

        return builder.ToString();
    }

    public async Task<object> getResumeIdByUser(int userid)
    {
        var Resume = await _unitOfWork.Resumes.GetAllByUserIdAsync(userid);
        return Resume;
    }
    public async Task<ResumeAnalysis> getAnalysisByResumeId(int userid , int resumeid)
    {
        var analysis = await _unitOfWork.ResumeAnalysis.FindAsync(r=>r.UserId == userid && r.ResumeId == resumeid);
        if (analysis == null)
        {
            throw new KeyNotFoundException($"Analysis for Resume with ID {userid} does not exist.");
        }
        return analysis;
    }

    public async Task<ResumeAnalysis> getLatestAnalysis(int userid)
    {
        var analysis = await _unitOfWork.ResumeAnalysis.GetLatestByUserIdAsync(userid);
        return analysis;
    }

    public async Task<ResumeAnalysis> getLatestAnalysisByUserId(int userid)
    {
        var analysis = await _unitOfWork.ResumeAnalysis.GetLatestByUserIdAsync(userid);
        return analysis;
    }
}
