namespace Yello.DTOs.Comment;

public class CommentDto
{
    public int Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int AuthorId { get; set; }
    public string AuthorUsername { get; set; } = string.Empty;
    public int CardId { get; set; }
}

public class CreateCommentDto
{
    public string Content { get; set; } = string.Empty;
}

public class UpdateCommentDto
{
    public string Content { get; set; } = string.Empty;
}
