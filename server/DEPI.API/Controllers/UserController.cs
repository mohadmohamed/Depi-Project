using DEPI.Application.Contracts;
using DEPI.Application.DTOs;
using DEPI.Application.Services;
using DEPI.DataAccess.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DEPI.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }
        [HttpPost("Register")]
        public async Task<IActionResult> RegisterUser([FromBody]userRegisterDTO userDto)
        {
            // check that the email is a valid email 
            bool isMail = userDto.Email.Contains("@");
            if(isMail)
            {
               var user = await _userService.UserRegister(userDto);
            }else
            {
                return BadRequest("email is wrong please reWrite it ");
            }
                return Ok("User Registerd");
        }
        [HttpPost("Login")]
        public async Task<IActionResult> LoginUser([FromBody] userLoginDTO userDto)
        {
            var token = await _userService.UserLogin(userDto);
            return Ok(new { token });
        }
        [Authorize]
        [HttpGet("me")]
        public IActionResult Me()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Ok(new { userId });
        }

    }
}
