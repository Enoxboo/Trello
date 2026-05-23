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
        var boards = await _db.Boards
            .Where(b => b.OwnerId == userId || b.Members.Any(m => m.UserId == userId))
            .ToListAsync();
        return boards.Select(ToDto).ToList();
    }

    public async Task<BoardDto?> GetByIdAsync(int boardId, int userId)
    {
        var board = await _db.Boards
            .Include(b => b.Owner)
            .Include(b => b.Members)
                .ThenInclude(m => m.User)
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

    public async Task<string?> GenerateInviteCodeAsync(int boardId, int userId)
    {
        var board = await _db.Boards.FirstOrDefaultAsync(b => b.Id == boardId && b.OwnerId == userId);
        if (board == null) return null;

        board.InviteCode = GenerateCode();
        await _db.SaveChangesAsync();
        return board.InviteCode;
    }

    public async Task<bool> LeaveAsync(int boardId, int userId)
    {
        var isOwner = await _db.Boards.AnyAsync(b => b.Id == boardId && b.OwnerId == userId);
        if (isOwner) return false;

        var member = await _db.BoardMembers
            .FirstOrDefaultAsync(m => m.BoardId == boardId && m.UserId == userId);
        if (member == null) return false;

        _db.BoardMembers.Remove(member);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<BoardDto?> JoinByCodeAsync(string code, int userId)
    {
        var board = await _db.Boards
            .Include(b => b.Members)
            .FirstOrDefaultAsync(b => b.InviteCode == code);
        if (board == null) return null;

        if (board.OwnerId != userId && !board.Members.Any(m => m.UserId == userId))
        {
            board.Members.Add(new BoardMember { BoardId = board.Id, UserId = userId });
            await _db.SaveChangesAsync();
        }

        return ToDto(board);
    }

    private static string GenerateCode()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        return new string(Enumerable.Range(0, 6).Select(_ => chars[Random.Shared.Next(chars.Length)]).ToArray());
    }

    private static BoardDto ToDto(Board b) => new()
    {
        Id = b.Id,
        Title = b.Title,
        CreatedAt = b.CreatedAt,
        OwnerId = b.OwnerId,
        OwnerUsername = b.Owner?.Username,
        InviteCode = b.InviteCode,
        Members = b.Members?.Select(m => new BoardMemberDto
        {
            UserId = m.UserId,
            Username = m.User?.Username ?? string.Empty
        }).ToList() ?? []
    };
}
