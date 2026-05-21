using Microsoft.EntityFrameworkCore;
using Yello.Data;
using Yello.DTOs.Board;
using Yello.Entities;

namespace Yello.Services;

public class BoardService
{
    private readonly AppDbContext _db;

    public BoardService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<BoardDto>> GetUserBoardsAsync(int userId)
    {
        return await _db.Boards
            .Where(b => b.OwnerId == userId || b.Members.Any(m => m.UserId == userId))
            .Select(b => ToDto(b))
            .ToListAsync();
    }

    public async Task<BoardDto?> GetByIdAsync(int boardId, int userId)
    {
        var board = await _db.Boards
            .FirstOrDefaultAsync(b => b.Id == boardId &&
                (b.OwnerId == userId || b.Members.Any(m => m.UserId == userId)));

        return board == null ? null : ToDto(board);
    }

    public async Task<BoardDto> CreateAsync(CreateBoardDto dto, int userId)
    {
        var board = new Board { Title = dto.Title, OwnerId = userId };
        _db.Boards.Add(board);
        await _db.SaveChangesAsync();
        return ToDto(board);
    }

    public async Task<BoardDto?> UpdateAsync(int boardId, UpdateBoardDto dto, int userId)
    {
        var board = await _db.Boards.FirstOrDefaultAsync(b => b.Id == boardId && b.OwnerId == userId);
        if (board == null) return null;

        board.Title = dto.Title;
        await _db.SaveChangesAsync();
        return ToDto(board);
    }

    public async Task<bool> DeleteAsync(int boardId, int userId)
    {
        var board = await _db.Boards.FirstOrDefaultAsync(b => b.Id == boardId && b.OwnerId == userId);
        if (board == null) return false;

        _db.Boards.Remove(board);
        await _db.SaveChangesAsync();
        return true;
    }

    private static BoardDto ToDto(Board b) => new()
    {
        Id = b.Id,
        Title = b.Title,
        CreatedAt = b.CreatedAt,
        OwnerId = b.OwnerId
    };
}
