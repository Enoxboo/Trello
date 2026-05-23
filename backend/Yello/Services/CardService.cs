using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Yello.Data;
using Yello.DTOs.Card;
using Yello.Entities;
using Yello.Hubs;

namespace Yello.Services;

public class CardService
{
    private readonly AppDbContext _db;
    private readonly IHubContext<BoardHub> _hub;

    public CardService(AppDbContext db, IHubContext<BoardHub> hub)
    {
        _db = db;
        _hub = hub;
    }

    private static string Group(int boardId) => $"board-{boardId}";

    public async Task<List<CardDto>> GetByListAsync(int listId, int userId)
    {
        var hasAccess = await _db.Lists
            .AnyAsync(l => l.Id == listId &&
                (l.Board.OwnerId == userId || l.Board.Members.Any(m => m.UserId == userId)));

        if (!hasAccess) return [];

        return await _db.Cards
            .Include(c => c.Labels)
            .Include(c => c.Members).ThenInclude(m => m.User)
            .Where(c => c.ListId == listId)
            .OrderBy(c => c.Position)
            .Select(c => ToDto(c))
            .ToListAsync();
    }

    public async Task<CardDto?> GetByIdAsync(int cardId, int userId)
    {
        var card = await _db.Cards
            .Include(c => c.Labels)
            .Include(c => c.Members).ThenInclude(m => m.User)
            .FirstOrDefaultAsync(c => c.Id == cardId &&
                (c.List.Board.OwnerId == userId || c.List.Board.Members.Any(m => m.UserId == userId)));

        return card == null ? null : ToDto(card);
    }

    public async Task<CardDto?> CreateAsync(int listId, CreateCardDto dto, int userId)
    {
        var list = await _db.Lists
            .Include(l => l.Board).ThenInclude(b => b.Members)
            .FirstOrDefaultAsync(l => l.Id == listId &&
                (l.Board.OwnerId == userId || l.Board.Members.Any(m => m.UserId == userId)));

        if (list == null) return null;

        var maxPosition = await _db.Cards
            .Where(c => c.ListId == listId)
            .MaxAsync(c => (int?)c.Position) ?? -1;

        var card = new Card
        {
            Title = dto.Title,
            ListId = listId,
            Position = maxPosition + 1
        };

        _db.Cards.Add(card);
        await _db.SaveChangesAsync();

        var result = ToDto(card);
        await _hub.Clients.Group(Group(list.BoardId)).SendAsync("CardCreated", result);
        return result;
    }

    public async Task<CardDto?> UpdateAsync(int cardId, UpdateCardDto dto, int userId)
    {
        var card = await _db.Cards
            .Include(c => c.Labels)
            .Include(c => c.Members).ThenInclude(m => m.User)
            .Include(c => c.List) // nécessaire pour récupérer le boardId
            .FirstOrDefaultAsync(c => c.Id == cardId &&
                (c.List.Board.OwnerId == userId || c.List.Board.Members.Any(m => m.UserId == userId)));

        if (card == null) return null;

        if (dto.Title != null) card.Title = dto.Title;
        if (dto.Description != null) card.Description = dto.Description;
        if (dto.DueDate.HasValue) card.DueDate = dto.DueDate;

        await _db.SaveChangesAsync();

        var result = ToDto(card);
        await _hub.Clients.Group(Group(card.List.BoardId)).SendAsync("CardUpdated", result);
        return result;
    }

