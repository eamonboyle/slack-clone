'use client'

import { useGetChannelById } from '@/app/features/channels/api/use-get-channel-by-id'
import { useChannelId } from '@/hooks/use-channel-id'
import { Loader, TriangleAlert } from 'lucide-react'
import { Header } from './header'
import { ChatInput } from './chat-input'
import { useGetMessages } from '@/app/features/messages/api/use-get-messages'

function LoadingState() {
    return (
        <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
            <Loader className="size-5 animate-spin text-muted-foreground" />
        </div>
    )
}

function ErrorState() {
    return (
        <div className="h-full flex-1 flex items-center justify-center flex-col gap-2">
            <TriangleAlert className="size-6 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Channel not found</span>
        </div>
    )
}

export default function ChannelIdPage() {
    const channelId = useChannelId()

    const { data: channel, isLoading: isChannelLoading } = useGetChannelById({ channelId })
    const { results: messages } = useGetMessages({ channelId })

    console.log(messages)

    if (isChannelLoading) {
        return <LoadingState />
    }

    if (!channel) {
        return <ErrorState />
    }

    return (
        <div className="flex flex-col h-full">
            <Header title={channel.name} />
            <div className="flex-1">{JSON.stringify(messages)}</div>
            <ChatInput placeholder={`Message # ${channel.name}`} />
        </div>
    )
}
