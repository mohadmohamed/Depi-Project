using DEPI.Application.Contracts;
using DEPI.DataAccess.Entites;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace DEPI.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ResumeController : ControllerBase
    {
        private readonly IResumeService _resumeService;
        public ResumeController(IResumeService resumeService)
        {
            _resumeService = resumeService;
        }

        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadResume([FromForm] int userId, [FromForm] IFormFile file)
        {
            try
            {
                var resumeId = await _resumeService.UploadResumeAsync(userId, file);
                return Ok(new { ResumeId = resumeId, Message = "Resume uploaded successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }
        [HttpPost("Analyze")]
        public async Task<IActionResult> AnalyzeResume([FromForm]int resumeid , [FromForm] string targetJob)
        {
            try
            {
               await _resumeService.AnalyzeResumeAsync(resumeid , targetJob);
                return Ok("Resume analysis saved");
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }
        [HttpDelete("Remove")] 
        public async Task<IActionResult> Remove([FromQuery]int resumeid)
        {
            await _resumeService.RemoveResume(resumeid);
            return Ok("Remove success");
        }
    }
}
