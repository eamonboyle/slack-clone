import dynamic from 'next/dynamic'
import { Doc, Id } from '../../convex/_generated/dataModel'
import { format, isToday, isYesterday } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

import { useConfirm } from '@/hooks/use-confirm'
import { useDeleteMessage } from '@/app/features/messages/api/use-delete-message'
import { useUpdateMessage } from '@/app/features/messages/api/use-update-message'
import { useToggleReaction } from '@/app/features/reactions/api/use-toggle-reaction'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Hint } from './hint'
import { Reactions } from './reactions'
import { Thumbnail } from './thumbnail'
import { Toolbar } from './toolbar'

const Renderer = dynamic(() => import('@/components/renderer'), { ssr: false })
const Editor = dynamic(() => import('@/components/editor'), { ssr: false })

interface MessageProps {
    id: Id<'messages'>
    memberId: Id<'members'>
    authorImage?: string
    authorName?: string
    isAuthor: boolean
    reactions: Array<Omit<Doc<'reactions'>, 'memberId'> & { count: number; memberIds: Id<'members'>[] }>
    body: Doc<'messages'>['body']
    image: string | null | undefined
    createdAt: Doc<'messages'>['_creationTime']
    updatedAt: Doc<'messages'>['updatedAt']
    isEditing: boolean
    isCompact?: boolean
    setEditingId: (id: Id<'messages'> | null) => void
    hideThreadButton?: boolean
    threadCount?: number
    threadImage?: string
    threadTimestamp?: number
}

const formatFullTime = (date: Date) => {
    return `${isToday(date) ? 'Today' : isYesterday(date) ? 'Yesterday' : format(date, 'MMM d, yyyy')} at ${format(date, 'h:mm:ss a')}`
}

export const Message = ({
    id,
    memberId,
    authorImage,
    authorName = 'Member',
    isAuthor,
    reactions,
    body,
    image,
    createdAt,
    updatedAt,
    isEditing,
    isCompact,
    setEditingId,
    hideThreadButton,
    threadCount,
    threadImage,
    threadTimestamp,
}: MessageProps) => {
    const [ConfirmDialog, confirm] = useConfirm('Delete message', 'Are you sure you want to delete this message?')

    const { mutate: updateMessage, isPending: isUpdatingMessage } = useUpdateMessage()
    const { mutate: deleteMessage, isPending: isDeletingMessage } = useDeleteMessage()
    const { mutate: toggleReaction, isPending: isTogglingReaction } = useToggleReaction()

    const isPending = isUpdatingMessage || isDeletingMessage || isTogglingReaction

    const handleUpdateMessage = ({ body }: { body: string }) => {
        updateMessage(
            { messageId: id, body },
            {
                onSuccess: () => {
                    toast.success('Message Updated')
                    setEditingId(null)

                    // close thread if it's open
                },
                onError: () => {
                    toast.error('Failed to update message')
                },
            },
        )
    }

    const handleDeleteMessage = async () => {
        const ok = await confirm()

        if (!ok) return

        deleteMessage(
            { messageId: id },
            {
                onSuccess: () => {
                    toast.success('Message Deleted')
                    setEditingId(null)
                },
                onError: () => {
                    toast.error('Failed to delete message')
                },
            },
        )
    }

    const handleToggleReaction = (emoji: string) => {
        toggleReaction(
            { messageId: id, emoji },
            {
                onError: () => {
                    toast.error('Failed to toggle reaction')
                },
            },
        )
    }

    if (isCompact) {
        return (
            <>
                <ConfirmDialog />
                <div
                    className={cn(
                        'flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative',
                        isEditing && 'bg-[#F2C74433] hover:bg-bg-[#F2C74433]',
                        isDeletingMessage &&
                            'bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200',
                    )}
                >
                    <div className="flex items-start gap-2">
                        <Hint label={formatFullTime(new Date(createdAt))}>
                            <button className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-[40px] leading-[22px] text-center hover:underline">
                                {format(new Date(createdAt), 'hh:mm')}
                            </button>
                        </Hint>
                        {isEditing ? (
                            <div className="w-full h-full">
                                <Editor
                                    defaultValue={JSON.parse(body)}
                                    onSubmit={handleUpdateMessage}
                                    disabled={isPending}
                                    onCancel={() => setEditingId(null)}
                                    variant="update"
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col w-full">
                                <Renderer value={body} />
                                <Thumbnail url={image} />
                                {updatedAt && <span className="text-xs text-muted-foreground">(edited)</span>}
                                <Reactions data={reactions} onChange={handleToggleReaction} />
                            </div>
                        )}
                    </div>

                    {!isEditing && (
                        <Toolbar
                            isAuthor={isAuthor}
                            isPending={isPending}
                            handleEdit={() => setEditingId(id)}
                            handleThread={() => {}}
                            handleDelete={handleDeleteMessage}
                            handleReaction={handleToggleReaction}
                            hideThreadButton={hideThreadButton ?? false}
                        />
                    )}
                </div>
            </>
        )
    }

    return (
        <>
            <ConfirmDialog />
            <div
                className={cn(
                    'flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative',
                    isEditing && 'bg-[#F2C74433] hover:bg-bg-[#F2C74433]',
                    isDeletingMessage && 'bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-200',
                )}
            >
                <div className="flex items-center gap-2">
                    <button>
                        <Avatar>
                            <AvatarImage src={authorImage} />
                            <AvatarFallback>{authorName.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                    </button>
                    {isEditing ? (
                        <div className="w-full h-full">
                            <Editor
                                defaultValue={JSON.parse(body)}
                                onSubmit={handleUpdateMessage}
                                disabled={isPending}
                                onCancel={() => setEditingId(null)}
                                variant="update"
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col w-full overflow-hidden">
                            <div className="text-sm">
                                <button onClick={() => {}} className="font-semibold text-primary hover:underline">
                                    {authorName}
                                </button>
                                <span>&nbsp;&nbsp;</span>
                                <Hint label={formatFullTime(new Date(createdAt))}>
                                    <button className="text-xs text-muted-foreground hover:underline">
                                        {format(new Date(createdAt), 'hh:mm a')}
                                    </button>
                                </Hint>
                            </div>
                            <Renderer value={body} />
                            <Thumbnail url={image} />
                            {updatedAt && <span className="text-xs text-muted-foreground">(edited)</span>}
                            <Reactions data={reactions} onChange={handleToggleReaction} />
                        </div>
                    )}
                </div>

                {!isEditing && (
                    <Toolbar
                        isAuthor={isAuthor}
                        isPending={isPending}
                        handleEdit={() => setEditingId(id)}
                        handleThread={() => {}}
                        handleDelete={handleDeleteMessage}
                        handleReaction={handleToggleReaction}
                        hideThreadButton={hideThreadButton ?? false}
                    />
                )}
            </div>
        </>
    )
}
