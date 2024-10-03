import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getAuthUserId } from '@convex-dev/auth/server'

const generateJoinCode = () => {
    const code = Array.from({ length: 6 }, () => '0123456789abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 36)])

    return code.join('')
}

export const create = mutation({
    args: {
        name: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx)

        if (userId === null) {
            throw new ConvexError('Unauthorized')
        }

        const joinCode = generateJoinCode()

        const workspaceId = await ctx.db.insert('workspaces', {
            name: args.name,
            userId,
            joinCode,
        })

        await ctx.db.insert('members', {
            userId,
            workspaceId,
            role: 'admin',
        })

        await ctx.db.insert('channels', {
            name: 'general',
            workspaceId,
        })

        return workspaceId
    },
})

export const get = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx)

        if (userId === null) {
            return []
        }

        const members = await ctx.db
            .query('members')
            .withIndex('by_user_id', (q) => q.eq('userId', userId))
            .collect()

        const workspaceIds = members.map((member) => member.workspaceId)

        const workspaces = []

        for (const workspaceId of workspaceIds) {
            const workspace = await ctx.db.get(workspaceId)

            if (workspace) {
                workspaces.push(workspace)
            }
        }

        return workspaces
    },
})

export const getById = query({
    args: {
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

        if (!member) {
            return null
        }

        return await ctx.db.get(args.workspaceId)
    },
})

export const update = mutation({
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

        if (!member || member.role !== 'admin') {
            throw new ConvexError('Unauthorized')
        }

        await ctx.db.patch(args.workspaceId, {
            name: args.name,
        })

        return args.workspaceId
    },
})

export const deleteById = mutation({
    args: {
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

        if (!member || member.role !== 'admin') {
            throw new ConvexError('Unauthorized')
        }

        const [members] = await Promise.all([
            ctx.db
                .query('members')
                .withIndex('by_workspace_id', (q) => q.eq('workspaceId', args.workspaceId))
                .collect(),
        ])

        for (const member of members) {
            await ctx.db.delete(member._id)
        }

        // delete workspace
        await ctx.db.delete(args.workspaceId)

        return args.workspaceId
    },
})

export const resetJoinCode = mutation({
    args: {
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

        if (!member || member.role !== 'admin') {
            throw new ConvexError('Unauthorized')
        }

        const joinCode = generateJoinCode()

        await ctx.db.patch(args.workspaceId, {
            joinCode,
        })

        return args.workspaceId
    },
})
