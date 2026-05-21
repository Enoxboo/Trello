namespace Yello.Entities;

public class Card
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }

    // Position permet de persister l'ordre des cartes au sein d'une liste
    public int Position { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int ListId { get; set; }
    public BoardList List { get; set; } = null!;

    public ICollection<Label> Labels { get; set; } = [];
    public ICollection<CardMember> Members { get; set; } = [];
    public ICollection<Comment> Comments { get; set; } = [];
}
