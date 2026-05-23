namespace Yello.DTOs.Board;

public class BoardMemberDto
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
}

public class BoardDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int OwnerId { get; set; }
    public string? OwnerUsername { get; set; }
    public string? InviteCode { get; set; }
    public List<BoardMemberDto> Members { get; set; } = [];
}

public class CreateBoardDto
{
    public string Title { get; set; } = string.Empty;
}

public class UpdateBoardDto
{
    public string Title { get; set; } = string.Empty;
}

public class JoinBoardDto
{
    public string Code { get; set; } = string.Empty;
}
