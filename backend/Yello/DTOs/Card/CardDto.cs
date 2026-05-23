namespace Yello.DTOs.Card;

public class CardDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int Position { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public int ListId { get; set; }
    public List<LabelDto> Labels { get; set; } = [];
    public List<CardMemberDto> Members { get; set; } = [];
    public int CommentCount { get; set; }
}

public class LabelDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
}

public class CardMemberDto
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
}

public class CreateCardDto
{
    public string Title { get; set; } = string.Empty;
}

public class UpdateCardDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public DateTime? DueDate { get; set; }
}

public class MoveCardDto
{
    public int ListId { get; set; }
    public int Position { get; set; }
}

public class CreateLabelDto
{
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
}
