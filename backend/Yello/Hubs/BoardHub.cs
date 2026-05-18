using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Yello.Hubs;

[Authorize]
public class BoardHub : Hub
{
    public async Task JoinBoard(int boardId) =>
        await Groups.AddToGroupAsync(Context.ConnectionId, $"board-{boardId}");

    public async Task LeaveBoard(int boardId) =>
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"board-{boardId}");
}
