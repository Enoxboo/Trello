using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Yello.Data;
using Yello.DTOs;
using Yello.Entities;
using Yello.Hubs;

namespace Yello.Services;

public class CardService(AppDbContext db, IHubContext<BoardHub> hub)
{
    public async Task<CardDto?> CreateAsync(CreateCardDto dto, int userId)
    {
        var list = await db.Lists
            .Include(l => l.Board)
            .FirstOrDefaultAsync(l => l.Id == dto.ListId && l.Board.UserId == userId);
        if (list is null) return null;

        var position = await db.Cards.CountAsync(c => c.ListId == dto.ListId);
        var card = new Card { Title = dto.Title, ListId = dto.ListId, Position = position };
        db.Cards.Add(card);
        await db.SaveChangesAsync();

        var cardDto = new CardDto(card.Id, card.Title, card.Description, card.DueDate, card.Position, [], []);
        await hub.Clients.Group($"board-{list.BoardId}")
            .SendAsync("CardCreated", new { boardId = list.BoardId, listId = dto.ListId, card = cardDto });

        return cardDto;
    }

    public async Task<CardDto?> UpdateAsync(int id, UpdateCardDto dto, int userId)
    {
        var card = await db.Cards
            .Include(c => c.List).ThenInclude(l => l.Board)
            .Include(c => c.Comments).ThenInclude(co => co.User)
            .Include(c => c.Labels)
            .FirstOrDefaultAsync(c => c.Id == id && c.List.Board.UserId == userId);
        if (card is null) return null;

        card.Title = dto.Title;
        card.Description = dto.Description;
        card.DueDate = dto.DueDate;
        await db.SaveChangesAsync();

        var cardDto = MapToDto(card);
        int boardId = card.List.Board.Id;
        await hub.Clients.Group($"board-{boardId}")
            .SendAsync("CardUpdated", new { boardId, card = cardDto });

        return cardDto;
    }

    public async Task<CardDto?> MoveAsync(int id, MoveCardDto dto, int userId)
    {
        var card = await db.Cards
            .Include(c => c.List).ThenInclude(l => l.Board)
            .Include(c => c.Comments).ThenInclude(co => co.User)
            .Include(c => c.Labels)
            .FirstOrDefaultAsync(c => c.Id == id && c.List.Board.UserId == userId);
        if (card is null) return null;

        var targetList = await db.Lists
            .Include(l => l.Board)
            .FirstOrDefaultAsync(l => l.Id == dto.TargetListId && l.Board.UserId == userId);
        if (targetList is null) return null;

        int boardId = card.List.Board.Id;
        int fromListId = card.ListId;

        var oldListCards = await db.Cards
            .Where(c => c.ListId == fromListId && c.Id != id)
            .OrderBy(c => c.Position)
            .ToListAsync();
        for (int i = 0; i < oldListCards.Count; i++)
            oldListCards[i].Position = i;

        var newListCards = await db.Cards
            .Where(c => c.ListId == dto.TargetListId && c.Id != id)
            .OrderBy(c => c.Position)
            .ToListAsync();
        newListCards.Insert(Math.Clamp(dto.Position, 0, newListCards.Count), card);
        for (int i = 0; i < newListCards.Count; i++)
            newListCards[i].Position = i;

        card.ListId = dto.TargetListId;
        await db.SaveChangesAsync();

        var cardDto = MapToDto(card);
        await hub.Clients.Group($"board-{boardId}")
            .SendAsync("CardMoved", new
            {
                boardId,
                cardId = id,
                fromListId,
                toListId = dto.TargetListId,
                toPosition = dto.Position
            });

        return cardDto;
    }

    public async Task<bool> DeleteAsync(int id, int userId)
    {
        var card = await db.Cards
            .Include(c => c.List).ThenInclude(l => l.Board)
            .FirstOrDefaultAsync(c => c.Id == id && c.List.Board.UserId == userId);
        if (card is null) return false;

        int listId = card.ListId;
        int boardId = card.List.Board.Id;
        db.Cards.Remove(card);
        await db.SaveChangesAsync();

        var remaining = await db.Cards.Where(c => c.ListId == listId).OrderBy(c => c.Position).ToListAsync();
        for (int i = 0; i < remaining.Count; i++)
            remaining[i].Position = i;
        await db.SaveChangesAsync();

        await hub.Clients.Group($"board-{boardId}")
            .SendAsync("CardDeleted", new { boardId, cardId = id, listId });

        return true;
    }

    private static CardDto MapToDto(Card c) => new(
        c.Id, c.Title, c.Description, c.DueDate, c.Position,
        c.Comments?.Select(co => new CommentDto(co.Id, co.Content, co.CreatedAt, co.User?.Username ?? "")).ToList() ?? [],
        c.Labels?.Select(la => new LabelDto(la.Id, la.Name, la.Color)).ToList() ?? []
    );
}
