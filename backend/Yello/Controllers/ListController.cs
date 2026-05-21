using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Yello.DTOs.List;
using Yello.Services;

namespace Yello.Controllers;

[ApiController]
[Authorize]
public class ListController : ControllerBase
{
    private readonly ListService _lists;

    public ListController(ListService lists)
    {
        _lists = lists;
    }

    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("api/boards/{boardId}/lists")]
    public async Task<IActionResult> GetByBoard(int boardId) =>
        Ok(await _lists.GetByBoardAsync(boardId, UserId));

    [HttpPost("api/boards/{boardId}/lists")]
    public async Task<IActionResult> Create(int boardId, CreateListDto dto)
    {
        var list = await _lists.CreateAsync(boardId, dto, UserId);
        return list == null ? Forbid() : Ok(list);
    }

    [HttpPut("api/lists/{id}")]
    public async Task<IActionResult> Update(int id, UpdateListDto dto)
    {
        var list = await _lists.UpdateAsync(id, dto, UserId);
        return list == null ? NotFound() : Ok(list);
    }

    [HttpPatch("api/lists/{id}/position")]
    public async Task<IActionResult> Move(int id, MoveListDto dto)
    {
        var moved = await _lists.MoveAsync(id, dto, UserId);
        return moved ? NoContent() : NotFound();
    }

    [HttpDelete("api/lists/{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _lists.DeleteAsync(id, UserId);
        return deleted ? NoContent() : NotFound();
    }
}
