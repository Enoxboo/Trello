using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Yello.Data;
using Yello.DTOs.List;
using Yello.Entities;
using Yello.Hubs;

namespace Yello.Services;

public class ListService
{
    private readonly AppDbContext _db;
    private readonly IHubContext<BoardHub> _hub;

    public ListService(AppDbContext db, IHubContext<BoardHub> hub)
    {
        _db = db;
        _hub = hub;
    }

    private static string Group(int boardId) => $"board-{boardId}";

    public async Task<List<ListDto>> GetByBoardAsync(int boardId, int userId)
    {
        var hasAccess = await _db.Boards.AnyAsync(b => b.Id == boardId &&
            (b.OwnerId == userId || b.Members.Any(m => m.UserId == userId)));

        if (!hasAccess) return [];

        return await _db.Lists
            .Where(l => l.BoardId == boardId)
            .OrderBy(l => l.Position)
            .Select(l => ToDto(l))
            .ToListAsync();
    }

    public async Task<ListDto?> CreateAsync(int boardId, CreateListDto dto, int userId)
    {
        var hasAccess = await _db.Boards.AnyAsync(b => b.Id == boardId &&
            (b.OwnerId == userId || b.Members.Any(m => m.UserId == userId)));

        if (!hasAccess) return null;

        var maxPosition = await _db.Lists
            .Where(l => l.BoardId == boardId)
            .MaxAsync(l => (int?)l.Position) ?? -1;

        var list = new BoardList
        {
            Title = dto.Title,
            BoardId = boardId,
            Position = maxPosition + 1
        };

        _db.Lists.Add(list);
        await _db.SaveChangesAsync();

        var result = ToDto(list);
        await _hub.Clients.Group(Group(boardId)).SendAsync("ListCreated", result);
        return result;
    }

    public async Task<ListDto?> UpdateAsync(int listId, UpdateListDto dto, int userId)
    {
        var list = await _db.Lists
            .Include(l => l.Board)
            .FirstOrDefaultAsync(l => l.Id == listId &&
                (l.Board.OwnerId == userId || l.Board.Members.Any(m => m.UserId == userId)));

        if (list == null) return null;

        list.Title = dto.Title;
        await _db.SaveChangesAsync();

        var result = ToDto(list);
        await _hub.Clients.Group(Group(list.BoardId)).SendAsync("ListUpdated", result);
        return result;
    }

    public async Task<bool> MoveAsync(int listId, MoveListDto dto, int userId)
    {
        var list = await _db.Lists
            .Include(l => l.Board)
            .FirstOrDefaultAsync(l => l.Id == listId &&
                (l.Board.OwnerId == userId || l.Board.Members.Any(m => m.UserId == userId)));

        if (list == null) return false;

        var siblings = await _db.Lists
            .Where(l => l.BoardId == list.BoardId && l.Id != listId)
            .OrderBy(l => l.Position)
            .ToListAsync();

        siblings.Insert(Math.Clamp(dto.Position, 0, siblings.Count), list);

        for (int i = 0; i < siblings.Count; i++)
            siblings[i].Position = i;

        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int listId, int userId)
    {
        var list = await _db.Lists
            .Include(l => l.Board)
            .FirstOrDefaultAsync(l => l.Id == listId &&
                (l.Board.OwnerId == userId || l.Board.Members.Any(m => m.UserId == userId)));

        if (list == null) return false;

        var boardId = list.BoardId;

        _db.Lists.Remove(list);
        await _db.SaveChangesAsync();

        await _hub.Clients.Group(Group(boardId)).SendAsync("ListDeleted", new { listId });
        return true;
    }

    private static ListDto ToDto(BoardList l) => new()
    {
        Id = l.Id,
        Title = l.Title,
        Position = l.Position,
        BoardId = l.BoardId
    };
}
