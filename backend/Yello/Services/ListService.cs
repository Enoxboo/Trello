using Microsoft.EntityFrameworkCore;
using Yello.Data;
using Yello.DTOs;
using Yello.Entities;

namespace Yello.Services;

public class ListService(AppDbContext db)
{
    public async Task<ListDto?> CreateAsync(CreateListDto dto, int userId)
    {
        var board = await db.Boards.FirstOrDefaultAsync(b => b.Id == dto.BoardId && b.UserId == userId);
        if (board is null) return null;

        var position = await db.Lists.CountAsync(l => l.BoardId == dto.BoardId);
        var list = new Entities.List { Title = dto.Title, BoardId = dto.BoardId, Position = position };
        db.Lists.Add(list);
        await db.SaveChangesAsync();

        return new ListDto(list.Id, list.Title, list.Position, []);
    }

    public async Task<ListDto?> UpdateAsync(int id, UpdateListDto dto, int userId)
    {
        var list = await db.Lists
            .Include(l => l.Board)
            .FirstOrDefaultAsync(l => l.Id == id && l.Board.UserId == userId);
        if (list is null) return null;

        list.Title = dto.Title;
        await db.SaveChangesAsync();

        return new ListDto(list.Id, list.Title, list.Position, []);
    }

    public async Task<bool> DeleteAsync(int id, int userId)
    {
        var list = await db.Lists
            .Include(l => l.Board)
            .FirstOrDefaultAsync(l => l.Id == id && l.Board.UserId == userId);
        if (list is null) return false;

        db.Lists.Remove(list);
        await db.SaveChangesAsync();

        // Reorder remaining lists
        var remaining = await db.Lists
            .Where(l => l.BoardId == list.BoardId)
            .OrderBy(l => l.Position)
            .ToListAsync();
        for (int i = 0; i < remaining.Count; i++)
            remaining[i].Position = i;
        await db.SaveChangesAsync();

        return true;
    }

    public async Task<bool> ReorderAsync(int boardId, List<int> orderedIds, int userId)
    {
        var board = await db.Boards.FirstOrDefaultAsync(b => b.Id == boardId && b.UserId == userId);
        if (board is null) return false;

        var lists = await db.Lists.Where(l => l.BoardId == boardId).ToListAsync();
        for (int i = 0; i < orderedIds.Count; i++)
        {
            var list = lists.FirstOrDefault(l => l.Id == orderedIds[i]);
            if (list is not null) list.Position = i;
        }
        await db.SaveChangesAsync();
        return true;
    }
}
