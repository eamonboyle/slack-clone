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
