namespace Yello.DTOs;

public record CreateCardDto(string Title, int ListId);
public record UpdateCardDto(string Title, string Description, DateTime? DueDate);
public record MoveCardDto(int TargetListId, int Position);

public record CardDto(
    int Id,
    string Title,
    string Description,
    DateTime? DueDate,
    int Position,
    List<CommentDto> Comments,
    List<LabelDto> Labels
);
