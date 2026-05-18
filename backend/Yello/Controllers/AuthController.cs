using Microsoft.AspNetCore.Mvc;
using Yello.DTOs;
using Yello.Services;

namespace Yello.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AuthService authService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var result = await authService.RegisterAsync(dto);
        return result is null
            ? Conflict(new { message = "Email déjà utilisé" })
            : Ok(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var result = await authService.LoginAsync(dto);
        return result is null
            ? Unauthorized(new { message = "Email ou mot de passe incorrect" })
            : Ok(result);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(RefreshDto dto)
    {
        var result = await authService.RefreshAsync(dto.RefreshToken);
        return result is null
            ? Unauthorized(new { message = "Refresh token invalide ou expiré" })
            : Ok(result);
    }
}
