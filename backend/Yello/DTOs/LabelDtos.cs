namespace Yello.DTOs;

public record CreateLabelDto(string Name, string Color);

public record LabelDto(int Id, string Name, string Color);
