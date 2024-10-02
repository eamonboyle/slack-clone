interface WorkspacePageProps {
    params: {
        workspaceId: string
    }
}

export default function WorkspacePage({ params }: WorkspacePageProps) {
    return <div>Workspace {params.workspaceId}</div>
}
