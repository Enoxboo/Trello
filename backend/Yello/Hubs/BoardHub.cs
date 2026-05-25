using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Yello.Hubs;

[Authorize]
public class BoardHub : Hub
{
    // Appelé par le client quand il ouvre un board.
    // Le client rejoint un groupe SignalR nommé "board-{id}" pour recevoir
    // uniquement les événements du board qu'il consulte.
    public async Task JoinBoard(int boardId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, GroupName(boardId));

        var username = Context.User?.FindFirstValue("username") ?? "Inconnu";
        await Clients.OthersInGroup(GroupName(boardId))
            .SendAsync("UserJoined", new { username, boardId });
    }

    // Appelé quand le client ferme le board ou se déconnecte.
    public async Task LeaveBoard(int boardId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupName(boardId));

        var username = Context.User?.FindFirstValue("username") ?? "Inconnu";
        await Clients.OthersInGroup(GroupName(boardId))
            .SendAsync("UserLeft", new { username, boardId });
    }

    private static string GroupName(int boardId) => $"board-{boardId}";
}
