namespace Yello.Entities;

// Table de jointure many-to-many entre Card et User
// Représente les membres assignés à une carte
public class CardMember
{
    public int CardId { get; set; }
    public Card Card { get; set; } = null!;

    public int UserId { get; set; }
    public User User { get; set; } = null!;
}
