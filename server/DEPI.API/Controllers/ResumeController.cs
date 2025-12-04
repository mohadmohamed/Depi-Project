using DEPI.Application.Contracts;
using DEPI.Application.DTOs;
using DEPI.DataAccess.Entites;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;

namespace DEPI.API.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    public class ResumeController : ControllerBase
    {
        private readonly IResumeService _resumeService;
        public ResumeController(IResumeService resumeService)
        {
            _resumeService = resumeService;
        }
        [Authorize]
        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadResume([FromForm] UploadResumeDTO upload)
        {
            try
            {
                // Validation
                if (upload.userId <= 0)
                {
                    return BadRequest(new
                    {
                        Error = "Invalid user ID",
                        Details = "User ID must be a positive number"
                    });
                }

                if (upload.file == null || upload.file.Length == 0)
                {
                    return BadRequest(new
                    {
                        Error = "No file uploaded",
                        Details = "Please select a valid resume file"
                    });
                }

                // Check file size (limit to 10MB)
                if (upload.file.Length > 10 * 1024 * 1024)
                {
                    return BadRequest(new
                    {
                        Error = "File too large",
                        Details = "File size must be less than 10MB"
                    });
                }

                // Check file extension
                var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".txt" };
                var fileExtension = Path.GetExtension(upload.file.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(fileExtension))
                {
                    return BadRequest(new
                    {
                        Error = "Invalid file type",
                        Details = $"Only {string.Join(", ", allowedExtensions)} files are allowed"
                    });
                }

                var resumeId = await _resumeService.UploadResumeAsync(upload);
                return Ok(new
                {
                    ResumeId = resumeId,
                    Message = "Resume uploaded successfully",
                    FileName = upload.file.FileName
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    Error = "Invalid argument",
                    Details = ex.Message
                });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new
                {
                    Error = "Operation conflict",
                    Details = ex.Message
                });
            }
            catch (FileNotFoundException ex)
            {
                return NotFound(new
                {
                    Error = "File not found",
                    Details = ex.Message
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                // Log the exception (you should use a proper logging framework)
                // _logger.LogError(ex, "Error uploading resume for user {UserId}", userId);

                return StatusCode(500, new
                {
                    Error = "Internal server error",
                    Details = "An unexpected error occurred while uploading the resume",
                    TraceId = HttpContext.TraceIdentifier,
                    Message = ex.Message // Include for debugging in development
                });
            }
        }
        [HttpPost("Analyze")]
        public async Task<IActionResult> AnalyzeResume([FromBody] AnalyzeResumeRequestDTO request)
        {
            try
            {
                // Validation
                if (!ModelState.IsValid)
                {
                    return BadRequest(new
                    {
                        Error = "Validation failed",
                        Details = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)
                    });
                }

                if (request.ResumeId <= 0)
                {
                    return BadRequest(new
                    {
                        Error = "Invalid resume ID",
                        Details = "Resume ID must be a positive number"
                    });
                }

                if (string.IsNullOrWhiteSpace(request.TargetJob))
                {
                    return BadRequest(new
                    {
                        Error = "Invalid target job",
                        Details = "Target job description cannot be empty"
                    });
                }

                if (request.TargetJob.Length > 500)
                {
                    return BadRequest(new
                    {
                        Error = "Target job too long",
                        Details = "Target job description must be less than 500 characters"
                    });
                }

                await _resumeService.AnalyzeResumeAsync(request);
                return Ok(new
                {
                    Message = "Resume analysis completed successfully",
                    ResumeId = request.ResumeId,
                    TargetJob = request.TargetJob
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    Error = "Invalid argument",
                    Details = ex.Message
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
                {
                    Error = "Resume not found",
                    Details = ex.Message
                });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new
                {
                    Error = "Operation conflict",
                    Details = ex.Message
                });
            }
            catch (Exception ex)
            {
                // Log the exception
                // _logger.LogError(ex, "Error analyzing resume {ResumeId} for job {TargetJob}", request.ResumeId, request.TargetJob);

                return StatusCode(500, new
                {
                    Error = "Internal server error",
                    Details = "An unexpected error occurred while analyzing the resume",
                    TraceId = HttpContext.TraceIdentifier,
                    Message = ex.Message
                });
            }
        }
        [HttpDelete("Remove")]
        public async Task<IActionResult> Remove([FromQuery] int resumeid)
        {
            try
            {
                if (resumeid <= 0)
                {
                    return BadRequest(new
                    {
                        Error = "Invalid resume ID",
                        Details = "Resume ID must be a positive number"
                    });
                }

                await _resumeService.RemoveResume(resumeid);
                return Ok(new
                {
                    Message = "Resume removed successfully",
                    ResumeId = resumeid
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
                {
                    Error = "Resume not found",
                    Details = ex.Message
                });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new
                {
                    Error = "Cannot remove resume",
                    Details = ex.Message
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                // Log the exception
                // _logger.LogError(ex, "Error removing resume {ResumeId}", resumeid);

                return StatusCode(500, new
                {
                    Error = "Internal server error",
                    Details = "An unexpected error occurred while removing the resume",
                    TraceId = HttpContext.TraceIdentifier,
                    Message = ex.Message
                });
            }
        }
        [HttpGet("id")]
        public async Task<IActionResult> GetResumesByUserId([FromQuery] int userid)
        {
            try
            {
                if (userid <= 0)
                {
                    return BadRequest(new
                    {
                        Error = "Invalid user ID",
                        Details = "User ID must be a positive number"
                    });
                }

                var resumes = await _resumeService.getResumeIdByUser(userid);

                if (resumes == null)
                {
                    return Ok(new
                    {
                        Resume = new List<object>(),
                        Message = "No resumes found for this user"
                    });
                }

                return Ok(new
                {
                    Resume = resumes,
                    UserId = userid
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    Error = "Invalid argument",
                    Details = ex.Message
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                // Log the exception
                // _logger.LogError(ex, "Error retrieving resumes for user {UserId}", userid);

                return StatusCode(500, new
                {
                    Error = "Internal server error",
                    Details = "An unexpected error occurred while retrieving resumes",
                    TraceId = HttpContext.TraceIdentifier,
                    Message = ex.Message
                });
            }
        }
        [HttpGet($"analysis")]
        public async Task<IActionResult> getAnalysis([FromQuery] int userid , [FromQuery] int resumeid)
        {
            var resumeAnalysis = await _resumeService.getAnalysisByResumeId(userid , resumeid);
            return Ok(new { resumeAnalysis });
        }
        [HttpGet("latestAnalysis")]
        public async Task<IActionResult> getLatestAnalysis([FromQuery] int userid)
        {
            var latestAnalysis = await _resumeService.getLatestAnalysisByUserId(userid);
            return Ok(new { latestAnalysis });
        }

        public class AnalyzeResumeRequest
        {
            [Required(ErrorMessage = "Resume ID is required")]
            [Range(1, int.MaxValue, ErrorMessage = "Resume ID must be a positive number")]
            public int ResumeId { get; set; }

            [Required(ErrorMessage = "Target job is required")]
            [StringLength(500, MinimumLength = 3, ErrorMessage = "Target job must be between 3 and 500 characters")]
            public required string TargetJob { get; set; }
        }
    }
}
