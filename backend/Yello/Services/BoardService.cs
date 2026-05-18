using Microsoft.EntityFrameworkCore;
using Yello.Data;
using Yello.DTOs;
using Yello.Entities;

namespace Yello.Services;

public class BoardService(AppDbContext db)
{
    public async Task<List<BoardDto>> GetAllAsync(int userId)
    {
        return await db.Boards
            .Where(b => b.UserId == userId)
            .Include(b => b.Lists.OrderBy(l => l.Position))
                .ThenInclude(l => l.Cards.OrderBy(c => c.Position))
                    .ThenInclude(c => c.Comments)
                        .ThenInclude(co => co.User)
            .Include(b => b.Lists)
                .ThenInclude(l => l.Cards)
                    .ThenInclude(c => c.Labels)
            .Select(b => MapToDto(b))
            .ToListAsync();
    }

    public async Task<BoardDto?> GetByIdAsync(int id, int userId)
    {
        var board = await db.Boards
            .Where(b => b.Id == id && b.UserId == userId)
            .Include(b => b.Lists.OrderBy(l => l.Position))
                .ThenInclude(l => l.Cards.OrderBy(c => c.Position))
                    .ThenInclude(c => c.Comments)
                        .ThenInclude(co => co.User)
            .Include(b => b.Lists)
                .ThenInclude(l => l.Cards)
                    .ThenInclude(c => c.Labels)
            .FirstOrDefaultAsync();

        return board is null ? null : MapToDto(board);
    }

    public async Task<BoardDto> CreateAsync(CreateBoardDto dto, int userId)
    {
        var board = new Board { Title = dto.Title, UserId = userId };
        db.Boards.Add(board);
        await db.SaveChangesAsync();
        return MapToDto(board);
    }

    public async Task<BoardDto?> UpdateAsync(int id, UpdateBoardDto dto, int userId)
    {
        var board = await db.Boards.FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);
        if (board is null) return null;

        board.Title = dto.Title;
        await db.SaveChangesAsync();
        return await GetByIdAsync(id, userId);
    }

    public async Task<bool> DeleteAsync(int id, int userId)
    {
        var board = await db.Boards.FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);
        if (board is null) return false;

        db.Boards.Remove(board);
        await db.SaveChangesAsync();
        return true;
    }

    private static BoardDto MapToDto(Board b) => new(
        b.Id, b.Title, b.CreatedAt,
        b.Lists?.Select(MapListToDto).ToList() ?? []
    );

    private static ListDto MapListToDto(Entities.List l) => new(
        l.Id, l.Title, l.Position,
        l.Cards?.Select(MapCardToDto).ToList() ?? []
    );

    private static CardDto MapCardToDto(Card c) => new(
        c.Id, c.Title, c.Description, c.DueDate, c.Position,
        c.Comments?.Select(co => new CommentDto(co.Id, co.Content, co.CreatedAt, co.User?.Username ?? "")).ToList() ?? [],
        c.Labels?.Select(la => new LabelDto(la.Id, la.Name, la.Color)).ToList() ?? []
    );
}
