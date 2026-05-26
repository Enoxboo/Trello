using Microsoft.EntityFrameworkCore;
using Yello.Data;
using Yello.DTOs;
using Yello.Entities;

namespace Yello.Services;

public class LabelService(AppDbContext db)
{
    public async Task<LabelDto?> CreateAsync(int cardId, CreateLabelDto dto, int userId)
    {
        var card = await db.Cards
            .Include(c => c.List).ThenInclude(l => l.Board)
            .FirstOrDefaultAsync(c => c.Id == cardId &&
                (c.List.Board.OwnerId == userId || c.List.Board.Members.Any(m => m.UserId == userId)));
        if (card is null) return null;

        var label = new Label { Name = dto.Name, Color = dto.Color, CardId = cardId };
        db.Labels.Add(label);
        await db.SaveChangesAsync();

        return new LabelDto(label.Id, label.Name, label.Color);
    }

    public async Task<bool> DeleteAsync(int id, int userId)
    {
        var label = await db.Labels
            .Include(l => l.Card).ThenInclude(c => c.List).ThenInclude(l => l.Board)
            .FirstOrDefaultAsync(l => l.Id == id &&
                (l.Card.List.Board.OwnerId == userId || l.Card.List.Board.Members.Any(m => m.UserId == userId)));
        if (label is null) return false;

        db.Labels.Remove(label);
        await db.SaveChangesAsync();
        return true;
    }
}
