'use client'

import { useGetChannelById } from '@/app/features/channels/api/use-get-channel-by-id'
import { useChannelId } from '@/hooks/use-channel-id'
import { Loader, TriangleAlert } from 'lucide-react'
import { Header } from './header'

export default function ChannelPage() {
    const channelId = useChannelId()

    const { data: channel, isLoading: isChannelLoading } = useGetChannelById({ channelId })

    if (isChannelLoading) {
        return (
            <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
                <Loader className="size-5 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!channel) {
        return (
            <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
                <TriangleAlert className="size-6 text-muted-foreground" />
                <span className=" text-sm text-muted-foreground">Channel not found</span>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <Header title={channel.name} />
        </div>
    )
}
