'use client'

import { CreateWorkSpaceModal } from '@/app/features/workspaces/components/create-workspace-modal'
import { useEffect, useState } from 'react'

export const Modals = () => {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <>
            <CreateWorkSpaceModal />
        </>
    )
}
