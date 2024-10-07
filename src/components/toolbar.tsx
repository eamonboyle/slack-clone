import { MessageSquareText, Pencil, Smile, Trash } from 'lucide-react'

import { Hint } from '@/components/hint'
import { Button } from './ui/button'
import { EmojiPopover } from './emoji-popover'

interface ToolbarProps {
    isAuthor: boolean
    isPending: boolean
    handleEdit: () => void
    handleThread: () => void
    handleDelete: () => void
    handleReaction: (value: string) => void
    hideThreadButton: boolean
}

export const Toolbar = ({
    isAuthor,
    isPending,
    handleEdit,
    handleThread,
    handleDelete,
    handleReaction,
    hideThreadButton,
}: ToolbarProps) => {
    return (
        <div className="absolute top-0 right-5">
            <div className="group-hover:opacity-100 opacity-0 transition-opacity duration-300 border bg-white rounded-md shadow-sm">
                <EmojiPopover onEmojiSelect={(emoji) => handleReaction(emoji.native)} hint="Add Reaction">
                    <Button variant="ghost" size="iconSm" disabled={isPending}>
                        <Smile className="size-4" />
                    </Button>
                </EmojiPopover>
                {!hideThreadButton && (
                    <Hint label="Reply in Thread">
                        <Button variant="ghost" size="iconSm" disabled={isPending} onClick={handleThread}>
                            <MessageSquareText className="size-4" />
                        </Button>
                    </Hint>
                )}
                {isAuthor && (
                    <>
                        <Hint label="Edit Message">
                            <Button variant="ghost" size="iconSm" disabled={isPending} onClick={handleEdit}>
                                <Pencil className="size-4" />
                            </Button>
                        </Hint>
                        <Hint label="Delete Message">
                            <Button variant="ghost" size="iconSm" disabled={isPending} onClick={handleDelete}>
                                <Trash className="size-4" />
                            </Button>
                        </Hint>
                    </>
                )}
            </div>
        </div>
    )
}
