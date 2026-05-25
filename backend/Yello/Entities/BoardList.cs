namespace Yello.Entities;

// Nommée BoardList pour éviter le conflit avec System.Collections.Generic.List<T>
// La table en base de données s'appellera "Lists" (configuré dans AppDbContext)
public class BoardList
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;

    // Position permet de persister l'ordre des colonnes dans le tableau
    public int Position { get; set; }

    public int BoardId { get; set; }
    public Board Board { get; set; } = null!;

    public ICollection<Card> Cards { get; set; } = [];
}
