'use client'

import { useGetWorkspace } from '@/app/features/workspaces/api/use-get-workspace'
import { useWorkspaceId } from '@/hooks/use-workspace-id'

export default function WorkspaceIdPage() {
    const workspaceId = useWorkspaceId()
    const { data, isLoading } = useGetWorkspace({ workspaceId })

    if (isLoading) return <div>Loading...</div>

    return <div>Workspace {data?.name}</div>
}
