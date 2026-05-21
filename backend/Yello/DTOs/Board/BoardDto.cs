namespace Yello.DTOs.Board;

public class BoardDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int OwnerId { get; set; }
}

public class CreateBoardDto
{
    public string Title { get; set; } = string.Empty;
}

public class UpdateBoardDto
{
    public string Title { get; set; } = string.Empty;
}
