using Microsoft.AspNetCore.Mvc;
using Yello.DTOs;
using Yello.Services;

namespace Yello.Controllers;

[Route("api/[controller]")]
public class ListsController(ListService listService) : BaseController
{
    [HttpPost]
    public async Task<IActionResult> Create(CreateListDto dto)
    {
        var list = await listService.CreateAsync(dto, CurrentUserId);
        return list is null ? Forbid() : Ok(list);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateListDto dto)
    {
        var list = await listService.UpdateAsync(id, dto, CurrentUserId);
        return list is null ? NotFound() : Ok(list);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await listService.DeleteAsync(id, CurrentUserId);
        return deleted ? NoContent() : NotFound();
    }

    [HttpPut("reorder/{boardId}")]
    public async Task<IActionResult> Reorder(int boardId, List<int> orderedIds)
    {
        var success = await listService.ReorderAsync(boardId, orderedIds, CurrentUserId);
        return success ? NoContent() : NotFound();
    }
}
