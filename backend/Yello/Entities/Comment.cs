namespace Yello.Entities;

public class Comment
{
    public int Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public int AuthorId { get; set; }
    public User Author { get; set; } = null!;

    public int CardId { get; set; }
    public Card Card { get; set; } = null!;
}
