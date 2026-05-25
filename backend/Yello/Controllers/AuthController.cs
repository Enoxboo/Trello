using Microsoft.AspNetCore.Mvc;
using Yello.DTOs.Auth;
using Yello.Services;

namespace Yello.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService _auth;

    public AuthController(AuthService auth)
    {
        _auth = auth;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var result = await _auth.RegisterAsync(dto);
        if (result == null)
            return Conflict(new { message = "Un compte existe déjà avec cet email." });

        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var result = await _auth.LoginAsync(dto);
        if (result == null)
            return Unauthorized(new { message = "Email ou mot de passe incorrect." });

        return Ok(result);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(RefreshDto dto)
    {
        var result = await _auth.RefreshAsync(dto);
        if (result == null)
            return Unauthorized(new { message = "Refresh token invalide ou expiré." });

        return Ok(result);
    }
}
