using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Yello.DTOs.Board;
using Yello.Services;

namespace Yello.Controllers;

[ApiController]
[Route("api/boards")]
[Authorize]
public class BoardController : ControllerBase
{
    private readonly BoardService _boards;

    public BoardController(BoardService boards)
    {
        _boards = boards;
    }

    // Extrait l'id de l'utilisateur depuis le claim "sub" du JWT
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _boards.GetUserBoardsAsync(UserId));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var board = await _boards.GetByIdAsync(id, UserId);
        return board == null ? NotFound() : Ok(board);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateBoardDto dto)
    {
        var board = await _boards.CreateAsync(dto, UserId);
        return CreatedAtAction(nameof(GetById), new { id = board.Id }, board);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateBoardDto dto)
    {
        var board = await _boards.UpdateAsync(id, dto, UserId);
        return board == null ? NotFound() : Ok(board);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _boards.DeleteAsync(id, UserId);
        return deleted ? NoContent() : NotFound();
    }
}
