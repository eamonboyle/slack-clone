'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useCreateWorkspaceModal } from '../store/use-create-workspace-modal'

export const CreateWorkSpaceModal = () => {
    const [open, setOpen] = useCreateWorkspaceModal()

    const handleClose = () => {
        setOpen(false)

        // todo clear form
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a new workspace</DialogTitle>
                    <DialogDescription>This is a description</DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}
