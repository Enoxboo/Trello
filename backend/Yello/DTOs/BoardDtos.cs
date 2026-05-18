namespace Yello.DTOs;

public record CreateBoardDto(string Title);
public record UpdateBoardDto(string Title);

public record BoardDto(int Id, string Title, DateTime CreatedAt, List<ListDto> Lists);
