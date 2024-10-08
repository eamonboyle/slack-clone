import { useGetWorkspace } from '@/features/workspaces/api/use-get-workspace'
import { useGetWorkspaces } from '@/features/workspaces/api/use-get-workspaces'
import { useCreateWorkspaceModal } from '@/features/workspaces/store/use-create-workspace-modal'

import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useWorkspaceId } from '@/hooks/use-workspace-id'
import { Loader, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Workspace {
    _id: string
    name: string
}

export default function WorkspaceSwitcher() {
    const router = useRouter()
    const workspaceId = useWorkspaceId()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_open, setOpen] = useCreateWorkspaceModal()
    const { data: workspaces, isLoading: workspacesLoading } = useGetWorkspaces()
    const { data: workspace, isLoading: workspaceLoading } = useGetWorkspace({ workspaceId })

    const filteredWorkspaces = workspaces?.filter((ws) => ws._id !== workspaceId)

    if (workspacesLoading) {
        return <Loader className="size-5 animate-spin" /> // Show loading indicator for workspaces
    }

    const renderWorkspaceItem = (ws: Workspace) => (
        <DropdownMenuItem
            key={ws._id}
            onClick={() => router.push(`/workspace/${ws._id}`)}
            className="cursor-pointer capitalize overflow-hidden"
        >
            <div className="shrink-0 size-9 relative overflow-hidden bg-[#616061] text-white font-semibold text-lg rounded-md flex items-center justify-center mr-2">
                {ws.name.charAt(0).toUpperCase()}
            </div>
            <p className="truncate">{ws.name}</p>
        </DropdownMenuItem>
    )

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className="size-9 relative overflow-hidden bg-[#ABABAD] hover:bg-[#ABABAD]/80 text-slate-800 font-semibold text-xl">
                    {workspaceLoading ? (
                        <Loader className="size-5 animate-spin shrink-0" />
                    ) : (
                        <span>{workspace?.name ? workspace.name.charAt(0).toUpperCase() : 'N/A'}</span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="start" className="w-64">
                <DropdownMenuItem
                    onClick={() => router.push(`/workspace/${workspaceId}`)}
                    className="cursor-pointer flex-col justify-start items-start capitalize"
                >
                    {workspace?.name}
                    <span className="text-xs text-muted-foreground">Active workspace</span>
                </DropdownMenuItem>
                {filteredWorkspaces?.map(renderWorkspaceItem)}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setOpen(true)} className="cursor-pointer">
                    <div className="size-9 relative overflow-hidden bg-[#F2F2F2] text-slate-800 font-semibold text-lg rounded-md flex items-center justify-center mr-2">
                        <Plus className="size-5" />
                    </div>
                    <span>Create workspace</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
