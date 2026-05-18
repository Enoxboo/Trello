using Microsoft.AspNetCore.Mvc;
using Yello.DTOs;
using Yello.Services;

namespace Yello.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BoardsController(BoardService boardService) : ControllerBase
{
    // Temporaire : userId hardcodé à 1 jusqu'à l'intégration JWT (étape 2)
    private const int TempUserId = 1;

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await boardService.GetAllAsync(TempUserId));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var board = await boardService.GetByIdAsync(id, TempUserId);
        return board is null ? NotFound() : Ok(board);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateBoardDto dto)
    {
        var board = await boardService.CreateAsync(dto, TempUserId);
        return CreatedAtAction(nameof(GetById), new { id = board.Id }, board);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateBoardDto dto)
    {
        var board = await boardService.UpdateAsync(id, dto, TempUserId);
        return board is null ? NotFound() : Ok(board);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await boardService.DeleteAsync(id, TempUserId);
        return deleted ? NoContent() : NotFound();
    }
}
