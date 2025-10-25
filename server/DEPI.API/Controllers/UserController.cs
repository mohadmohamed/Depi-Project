using DEPI.Application.Contracts;
using DEPI.Application.DTOs;
using DEPI.Application.Services;
using DEPI.DataAccess.Contracts;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

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
            var user = await _userService.UserRegister(userDto);
            return Ok("User Registerd");
        }
        [HttpPost("Login")]
        public async Task<IActionResult> LoginUser([FromBody] userLoginDTO userDto)
        {
            var token = await _userService.UserLogin(userDto);
            return Ok(new { token });
        }

    }
}
