import { useState } from 'react'
import { FaChevronDown } from 'react-icons/fa'
import { Trash } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useChannelId } from '@/hooks/use-channel-id'
import { Input } from '@/components/ui/input'
import { DialogClose } from '@radix-ui/react-dialog'
import { useUpdateChannel } from '@/features/channels/api/use-update-channel'
import { toast } from 'sonner'
import { useDeleteChannel } from '@/features/channels/api/use-delete-channel'
import { useConfirm } from '@/hooks/use-confirm'
import { useRouter } from 'next/navigation'
import { useWorkspaceId } from '@/hooks/use-workspace-id'
import { useCurrentMember } from '@/features/members/api/use-current-member'

interface HeaderProps {
    title: string
}

export const Header = ({ title }: HeaderProps) => {
    const router = useRouter()

    const [editOpen, setEditOpen] = useState(false)
    const [value, setValue] = useState(title)

    const [ConfirmDialog, confirm] = useConfirm(
        'Delete this channel?',
        'You are about to delete this channel, this action is irreversable.',
    )

    const channelId = useChannelId()
    const workspaceId = useWorkspaceId()

    const { data: member } = useCurrentMember({ workspaceId })
    const { mutate: updateChannel, isPending: isUpdatingChannel } = useUpdateChannel()
    const { mutate: deleteChannel, isPending: isDeletingChannel } = useDeleteChannel()

    const handleEditOpen = (value: boolean) => {
        if (member?.role !== 'admin') return

        setEditOpen(value)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\s+/g, '-').toLowerCase()
        setValue(value)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        await updateChannel(
            { channelId, name: value },
            {
                onSuccess: () => {
                    toast.success('Channel updated successfully')
                    setEditOpen(false)
                },
                onError: () => {
                    toast.error('Failed to update channel')
                },
            },
        )
    }

    const handleDelete = async () => {
        const ok = await confirm()

        if (!ok) return

        await deleteChannel(
            { channelId },
            {
                onSuccess: () => {
                    toast.success('Channel deleted successfully')
                    router.replace(`/workspace/${workspaceId}`)
                },
                onError: () => {
                    toast.error('Failed to delete channel')
                },
            },
        )
    }

    return (
        <div className="bg-white border-b h-[49px] flex items-center px-4 overflow-hidden">
            <ConfirmDialog />
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="ghost" className="text-lg font-semibold px-2 overflow-hidden w-auto" size="sm">
                        <span className="trunacte"># {title}</span>
                        <FaChevronDown className="size-2.5 ml-2" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="p-0 bg-gray-50 overflow-hidden">
                    <DialogHeader className="p-4 border-b bg-white">
                        <DialogTitle># {title}</DialogTitle>
                    </DialogHeader>
                    <div className="px-4 pb-4 flex flex-col gap-y-2">
                        <Dialog open={editOpen} onOpenChange={handleEditOpen}>
                            <DialogTrigger asChild>
                                <div className="px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold">Channel name</p>
                                        <p className="text-sm text-[#126483] hover:underline font-semibold">edit</p>
                                    </div>
                                    <p className="text-sm"># {title}</p>
                                </div>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Edit channel name</DialogTitle>
                                </DialogHeader>
                                <form className="space-y-4" onSubmit={handleSubmit}>
                                    <Input
                                        value={value}
                                        onChange={handleChange}
                                        placeholder="Channel name"
                                        disabled={isUpdatingChannel}
                                        required
                                        autoFocus
                                        minLength={3}
                                        maxLength={80}
                                    />
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline" disabled={isUpdatingChannel}>
                                                Cancel
                                            </Button>
                                        </DialogClose>
                                        <Button disabled={isUpdatingChannel}>Save</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                        {member?.role === 'admin' && (
                            <button
                                onClick={handleDelete}
                                disabled={isDeletingChannel}
                                className="flex items-center gap-x-2 px-5 py-4 bg-white rounded-lg cursor-pointer border hover:bg-gray-50 text-rose-600"
                            >
                                <Trash className="size-4" />
                                <p className="text-sm font-semibold">Delete channel</p>
                            </button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
