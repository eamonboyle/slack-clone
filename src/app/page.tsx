'use client'

import { useEffect, useMemo } from 'react'
import { Loader } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { useGetWorkspaces } from '@/features/workspaces/api/use-get-workspaces'
import { useCreateWorkspaceModal } from '@/features/workspaces/store/use-create-workspace-modal'

export default function Home() {
    const [open, setOpen] = useCreateWorkspaceModal()
    const router = useRouter()
    const { data, isLoading } = useGetWorkspaces()

    const workspaceId = useMemo(() => data?.[0]?._id, [data])

    useEffect(() => {
        if (isLoading) return

        if (workspaceId) {
            router.replace(`/workspace/${workspaceId}`)
        } else if (!open) {
            setOpen(true)
        }
    }, [isLoading, open, router, setOpen, workspaceId])

    return (
        <div className="flex h-full items-center justify-center">
            <Loader className="size-5 animate-spin text-muted-foreground" />
        </div>
    )
}
