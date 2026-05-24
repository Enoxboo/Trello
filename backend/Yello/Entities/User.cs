namespace Yello.Entities;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;

    // Refresh token stocké en base pour permettre la révocation
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiry { get; set; }

    public ICollection<Board> OwnedBoards { get; set; } = [];
    public ICollection<BoardMember> BoardMemberships { get; set; } = [];
    public ICollection<CardMember> CardMemberships { get; set; } = [];
    public ICollection<Comment> Comments { get; set; } = [];
}
