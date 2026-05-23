using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Yello.Data;
using Yello.DTOs.Comment;
using Yello.Entities;
using Yello.Hubs;

namespace Yello.Services;

public class CommentService
{
    private readonly AppDbContext _db;
    private readonly IHubContext<BoardHub> _hub;

    public CommentService(AppDbContext db, IHubContext<BoardHub> hub)
    {
        _db = db;
        _hub = hub;
    }

    public async Task<List<CommentDto>> GetByCardAsync(int cardId, int userId)
    {
        var hasAccess = await _db.Cards.AnyAsync(c => c.Id == cardId &&
            (c.List.Board.OwnerId == userId || c.List.Board.Members.Any(m => m.UserId == userId)));

        if (!hasAccess) return [];

        return await _db.Comments
            .Include(c => c.Author)
            .Where(c => c.CardId == cardId)
            .OrderBy(c => c.CreatedAt)
            .Select(c => ToDto(c))
            .ToListAsync();
    }

    public async Task<CommentDto?> CreateAsync(int cardId, CreateCommentDto dto, int userId)
    {
        // On charge la carte avec sa liste pour avoir le boardId pour SignalR
        var card = await _db.Cards
            .Include(c => c.List)
            .FirstOrDefaultAsync(c => c.Id == cardId &&
                (c.List.Board.OwnerId == userId || c.List.Board.Members.Any(m => m.UserId == userId)));

        if (card == null) return null;

        var comment = new Comment
        {
            Content = dto.Content,
            CardId = cardId,
            AuthorId = userId
        };

        _db.Comments.Add(comment);
        await _db.SaveChangesAsync();

        await _db.Entry(comment).Reference(c => c.Author).LoadAsync();

        var result = ToDto(comment);
        await _hub.Clients.Group($"board-{card.List.BoardId}")
            .SendAsync("CommentAdded", result);
        return result;
    }

    // Seul l'auteur peut modifier son commentaire
    public async Task<CommentDto?> UpdateAsync(int commentId, UpdateCommentDto dto, int userId)
    {
        var comment = await _db.Comments
            .Include(c => c.Author)
            .FirstOrDefaultAsync(c => c.Id == commentId && c.AuthorId == userId);

        if (comment == null) return null;

        comment.Content = dto.Content;
        comment.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return ToDto(comment);
    }

    // Seul l'auteur peut supprimer son commentaire
    public async Task<bool> DeleteAsync(int commentId, int userId)
    {
        var comment = await _db.Comments
            .FirstOrDefaultAsync(c => c.Id == commentId && c.AuthorId == userId);

        if (comment == null) return false;

        _db.Comments.Remove(comment);
        await _db.SaveChangesAsync();
        return true;
    }

    private static CommentDto ToDto(Comment c) => new()
    {
        Id = c.Id,
        Content = c.Content,
        CreatedAt = c.CreatedAt,
        UpdatedAt = c.UpdatedAt,
        AuthorId = c.AuthorId,
        AuthorUsername = c.Author.Username
    };
}
