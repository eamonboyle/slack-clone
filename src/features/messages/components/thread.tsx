import dynamic from 'next/dynamic'
import { useCallback, useRef, useState } from 'react'
import { AlertTriangle, Loader, XIcon } from 'lucide-react'
import { differenceInMinutes, format } from 'date-fns'
import { toast } from 'sonner'
import Quill from 'quill'

import { Id } from '../../../../convex/_generated/dataModel'

import { useWorkspaceId } from '@/hooks/use-workspace-id'
import { useChannelId } from '@/hooks/use-channel-id'
import { useGetMessage } from '@/features/messages/api/use-get-message'
import { useGetMessages } from '@/features/messages/api/use-get-messages'
import { useCurrentMember } from '@/features/members/api/use-current-member'
import { useCreateMessage } from '@/features/messages/api/use-create-message'
import { useGenerateUploadUrl } from '@/features/upload/api/use-generate-upload-url'

import { Button } from '@/components/ui/button'
import { Message } from '@/components/message'
import { formatDateLabel } from '@/lib/format-date-label'

const Editor = dynamic(() => import('@/components/editor'), { ssr: false })

const TIME_THRESHOLD = 5

interface ThreadProps {
    messageId: Id<'messages'>
    onClose: () => void
}

interface CreateMessageValues {
    channelId: Id<'channels'>
    workspaceId: Id<'workspaces'>
    parentMessageId: Id<'messages'>
    body: string
    image: Id<'_storage'> | undefined
}

