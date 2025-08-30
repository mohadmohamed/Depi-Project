using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using mymvcApp.Models;

namespace mymvcApp.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HomeController : ControllerBase
{
    private readonly ILogger<HomeController> _logger;

    public HomeController(ILogger<HomeController> logger)
    {
        _logger = logger;
    }

    // Simple API endpoint for React communication test
    [HttpGet("ping")]
    public IActionResult Ping()
    {
        return Ok(new { message = "pong from MVC! mohamed is here" });
    }
    public IActionResult Hello()
    {
        return Ok(new { message = "this is a created Message from MVC! mohamed is here" });
    }
}
