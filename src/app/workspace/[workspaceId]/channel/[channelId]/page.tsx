'use client'

import { Loader, TriangleAlert } from 'lucide-react'

import { useGetChannelById } from '@/features/channels/api/use-get-channel-by-id'
import { useGetMessages } from '@/features/messages/api/use-get-messages'
import { useChannelId } from '@/hooks/use-channel-id'
import { MessageList } from '@/components/message-list'
import { Header } from './header'
import { ChatInput } from './chat-input'

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
    const { results: messages, status, loadMore } = useGetMessages({ channelId })

    if (isChannelLoading || status === 'LoadingFirstPage') {
        return <LoadingState />
    }

    if (!channel) {
        return <ErrorState />
    }

    return (
        <div className="flex flex-col h-full">
            <Header title={channel.name} />
            <MessageList
                channelName={channel.name}
                channelCreationTime={channel._creationTime}
                data={messages}
                loadMore={loadMore}
                isLoadingMore={status === 'LoadingMore'}
                canLoadMore={status === 'CanLoadMore'}
            />
            <ChatInput placeholder={`Message # ${channel.name}`} />
        </div>
    )
}
