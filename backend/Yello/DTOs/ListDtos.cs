namespace Yello.DTOs;

public record CreateListDto(string Title, int BoardId);
public record UpdateListDto(string Title);

public record ListDto(int Id, string Title, int Position, List<CardDto> Cards);
