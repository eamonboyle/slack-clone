import { useCurrentMember } from '@/features/members/api/use-current-member'
import { useGetWorkspace } from '@/features/workspaces/api/use-get-workspace'
import { useWorkspaceId } from '@/hooks/use-workspace-id'
import {
    AlertTriangle,
    Loader,
    MessageSquareText,
    SendHorizonal,
} from 'lucide-react'
import { WorkspaceHeader } from './workspace-header'
import { SidebarItem } from './sidebar-item'
import { useGetChannels } from '@/features/channels/api/use-get-channels'
import { WorkspaceSection } from './workspace-section'
import { useGetMembers } from '@/features/members/api/use-get-members'
import { UserItem } from './user-item'
import { useCreateChannelModal } from '@/features/channels/store/use-create-channel-modal'
import { useChannelId } from '@/hooks/use-channel-id'
import { useMemberId } from '@/hooks/use-member-id'

export const WorkspaceSidebar = () => {
    const workspaceId = useWorkspaceId()
    const channelId = useChannelId()
    const memberId = useMemberId()

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_open, setOpen] = useCreateChannelModal()

    const { data: workspace, isLoading: isWorkspaceLoading } = useGetWorkspace({
        workspaceId,
    })
    const { data: channels, isLoading: isChannelsLoading } = useGetChannels({
        workspaceId,
    })
    const { data: members, isLoading: isMembersLoading } = useGetMembers({
        workspaceId,
    })
    const { data: member, isLoading: isMemberLoading } = useCurrentMember({
        workspaceId,
    })

    if (
        isMemberLoading ||
        isWorkspaceLoading ||
        isChannelsLoading ||
        isMembersLoading
    ) {
        return (
            <div className="flex flex-col bg-[#5E2C5F] h-full items-center justify-center">
                <Loader className="size-5 animate-spin text-white" />
            </div>
        )
    }

    if (!workspace || !member) {
        return (
            <div className="flex flex-col gap-y-2 bg-[#5E2C5F] h-full items-center justify-center">
                <AlertTriangle className="size-5 text-white" />
                <span className="text-white text-sm">Workspace not found</span>
            </div>
        )
    }

    return (
        <div className="flex flex-col bg-[#5E2C5F] h-full">
            <WorkspaceHeader
                workspace={workspace}
                isAdmin={member.role === 'admin'}
            />

            <div className="flex flex-col px-2 mt-3">
                <SidebarItem
                    label="Threads"
                    icon={MessageSquareText}
                    id="threads"
                />
                <SidebarItem
                    label="Drafts & Sent"
                    icon={SendHorizonal}
                    id="drafts-sent"
                />
            </div>

            <WorkspaceSection
                label="Channels"
                hint="Add a channel"
                onNew={
                    member.role === 'admin' ? () => setOpen(true) : undefined
                }
            >
                {channels?.map((item) => (
                    <SidebarItem
                        key={item._id}
                        label={`# ${item.name}`}
                        icon={MessageSquareText}
                        id={item._id}
                        variant={channelId === item._id ? 'active' : 'default'}
                    />
                ))}
            </WorkspaceSection>

            <WorkspaceSection
                label="Direct Messages"
                hint="Add a direct message"
            >
                {members?.map((item) => (
                    <UserItem
                        key={item._id}
                        id={item._id}
                        label={item.user.name}
                        image={item.user.image}
                        variant={memberId === item._id ? 'active' : 'default'}
                    />
                ))}
            </WorkspaceSection>
        </div>
    )
}
