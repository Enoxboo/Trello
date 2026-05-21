namespace Yello.Entities;

public class Label
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    // Couleur stockée en hexadécimal (#FF5733)
    public string Color { get; set; } = string.Empty;

    public int CardId { get; set; }
    public Card Card { get; set; } = null!;
}
