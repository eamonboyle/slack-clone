'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { useCreateWorkspaceModal } from '../store/use-create-workspace-modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCreateWorkspace } from '../api/use-create-workspace'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export const CreateWorkSpaceModal = () => {
    const [name, setName] = useState('')
    const router = useRouter()

    const [open, setOpen] = useCreateWorkspaceModal()
    const { mutate, isPending } = useCreateWorkspace()

    const handleClose = () => {
        setOpen(false)
        setName('')
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        await mutate(
            { name },
            {
                onSuccess: (workspaceId) => {
                    handleClose()
                    toast.success('Workspace created successfully')
                    router.replace(`/workspace/${workspaceId}`)
                },
                onError: () => {
                    toast.error('Failed to create a workspace')
                },
            },
        )
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a new workspace</DialogTitle>
                    <DialogDescription>
                        A workspace is a collection of conversations and
                        documents.
                    </DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <Input
                        value={name}
                        disabled={isPending}
                        required
                        autoFocus
                        minLength={3}
                        placeholder="Workspace Name e.g. 'Work', 'Personal', 'School'"
                        onChange={(e) => setName(e.target.value)}
                    />
                    <div className="flex justify-end">
                        <Button disabled={isPending} type="submit">
                            Create Workspace
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