export const Thread = ({ messageId, onClose }: ThreadProps) => {
    const channelId = useChannelId()
    const workspaceId = useWorkspaceId()

    const [editingId, setEditingId] = useState<Id<'messages'> | null>(null)
    const [editorKey, setEditorKey] = useState(0)
    const [isPending, setIsPending] = useState(false)

    const editorRef = useRef<Quill | null>(null)

    const { mutate: createMessage } = useCreateMessage()
    const { mutate: generateUploadUrl } = useGenerateUploadUrl()

    const { data: currentMember } = useCurrentMember({ workspaceId })
    const { data: message, isLoading: isLoadingMessage } = useGetMessage({ messageId })
    const {
        results: messages,
        status: messagesStatus,
        loadMore: loadMoreMessages,
    } = useGetMessages({ channelId, parentMessageId: messageId })

    const canLoadMore = messagesStatus === 'CanLoadMore'
    const isLoadingMore = messagesStatus === 'LoadingMore'

    const uploadImage = useCallback(
        async (image: File): Promise<Id<'_storage'> | undefined> => {
            const maxRetries = 3
            let attempt = 0
            while (attempt < maxRetries) {
                try {
                    const url = await generateUploadUrl({}, { throwError: true })
                    if (!url) throw new Error('Failed to generate upload url')

                    const result = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': image.type },
                        body: image,
                    })

                    if (!result.ok) throw new Error('Failed to upload image')

                    const { storageId } = await result.json()
                    return storageId
                } catch (error) {
                    attempt++
                    if (attempt >= maxRetries) {
                        console.error('Image upload failed after multiple attempts:', error)
                        toast.error('Failed to upload image')
                        return undefined
                    }
                }
            }
        },
        [generateUploadUrl],
    )

    const handleSubmit = useCallback(
        async ({ body, image }: { body: string; image: File | null }) => {
            try {
                setIsPending(true)
                if (editorRef.current) {
                    editorRef.current.enable(false)
                }

                const values: CreateMessageValues = {
                    workspaceId,
                    channelId,
                    parentMessageId: messageId,
                    body,
                    image: undefined,
                }

                if (image) {
                    const storageId = await uploadImage(image)
                    if (storageId) values.image = storageId
                }

                await createMessage(values, { throwError: true })
                setEditorKey((prevKey) => prevKey + 1)
            } catch (error) {
                console.error('Failed to create message:', error)
                toast.error('Failed to send message')
            } finally {
                setIsPending(false)
                if (editorRef.current) {
                    editorRef.current.enable(true)
                }
            }
        },
        [workspaceId, channelId, messageId, createMessage, uploadImage],
    )

    const groupedMessages = messages?.reduce(
        (groups, message) => {
            if (!message) return groups
            const date = new Date(message._creationTime)
            const dateKey = format(date, 'yyyy-MM-dd')
            if (!groups[dateKey]) {
                groups[dateKey] = []
            }
            groups[dateKey].unshift(message)
            return groups
        },
        {} as Record<string, typeof messages>,
    )

    if (isLoadingMessage || messagesStatus === 'LoadingFirstPage') {
        return (
            <div className="h-full flex flex-col">
                <div className="flex justify-between items-center px-4 h-[49px] border-b">
                    <p className="text-lg font-bold">Thread</p>
                    <Button onClick={onClose} size="iconSm" variant="ghost">
                        <XIcon className="size-5 stroke-1.5" />
                    </Button>
                </div>
                <div className="flex flex-col gap-y-2 h-full items-center justify-center">
                    <Loader className="size-5 animate-spin text-muted-foreground" />
                </div>
            </div>
        )
    }

    if (!message) {
        return (
            <div className="h-full flex flex-col">
                <div className="flex justify-between items-center px-4 h-[49px] border-b">
                    <p className="text-lg font-bold">Thread</p>
                    <Button onClick={onClose} size="iconSm" variant="ghost">
                        <XIcon className="size-5 stroke-1.5" />
                    </Button>
                </div>
                <div className="flex flex-col gap-y-2 h-full items-center justify-center">
                    <AlertTriangle className="size-5 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Message not found</p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center px-4 h-[49px] border-b">
                <p className="text-lg font-bold">Thread</p>
                <Button onClick={onClose} size="iconSm" variant="ghost">
                    <XIcon className="size-5 stroke-1.5" />
                </Button>
            </div>
            <div className="flex-1 flex flex-col-reverse pb-4 overflow-y-auto messages-scrollbar">
                {Object.entries(groupedMessages || {}).map(([dateKey, messages]) => (
                    <div key={dateKey}>
                        <div className="text-center my-2 relative">
                            <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300" />
                            <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm">
                                {formatDateLabel(dateKey)}
                            </span>
                        </div>
                        {messages.map((message, index) => {
                            if (!message) return null

                            const previousMessage = messages[index - 1]
                            const isCompact =
                                previousMessage &&
                                previousMessage.user?._id === message.user?._id &&
                                differenceInMinutes(
                                    new Date(message._creationTime),
                                    new Date(previousMessage._creationTime),
                                ) < TIME_THRESHOLD

                            return (
                                <Message
                                    hideThreadButton
                                    key={message._id}
                                    id={message._id}
                                    memberId={message.memberId}
                                    authorImage={message.user.image}
                                    authorName={message.user.name}
                                    isAuthor={message.memberId === currentMember?._id}
                                    reactions={message.reactions}
                                    body={message.body}
                                    image={message.image}
                                    updatedAt={message.updatedAt}
                                    createdAt={message._creationTime}
                                    isEditing={editingId === message._id}
                                    setEditingId={setEditingId}
                                    isCompact={isCompact ?? false}
                                    threadCount={message.threadCount}
                                    threadImage={message.threadImage}
                                    threadTimestamp={message.threadTimestamp}
                                />
                            )
                        })}
                    </div>
                ))}

                <div
                    className="h-1"
                    ref={(el) => {
                        if (el) {
                            const observer = new IntersectionObserver(
                                ([entry]) => {
                                    if (entry.isIntersecting && canLoadMore) {
                                        loadMoreMessages()
                                    }
                                },
                                {
                                    threshold: 1.0,
                                },
                            )

                            observer.observe(el)
                            return () => observer.disconnect()
                        }
                    }}
                />

                {isLoadingMore && (
                    <div className="text-center my-2 relative">
                        <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300" />
                        <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm">
                            <Loader className="size-4 animate-spin" />
                        </span>
                    </div>
                )}

                <Message
                    hideThreadButton
                    id={message._id}
                    memberId={message.memberId}
                    authorImage={message.user.image}
                    authorName={message.user.name}
                    createdAt={message._creationTime}
                    updatedAt={message.updatedAt}
                    isAuthor={message.memberId === currentMember?._id}
                    isEditing={editingId === message._id}
                    setEditingId={setEditingId}
                    body={message.body}
                    image={message.image}
                    reactions={message.reactions}
                />
            </div>

            <div className="px-4">
                <Editor
                    onSubmit={handleSubmit}
                    disabled={isPending}
                    placeholder="Reply to this thread"
                    key={editorKey}
                    innerRef={editorRef}
                />
            </div>
        </div>
    )
}
