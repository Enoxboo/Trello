namespace Yello.Entities;

// Table de jointure many-to-many entre Board et User
// Un board peut avoir plusieurs membres, un user peut être membre de plusieurs boards
public class BoardMember
{
    public int BoardId { get; set; }
    public Board Board { get; set; } = null!;

    public int UserId { get; set; }
    public User User { get; set; } = null!;
}
