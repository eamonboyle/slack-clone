'use client'

import { useEffect, useState } from 'react'

import { CreateChannelModal } from '@/app/features/channels/components/create-channel-modal'
import { CreateWorkSpaceModal } from '@/app/features/workspaces/components/create-workspace-modal'

export const Modals = () => {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <>
            <CreateWorkSpaceModal />
            <CreateChannelModal />
        </>
    )
}
