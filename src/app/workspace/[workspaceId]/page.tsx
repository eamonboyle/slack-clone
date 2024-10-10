'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Loader, TriangleAlert } from 'lucide-react'

import { useGetChannels } from '@/features/channels/api/use-get-channels'
import { useCreateChannelModal } from '@/features/channels/store/use-create-channel-modal'
import { useGetWorkspace } from '@/features/workspaces/api/use-get-workspace'
import { useWorkspaceId } from '@/hooks/use-workspace-id'
import { useCurrentMember } from '@/features/members/api/use-current-member'

export default function WorkspaceIdPage() {
    const router = useRouter()
    const workspaceId = useWorkspaceId()

    const { data: member, isLoading: isMemberLoading } = useCurrentMember({
        workspaceId,
    })
    const { data: workspace, isLoading: isWorkspaceLoading } = useGetWorkspace({
        workspaceId,
    })
    const { data: channels, isLoading: isChannelsLoading } = useGetChannels({
        workspaceId,
    })

    const channelId = useMemo(() => channels?.[0]?._id, [channels])
    const isAdmin = useMemo(() => member?.role === 'admin', [member])

    const [open, setOpen] = useCreateChannelModal()

    useEffect(() => {
        if (
            isWorkspaceLoading ||
            isChannelsLoading ||
            isMemberLoading ||
            !member ||
            !workspace
        )
            return

        if (channelId) {
            router.push(`/workspace/${workspaceId}/channel/${channelId}`)
            return
        } else if (!open && isAdmin) {
            setOpen(true)
        }
    }, [
        channelId,
        isAdmin,
        isChannelsLoading,
        isMemberLoading,
        isWorkspaceLoading,
        member,
        open,
        router,
        setOpen,
        workspace,
        workspaceId,
    ])

    if (isWorkspaceLoading || isChannelsLoading || isMemberLoading) {
        return (
            <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
                <Loader className="size-5 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!workspace || !member) {
        return (
            <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
                <TriangleAlert className="size-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                    Workspace not found
                </span>
            </div>
        )
    }

    return (
        <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
            <TriangleAlert className="size-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
                No channel found
            </span>
        </div>
    )
}
