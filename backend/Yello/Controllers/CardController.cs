using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Yello.DTOs.Card;
using Yello.Services;

namespace Yello.Controllers;

[ApiController]
[Authorize]
public class CardController : ControllerBase
{
    private readonly CardService _cards;

    public CardController(CardService cards)
    {
        _cards = cards;
    }

    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("api/lists/{listId}/cards")]
    public async Task<IActionResult> GetByList(int listId) =>
        Ok(await _cards.GetByListAsync(listId, UserId));

    [HttpGet("api/cards/{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var card = await _cards.GetByIdAsync(id, UserId);
        return card == null ? NotFound() : Ok(card);
    }

    [HttpPost("api/lists/{listId}/cards")]
    public async Task<IActionResult> Create(int listId, CreateCardDto dto)
    {
        var card = await _cards.CreateAsync(listId, dto, UserId);
        return card == null ? Forbid() : Ok(card);
    }

    [HttpPut("api/cards/{id}")]
    public async Task<IActionResult> Update(int id, UpdateCardDto dto)
    {
        var card = await _cards.UpdateAsync(id, dto, UserId);
        return card == null ? NotFound() : Ok(card);
    }

    [HttpPatch("api/cards/{id}/position")]
    public async Task<IActionResult> Move(int id, MoveCardDto dto)
    {
        var moved = await _cards.MoveAsync(id, dto, UserId);
        return moved ? NoContent() : NotFound();
    }

    [HttpDelete("api/cards/{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _cards.DeleteAsync(id, UserId);
        return deleted ? NoContent() : NotFound();
    }

    [HttpPost("api/cards/{cardId}/labels")]
    public async Task<IActionResult> AddLabel(int cardId, CreateLabelDto dto)
    {
        var label = await _cards.AddLabelAsync(cardId, dto, UserId);
        return label == null ? Forbid() : Ok(label);
    }

    [HttpDelete("api/cards/{cardId}/labels/{labelId}")]
    public async Task<IActionResult> RemoveLabel(int cardId, int labelId)
    {
        var removed = await _cards.RemoveLabelAsync(cardId, labelId, UserId);
        return removed ? NoContent() : NotFound();
    }

    [HttpPost("api/cards/{cardId}/members/{userId}")]
    public async Task<IActionResult> AddMember(int cardId, int userId)
    {
        var added = await _cards.AddMemberAsync(cardId, userId, UserId);
        return added ? NoContent() : Forbid();
    }

    [HttpDelete("api/cards/{cardId}/members/{userId}")]
    public async Task<IActionResult> RemoveMember(int cardId, int userId)
    {
        var removed = await _cards.RemoveMemberAsync(cardId, userId, UserId);
        return removed ? NoContent() : NotFound();
    }
}
