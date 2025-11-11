using DEPI.Application.Contracts;
using DEPI.Application.DTOs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

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
        public async Task<IActionResult> GenerateInterview([FromForm] int userid, [FromForm] int resumeid, [FromQuery] string targetJob)
        {
            try
            {
                await _interviewService.generateQuiz(userid, resumeid, targetJob);

                return Ok(new { Message = "Interview quiz generated successfully", UserId = userid, ResumeId = resumeid, TargetJob = targetJob });
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
                var questions = await _interviewService.getQuestions(interviewQuestionDTO);
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
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during fetching questions");
                return StatusCode(500, new
                {
                    Error = "An unexpected error occurred during fetching questions",
                    Details = ex.Message
                });
            }
        }
    }
}
