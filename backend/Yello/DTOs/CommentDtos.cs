namespace Yello.DTOs;

public record CreateCommentDto(string Content);
public record UpdateCommentDto(string Content);

public record CommentDto(int Id, string Content, DateTime CreatedAt, string AuthorUsername);
