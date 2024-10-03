import { ConvexError, v } from 'convex/values'
import { query, mutation } from './_generated/server'
import { getAuthUserId } from '@convex-dev/auth/server'

export const get = query({
    args: {
        workspaceId: v.id('workspaces'),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx)

        if (userId === null) {
            return []
        }

        const member = await ctx.db
            .query('members')
            .withIndex('by_workspace_id_user_id', (q) => q.eq('workspaceId', args.workspaceId).eq('userId', userId))
            .unique()

        if (!member) {
            return []
        }

        const channels = await ctx.db
            .query('channels')
            .withIndex('by_workspace_id', (q) => q.eq('workspaceId', args.workspaceId))
            .collect()

        return channels
    },
})

export const create = mutation({
    args: {
        workspaceId: v.id('workspaces'),
        name: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx)

        if (userId === null) {
            throw new ConvexError('Unauthorized')
        }

        const member = await ctx.db
            .query('members')
            .withIndex('by_workspace_id_user_id', (q) => q.eq('workspaceId', args.workspaceId).eq('userId', userId))
            .unique()

        if (member === null || member.role !== 'admin') {
            throw new ConvexError('Unauthorized')
        }

        const channel = await ctx.db.insert('channels', {
            name: args.name,
            workspaceId: args.workspaceId,
        })

        return channel
    },
})

export const update = mutation({
    args: {
        channelId: v.id('channels'),
        workspaceId: v.id('workspaces'),
        name: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx)

        if (userId === null) {
            throw new ConvexError('Unauthorized')
        }

        const member = await ctx.db
            .query('members')
            .withIndex('by_workspace_id_user_id', (q) => q.eq('workspaceId', args.workspaceId).eq('userId', userId))
            .unique()

        if (member === null || member.role !== 'admin') {
            throw new ConvexError('Unauthorized')
        }

        await ctx.db.patch(args.channelId, {
            name: args.name,
        })

        return args.channelId
    },
})

export const deleteChannel = mutation({
    args: {
        channelId: v.id('channels'),
        workspaceId: v.id('workspaces'),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx)

        if (userId === null) {
            throw new ConvexError('Unauthorized')
        }

        const member = await ctx.db
            .query('members')
            .withIndex('by_workspace_id_user_id', (q) => q.eq('workspaceId', args.workspaceId).eq('userId', userId))
            .unique()

        if (member === null || member.role !== 'admin') {
            throw new ConvexError('Unauthorized')
        }

        await ctx.db.delete(args.channelId)
    },
})
