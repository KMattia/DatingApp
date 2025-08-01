using System;
using System.Net.Mime;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class MessageRepository(AppDbContext context) : IMessageRepository
{
    public void AddGroup(Group group)
    {
        context.Groups.Add(group);
    }

    public void AddMessage(Message message)
    {
        context.Messages.Add(message);
    }

    public void DeleteMessage(Message message)
    {
        context.Messages.Remove(message);
    }

    public async Task<Connection?> GetConnection(string connectionId)
    {
        return await context.Connections.FindAsync(connectionId);
    }

    public async Task<Group?> GetGroupForConnection(string connectionId)
    {
        return await context.Groups
            .Include(x => x.Connections)
            .Where(x => x.Connections.Any(c => c.ConnectionId == connectionId))
            .FirstOrDefaultAsync();
    }

    public async Task<Message?> GetMessage(string messageId)
    {
        return await context.Messages.FindAsync(messageId);
    }

    public async Task<Group?> GetMessageGroup(string groupName)
    {
        return await context.Groups
        .Include(x => x.Connections)
        .FirstOrDefaultAsync(x => x.Name == groupName);
    }

    public async Task<PaginatedResult<MessageDto>> GetMessagesForMember(MessageParams messageParam)
    {
        var query = context.Messages
            .OrderByDescending(x => x.MessageSent)
            .AsQueryable();

        query = messageParam.Container switch
        {
            "Outbox" => query.Where(x => x.SenderId == messageParam.MemberId && x.SenderDeleted == false),
            _ => query.Where(x => x.RecipientId == messageParam.MemberId && x.RecipentDeleted == false)
        };

        var messageQuery = query.Select(MessageExtensions.ToDtoProjection());

        return await PaginationHelper.CreateAsync(messageQuery, messageParam.PageNumber, messageParam.PageSize);
    }

    public async Task<IReadOnlyList<MessageDto>> GetMessageThread(string currentMemberId, string recipientId)
    {
        await context.Messages
            .Where(x => x.RecipientId == currentMemberId && x.SenderId == recipientId && x.DateRead == null)
            .ExecuteUpdateAsync(setters => setters.SetProperty(x => x.DateRead, DateTime.UtcNow));

        return await context.Messages
                .Where(x => (x.RecipientId == currentMemberId && x.SenderId == recipientId && x.RecipentDeleted == false)
                         || (x.SenderId == currentMemberId && x.RecipientId == recipientId && x.SenderDeleted == false))
                .OrderBy(x => x.MessageSent)
                .Select(MessageExtensions.ToDtoProjection())
                .ToListAsync();
    }

    public async Task RemoveConnection(string connectionId)
    {
        await context.Connections
            .Where(x => x.ConnectionId == connectionId)
            .ExecuteDeleteAsync();
    }
}
