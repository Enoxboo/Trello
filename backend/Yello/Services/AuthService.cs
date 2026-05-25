using Microsoft.EntityFrameworkCore;
using Yello.Data;
using Yello.DTOs.Auth;
using Yello.Entities;

namespace Yello.Services;

public class AuthService
{
    private readonly AppDbContext _db;
    private readonly JwtService _jwt;
    private readonly IConfiguration _config;

    public AuthService(AppDbContext db, JwtService jwt, IConfiguration config)
    {
        _db = db;
        _jwt = jwt;
        _config = config;
    }

    // Inscription : vérifie que l'email n'existe pas, hache le mot de passe avec BCrypt,
    // crée l'utilisateur et retourne immédiatement des tokens (l'utilisateur est connecté après inscription).
    public async Task<AuthResponseDto?> RegisterAsync(RegisterDto dto)
    {
        if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
            return null;

        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            // BCrypt intègre automatiquement un sel aléatoire dans le hash
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return await BuildTokenResponse(user);
    }

    // Connexion : vérifie que l'email existe et que le mot de passe correspond au hash stocké.
    public async Task<AuthResponseDto?> LoginAsync(LoginDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return null;

        return await BuildTokenResponse(user);
    }

    // Refresh : valide l'ancien access token (signature uniquement, pas la durée de vie),
    // vérifie que le refresh token en base correspond et n'est pas expiré,
    // puis émet une nouvelle paire de tokens.
    public async Task<AuthResponseDto?> RefreshAsync(RefreshDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u =>
            u.RefreshToken == dto.RefreshToken &&
            u.RefreshTokenExpiry > DateTime.UtcNow);

        if (user == null)
            return null;

        return await BuildTokenResponse(user);
    }

    private async Task<AuthResponseDto> BuildTokenResponse(User user)
    {
        var accessToken = _jwt.GenerateAccessToken(user);
        var refreshToken = _jwt.GenerateRefreshToken();

        var refreshDays = int.Parse(_config["Jwt:RefreshTokenExpirationDays"]!);
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(refreshDays);
        await _db.SaveChangesAsync();

        return new AuthResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            UserId = user.Id,
            Username = user.Username,
            Email = user.Email
        };
    }
}
