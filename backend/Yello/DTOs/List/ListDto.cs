namespace Yello.DTOs.List;

public class ListDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public int Position { get; set; }
    public int BoardId { get; set; }
}

public class CreateListDto
{
    public string Title { get; set; } = string.Empty;
}

public class UpdateListDto
{
    public string Title { get; set; } = string.Empty;
}

public class MoveListDto
{
    public int Position { get; set; }
}
