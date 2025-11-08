//using Microsoft.AspNetCore.Mvc;
//using DEPI.Application.Services;
//using System.Threading.Tasks;

//namespace DEPI.API.Controllers
//{
//    [ApiController]
//    [Route("api/[controller]")]
//    public class QuizController : ControllerBase
//    {
//        private readonly IGeminiService _geminiService;

//        public QuizController(IGeminiService geminiService)
//        {
//            _geminiService = geminiService;
//        }

//        [HttpPost("generate")]
//        public async Task<IActionResult> Generate([FromBody] QuizRequest request)
//        {
//            var result = await _geminiService.GenerateQuizAsync(request.Topic, request.Difficulty);
//            return Ok(result);
//        }
//    }

//    public class QuizRequest
//    {
//        public string Topic { get; set; }
//        public string Difficulty { get; set; }
//    }
//}
