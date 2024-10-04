import { useState } from 'react'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useCreateChannel } from '../api/use-create-channel'
import { useCreateChannelModal } from '../store/use-create-channel-modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useWorkspaceId } from '@/hooks/use-workspace-id'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export const CreateChannelModal = () => {
    const workspaceId = useWorkspaceId()
    const router = useRouter()
    const [open, setOpen] = useCreateChannelModal()
    const { mutate, isPending } = useCreateChannel()

    const [name, setName] = useState('')

    const handleClose = () => {
        setName('')
        setOpen(false)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\s+/g, '-').toLowerCase()
        setName(value)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        await mutate(
            { name, workspaceId },
            {
                onSuccess: (channelId) => {
                    handleClose()

                    // redirect to the new channel
                    toast.success('Channel created successfully')
                    router.push(`/workspace/${workspaceId}/channel/${channelId}`)
                },
                onError: () => {
                    toast.error('Failed to create a channel')
                },
            },
        )
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a new channel</DialogTitle>
                    <DialogDescription>A channel is a collection of conversations and documents.</DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <Input
                        value={name}
                        disabled={isPending}
                        required
                        autoFocus
                        minLength={3}
                        maxLength={80}
                        placeholder="e.g. planning, ideas, etc."
                        onChange={handleChange}
                    />
                    <div className="flex justify-end">
                        <Button disabled={isPending} type="submit">
                            Create Channel
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
