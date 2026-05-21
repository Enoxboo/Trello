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

    // Notifie tous les autres membres du board qu'une carte a été créée.
    public async Task CardCreated(int boardId, object card)
    {
        await Clients.OthersInGroup(GroupName(boardId))
            .SendAsync("CardCreated", card);
    }

    // Notifie que la position d'une carte a changé (drag & drop).
    public async Task CardMoved(int boardId, object move)
    {
        await Clients.OthersInGroup(GroupName(boardId))
            .SendAsync("CardMoved", move);
    }

    // Notifie qu'une carte a été modifiée (titre, description, date…).
    public async Task CardUpdated(int boardId, object card)
    {
        await Clients.OthersInGroup(GroupName(boardId))
            .SendAsync("CardUpdated", card);
    }

    // Notifie qu'un commentaire a été ajouté sur une carte du board.
    public async Task CommentAdded(int boardId, object comment)
    {
        await Clients.OthersInGroup(GroupName(boardId))
            .SendAsync("CommentAdded", comment);
    }

    // Notifie qu'une liste a été créée, modifiée ou déplacée.
    public async Task ListUpdated(int boardId, object list)
    {
        await Clients.OthersInGroup(GroupName(boardId))
            .SendAsync("ListUpdated", list);
    }

    private static string GroupName(int boardId) => $"board-{boardId}";
}
