namespace Yello.Entities;

public class Board
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Clé étrangère vers l'utilisateur propriétaire du tableau
    public int OwnerId { get; set; }
    public User Owner { get; set; } = null!;

    public string? InviteCode { get; set; }

    public ICollection<BoardList> Lists { get; set; } = [];
    public ICollection<BoardMember> Members { get; set; } = [];
}
