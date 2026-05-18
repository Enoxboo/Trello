namespace Yello.Entities;

public class Card
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime? DueDate { get; set; }
    public int Position { get; set; }

    public int ListId { get; set; }
    public List List { get; set; } = null!;

    public ICollection<Comment> Comments { get; set; } = [];
    public ICollection<Label> Labels { get; set; } = [];
}