    public async Task<bool> MoveAsync(int cardId, MoveCardDto dto, int userId)
    {
        var card = await _db.Cards
            .Include(c => c.List).ThenInclude(l => l.Board).ThenInclude(b => b.Members)
            .FirstOrDefaultAsync(c => c.Id == cardId &&
                (c.List.Board.OwnerId == userId || c.List.Board.Members.Any(m => m.UserId == userId)));

        if (card == null) return false;

        var targetList = await _db.Lists
            .Include(l => l.Board).ThenInclude(b => b.Members)
            .FirstOrDefaultAsync(l => l.Id == dto.ListId &&
                (l.Board.OwnerId == userId || l.Board.Members.Any(m => m.UserId == userId)));

        if (targetList == null) return false;

        var boardId = card.List.BoardId;

        var siblings = await _db.Cards
            .Where(c => c.ListId == dto.ListId && c.Id != cardId)
            .OrderBy(c => c.Position)
            .ToListAsync();

        card.ListId = dto.ListId;
        siblings.Insert(Math.Clamp(dto.Position, 0, siblings.Count), card);

        for (int i = 0; i < siblings.Count; i++)
            siblings[i].Position = i;

        await _db.SaveChangesAsync();

        await _hub.Clients.Group(Group(boardId))
            .SendAsync("CardMoved", new { cardId = card.Id, listId = dto.ListId });
        return true;
    }

    public async Task<bool> DeleteAsync(int cardId, int userId)
    {
        var card = await _db.Cards
            .Include(c => c.List) // pour boardId
            .FirstOrDefaultAsync(c => c.Id == cardId &&
                (c.List.Board.OwnerId == userId || c.List.Board.Members.Any(m => m.UserId == userId)));

        if (card == null) return false;

        var boardId = card.List.BoardId;
        var listId = card.ListId;

        _db.Cards.Remove(card);
        await _db.SaveChangesAsync();

        await _hub.Clients.Group(Group(boardId))
            .SendAsync("CardDeleted", new { cardId, listId });
        return true;
    }

    public async Task<LabelDto?> AddLabelAsync(int cardId, CreateLabelDto dto, int userId)
    {
        var card = await _db.Cards
            .FirstOrDefaultAsync(c => c.Id == cardId &&
                (c.List.Board.OwnerId == userId || c.List.Board.Members.Any(m => m.UserId == userId)));

        if (card == null) return null;

        var label = new Label { Name = dto.Name, Color = dto.Color, CardId = cardId };
        _db.Labels.Add(label);
        await _db.SaveChangesAsync();

        return new LabelDto { Id = label.Id, Name = label.Name, Color = label.Color };
    }

    public async Task<bool> RemoveLabelAsync(int cardId, int labelId, int userId)
    {
        var label = await _db.Labels
            .FirstOrDefaultAsync(l => l.Id == labelId && l.CardId == cardId &&
                (l.Card.List.Board.OwnerId == userId || l.Card.List.Board.Members.Any(m => m.UserId == userId)));

        if (label == null) return false;

        _db.Labels.Remove(label);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> AddMemberAsync(int cardId, int targetUserId, int requesterId)
    {
        var card = await _db.Cards
            .FirstOrDefaultAsync(c => c.Id == cardId &&
                (c.List.Board.OwnerId == requesterId || c.List.Board.Members.Any(m => m.UserId == requesterId)));

        if (card == null) return false;
        if (await _db.CardMembers.AnyAsync(m => m.CardId == cardId && m.UserId == targetUserId))
            return true;

        _db.CardMembers.Add(new CardMember { CardId = cardId, UserId = targetUserId });
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveMemberAsync(int cardId, int targetUserId, int requesterId)
    {
        var member = await _db.CardMembers
            .Include(m => m.Card).ThenInclude(c => c.List).ThenInclude(l => l.Board)
            .FirstOrDefaultAsync(m => m.CardId == cardId && m.UserId == targetUserId &&
                (m.Card.List.Board.OwnerId == requesterId || m.Card.List.Board.Members.Any(bm => bm.UserId == requesterId)));

        if (member == null) return false;

        _db.CardMembers.Remove(member);
        await _db.SaveChangesAsync();
        return true;
    }

    private static CardDto ToDto(Card c) => new()
    {
        Id = c.Id,
        Title = c.Title,
        Description = c.Description,
        Position = c.Position,
        DueDate = c.DueDate,
        CreatedAt = c.CreatedAt,
        ListId = c.ListId,
        Labels = c.Labels.Select(l => new LabelDto { Id = l.Id, Name = l.Name, Color = l.Color }).ToList(),
        Members = c.Members.Select(m => new CardMemberDto { UserId = m.UserId, Username = m.User.Username }).ToList()
    };
}
