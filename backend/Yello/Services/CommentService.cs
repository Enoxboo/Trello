using Microsoft.EntityFrameworkCore;
using Yello.Data;
using Yello.DTOs;
using Yello.Entities;

namespace Yello.Services;

public class CommentService(AppDbContext db)
{
    public async Task<CommentDto?> CreateAsync(int cardId, CreateCommentDto dto, int userId)
    {
        var card = await db.Cards
            .Include(c => c.List).ThenInclude(l => l.Board)
            .FirstOrDefaultAsync(c => c.Id == cardId && c.List.Board.UserId == userId);
        if (card is null) return null;

        var comment = new Comment { Content = dto.Content, CardId = cardId, UserId = userId };
        db.Comments.Add(comment);
        await db.SaveChangesAsync();

        var user = await db.Users.FindAsync(userId);
        return new CommentDto(comment.Id, comment.Content, comment.CreatedAt, user?.Username ?? "");
    }

    public async Task<CommentDto?> UpdateAsync(int id, UpdateCommentDto dto, int userId)
    {
        var comment = await db.Comments
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
        if (comment is null) return null;

        comment.Content = dto.Content;
        await db.SaveChangesAsync();

        return new CommentDto(comment.Id, comment.Content, comment.CreatedAt, comment.User.Username);
    }

    public async Task<bool> DeleteAsync(int id, int userId)
    {
        var comment = await db.Comments.FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
        if (comment is null) return false;

        db.Comments.Remove(comment);
        await db.SaveChangesAsync();
        return true;
    }
}
