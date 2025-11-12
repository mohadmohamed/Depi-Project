using DEPI.Application.Contracts;
using DEPI.Application.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.IO;

namespace DEPI.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InterviewController : ControllerBase
    {
        private readonly IinterviewService _interviewService;
        private readonly ILogger<InterviewController> _logger;

        public InterviewController(IinterviewService interviewService, ILogger<InterviewController> logger)
        {
            _interviewService = interviewService ?? throw new ArgumentNullException(nameof(interviewService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpPost("generate")]
        public async Task<IActionResult> GenerateInterview([FromForm] GenerateQuizDTO generateQuiz)
        {
            try
            {
                // Validate the DTO
                if (generateQuiz == null)
                {
                    _logger.LogWarning("GenerateQuizDTO is null");
                    return BadRequest(new { Error = "Request body is required" });
                }

                // Validate individual fields
                if (generateQuiz.userid <= 0)
                {
                    _logger.LogWarning("Invalid userid provided: {UserId}", generateQuiz.userid);
                    return BadRequest(new { Error = "User ID must be a positive integer" });
                }

                if (generateQuiz.resmueid <= 0)
                {
                    _logger.LogWarning("Invalid resumeid provided: {ResumeId}", generateQuiz.resmueid);
                    return BadRequest(new { Error = "Resume ID must be a positive integer" });
                }

                if (string.IsNullOrWhiteSpace(generateQuiz.targetJob))
                {
                    _logger.LogWarning("Target job is null or empty");
                    return BadRequest(new { Error = "Target job is required" });
                }

                _logger.LogInformation("Generating interview for UserId: {UserId}, ResumeId: {ResumeId}, TargetJob: {TargetJob}", 
                    generateQuiz.userid, generateQuiz.resmueid, generateQuiz.targetJob);

                int sessionId = await _interviewService.generateQuiz(generateQuiz);

                return Ok(new { 
                    Message = "Interview quiz generated successfully", 
                    SessionId = sessionId,
                    UserId = generateQuiz.userid, 
                    ResumeId = generateQuiz.resmueid, 
                    TargetJob = generateQuiz.targetJob 
                });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid parameters provided for interview generation");
                return BadRequest(new { Error = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Resource not found during interview generation");
                return NotFound(new { Error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation during interview generation");
                return Conflict(new { Error = ex.Message });
            }
            catch (InvalidDataException ex)
            {
                _logger.LogWarning(ex, "Invalid data during interview generation");
                return BadRequest(new { Error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during interview generation");
                return StatusCode(500, new
                {
                    Error = "An unexpected error occurred during interview generation",
                    Details = ex.Message
                });
            }
        }
        [HttpPatch("evaluate")]
        public async Task<IActionResult> EvaluateAnswers([FromBody] userAnswersDTO userAnswers)
        {
            try
            {
                await _interviewService.evaluateAnswers(userAnswers);
                return Ok(new { Message = "Answers evaluated successfully" });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid parameters provided for answer evaluation");
                return BadRequest(new { Error = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Resource not found during answer evaluation");
                return NotFound(new { Error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation during answer evaluation");
                return Conflict(new { Error = ex.Message });
            }
            catch (InvalidDataException ex)
            {
                _logger.LogWarning(ex, "Invalid data during answer evaluation");
                return BadRequest(new { Error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during answer evaluation");
                return StatusCode(500, new
                {
                    Error = "An unexpected error occurred during answer evaluation",
                    Details = ex.Message
                });
            }
        }
        [HttpGet("questions")]
        public async Task<IActionResult> GetQuestions([FromQuery] InterviewQuestionDTO interviewQuestionDTO)
        {
            try
            {
                // Validate the DTO itself
                if (interviewQuestionDTO == null)
                {
                    _logger.LogWarning("InterviewQuestionDTO is null");
                    return BadRequest(new { Error = "Request parameters are required" });
                }

                // Validate userId parameter
                if (interviewQuestionDTO.userId <= 0)
                {
                    _logger.LogWarning("Invalid userId provided: {UserId}", interviewQuestionDTO.userId);
                    return BadRequest(new { Error = "User ID must be a positive integer" });
                }

                // Validate resumeId parameter
                if (interviewQuestionDTO.resumeId <= 0)
                {
                    _logger.LogWarning("Invalid resumeId provided: {ResumeId}", interviewQuestionDTO.resumeId);
                    return BadRequest(new { Error = "Resume ID must be a positive integer" });
                }

                _logger.LogInformation("Fetching questions for UserId: {UserId}, ResumeId: {ResumeId}", 
                    interviewQuestionDTO.userId, interviewQuestionDTO.resumeId);

                var questions = await _interviewService.getQuestions(interviewQuestionDTO);
                
                if (questions == null)
                {
                    _logger.LogWarning("No questions found for UserId: {UserId}, ResumeId: {ResumeId}", 
                        interviewQuestionDTO.userId, interviewQuestionDTO.resumeId);
                    return NotFound(new { Error = "No interview questions found for the specified user and resume" });
                }

                return Ok(questions);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid parameters provided for fetching questions");
                return BadRequest(new { Error = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Resource not found during fetching questions");
                return NotFound(new { Error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Invalid operation during fetching questions");
                return Conflict(new { Error = ex.Message });
            }
            catch (InvalidDataException ex)
            {
                _logger.LogWarning(ex, "Invalid data during fetching questions");
                return BadRequest(new { Error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during fetching questions for UserId: {UserId}, ResumeId: {ResumeId}", 
                    interviewQuestionDTO?.userId ?? 0, interviewQuestionDTO?.resumeId ?? 0);
                return StatusCode(500, new
                {
                    Error = "An unexpected error occurred during fetching questions",
                    Details = ex.Message
                });
            }
        }
        [HttpGet("id")]
        public async Task<IActionResult> getLatestQuiz([FromQuery]int userid)
        {
            var latestQuiz = await _interviewService.getLastestQuiz(userid);
            Console.WriteLine(latestQuiz);
            return (Ok(latestQuiz));
        }
        [HttpGet("all")]
        public async Task<IActionResult> getAllQuizzes([FromQuery]int userid)
        {
            var allQuizzes = await _interviewService.getAllQuizzes(userid);
            Console.WriteLine(allQuizzes);
            return (Ok(allQuizzes));
        }
    }
}
