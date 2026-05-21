using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Yello.DTOs.Comment;
using Yello.Services;

namespace Yello.Controllers;

[ApiController]
[Authorize]
public class CommentController : ControllerBase
{
    private readonly CommentService _comments;

    public CommentController(CommentService comments)
    {
        _comments = comments;
    }

    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("api/cards/{cardId}/comments")]
    public async Task<IActionResult> GetByCard(int cardId) =>
        Ok(await _comments.GetByCardAsync(cardId, UserId));

    [HttpPost("api/cards/{cardId}/comments")]
    public async Task<IActionResult> Create(int cardId, CreateCommentDto dto)
    {
        var comment = await _comments.CreateAsync(cardId, dto, UserId);
        return comment == null ? Forbid() : Ok(comment);
    }

    [HttpPut("api/comments/{id}")]
    public async Task<IActionResult> Update(int id, UpdateCommentDto dto)
    {
        var comment = await _comments.UpdateAsync(id, dto, UserId);
        return comment == null ? NotFound() : Ok(comment);
    }

    [HttpDelete("api/comments/{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _comments.DeleteAsync(id, UserId);
        return deleted ? NoContent() : NotFound();
    }
}
