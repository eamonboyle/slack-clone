import { useCurrentMember } from '@/app/features/members/api/use-current-member'
import { useGetWorkspace } from '@/app/features/workspaces/api/use-get-workspace'
import { useWorkspaceId } from '@/hooks/use-workspace-id'
import { AlertTriangle, Loader } from 'lucide-react'
import { WorkspaceHeader } from './workspace-header'

export const WorkspaceSidebar = () => {
    const workspaceId = useWorkspaceId()
    const { data: member, isLoading: isMemberLoading } = useCurrentMember({ workspaceId })
    const { data: workspace, isLoading: isWorkspaceLoading } = useGetWorkspace({ workspaceId })

    if (isMemberLoading || isWorkspaceLoading) {
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
            <WorkspaceHeader workspace={workspace} isAdmin={member.role === 'admin'} />
        </div>
    )
}
