import { useDeleteWorkspace } from '@/app/features/workspaces/api/use-delete-workspace'
import { useUpdateWorkspace } from '@/app/features/workspaces/api/use-update-workspace'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useConfirm } from '@/hooks/use-confirm'
import { useWorkspaceId } from '@/hooks/use-workspace-id'
import { TrashIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface PreferencesModalProps {
    open: boolean
    setOpen: (open: boolean) => void
    initialValue: string
}

export const PreferencesModal = ({ open, setOpen, initialValue }: PreferencesModalProps) => {
    const router = useRouter()
    const workspaceId = useWorkspaceId()
    const [ConfirmDialog, confirm] = useConfirm('Delete Workspace', 'Are you sure you want to delete this workspace?')

    const [value, setValue] = useState(initialValue)
    const [isEditing, setIsEditing] = useState(false)

    const { mutate: updateWorkspace, isPending: isUpdatingWorkspace } = useUpdateWorkspace()
    const { mutate: deleteWorkspace, isPending: isDeletingWorkspace } = useDeleteWorkspace()

    const handleUpdateWorkspace = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        updateWorkspace(
            { workspaceId, name: value },
            {
                onSuccess: () => {
                    setIsEditing(false)
                    toast.success('Workspace updated successfully')
                },
                onError: () => {
                    toast.error('Failed to update workspace')
                },
            },
        )
    }

    const handleDeleteWorkspace = async () => {
        const confirmed = await confirm()
        if (confirmed) {
            deleteWorkspace(
                { workspaceId },
                {
                    onSuccess: () => {
                        toast.success('Workspace deleted successfully')
                        router.replace('/')
                    },
                    onError: () => {
                        toast.error('Failed to delete workspace')
                    },
                },
            )
        }
    }

    return (
        <>
            <ConfirmDialog />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="p-0 bg-gray-50 overflow-hidden">
                    <DialogHeader className="p-4 border-b bg-white">
                        <DialogTitle>Preferences</DialogTitle>
                    </DialogHeader>
                    <div className="px-4 pb-4 flex flex-col gap-y-2">
                        <Dialog open={isEditing} onOpenChange={setIsEditing}>
                            <DialogTrigger asChild>
                                <div className="px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold">Workspace Name</p>
                                        <p className="text-sm text-[#1264A3] hover:underline font-semibold">Edit</p>
                                    </div>
                                    <p className="text-sm">{value}</p>
                                </div>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Edit Workspace Name</DialogTitle>
                                </DialogHeader>
                                <form className="space-y-4" onSubmit={handleUpdateWorkspace}>
                                    <Input
                                        value={value}
                                        disabled={isUpdatingWorkspace}
                                        onChange={(e) => setValue(e.target.value)}
                                        placeholder="Workspace Name e.g. 'Work', 'Personal', 'School'"
                                        required
                                        autoFocus
                                        minLength={3}
                                        maxLength={80}
                                    />
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline" disabled={isUpdatingWorkspace}>
                                                Cancel
                                            </Button>
                                        </DialogClose>
                                        <Button type="submit" disabled={isUpdatingWorkspace}>
                                            Save
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                        <button
                            disabled={isDeletingWorkspace}
                            onClick={handleDeleteWorkspace}
                            className="flex items-center gap-x-2 px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50 text-rose-600"
                        >
                            <TrashIcon className="size-4" />
                            <p className="text-sm font-semibold">Delete Workspace</p>
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
