namespace Yello.DTOs;

public record RegisterDto(string Username, string Email, string Password);
public record LoginDto(string Email, string Password);
public record RefreshDto(string RefreshToken);

public record AuthResponseDto(string AccessToken, string RefreshToken, string Username);
