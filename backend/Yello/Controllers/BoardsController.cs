using Microsoft.AspNetCore.Mvc;
using Yello.DTOs;
using Yello.Services;

namespace Yello.Controllers;

[Route("api/[controller]")]
public class BoardsController(BoardService boardService) : BaseController
{
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await boardService.GetAllAsync(CurrentUserId));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var board = await boardService.GetByIdAsync(id, CurrentUserId);
        return board is null ? NotFound() : Ok(board);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateBoardDto dto)
    {
        var board = await boardService.CreateAsync(dto, CurrentUserId);
        return CreatedAtAction(nameof(GetById), new { id = board.Id }, board);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateBoardDto dto)
    {
        var board = await boardService.UpdateAsync(id, dto, CurrentUserId);
        return board is null ? NotFound() : Ok(board);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await boardService.DeleteAsync(id, CurrentUserId);
        return deleted ? NoContent() : NotFound();
    }
}
