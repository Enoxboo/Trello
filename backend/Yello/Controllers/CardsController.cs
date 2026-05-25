using Microsoft.AspNetCore.Mvc;
using Yello.DTOs;
using Yello.Services;

namespace Yello.Controllers;

[Route("api/[controller]")]
public class CardsController(CardService cardService, CommentService commentService, LabelService labelService) : BaseController
{
    [HttpPost]
    public async Task<IActionResult> Create(CreateCardDto dto)
    {
        var card = await cardService.CreateAsync(dto, CurrentUserId);
        return card is null ? Forbid() : Ok(card);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateCardDto dto)
    {
        var card = await cardService.UpdateAsync(id, dto, CurrentUserId);
        return card is null ? NotFound() : Ok(card);
    }

    [HttpPut("{id}/move")]
    public async Task<IActionResult> Move(int id, MoveCardDto dto)
    {
        var card = await cardService.MoveAsync(id, dto, CurrentUserId);
        return card is null ? NotFound() : Ok(card);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await cardService.DeleteAsync(id, CurrentUserId);
        return deleted ? NoContent() : NotFound();
    }

    [HttpPost("{cardId}/comments")]
    public async Task<IActionResult> AddComment(int cardId, CreateCommentDto dto)
    {
        var comment = await commentService.CreateAsync(cardId, dto, CurrentUserId);
        return comment is null ? NotFound() : Ok(comment);
    }

    [HttpPut("{cardId}/comments/{commentId}")]
    public async Task<IActionResult> UpdateComment(int commentId, UpdateCommentDto dto)
    {
        var comment = await commentService.UpdateAsync(commentId, dto, CurrentUserId);
        return comment is null ? NotFound() : Ok(comment);
    }

    [HttpDelete("{cardId}/comments/{commentId}")]
    public async Task<IActionResult> DeleteComment(int commentId)
    {
        var deleted = await commentService.DeleteAsync(commentId, CurrentUserId);
        return deleted ? NoContent() : NotFound();
    }

    [HttpPost("{cardId}/labels")]
    public async Task<IActionResult> AddLabel(int cardId, CreateLabelDto dto)
    {
        var label = await labelService.CreateAsync(cardId, dto, CurrentUserId);
        return label is null ? NotFound() : Ok(label);
    }

    [HttpDelete("{cardId}/labels/{labelId}")]
    public async Task<IActionResult> DeleteLabel(int labelId)
    {
        var deleted = await labelService.DeleteAsync(labelId, CurrentUserId);
        return deleted ? NoContent() : NotFound();
    }
}
