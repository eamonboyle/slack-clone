import { useResetWorkspaceJoinCode } from '@/features/workspaces/api/use-reset-workspace-join-code'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useConfirm } from '@/hooks/use-confirm'
import { useWorkspaceId } from '@/hooks/use-workspace-id'
import { Copy, RefreshCcw } from 'lucide-react'
import { toast } from 'sonner'

interface InviteModalProps {
    open: boolean
    setOpen: (open: boolean) => void
    name: string
    joinCode: string
}

export const InviteModal = ({
    open,
    setOpen,
    name,
    joinCode,
}: InviteModalProps) => {
    const workspaceId = useWorkspaceId()
    const [ConfirmDialog, confirm] = useConfirm(
        'Reset Join Code',
        'Are you sure you want to reset the join code?',
    )

    const { mutate: resetJoinCode, isPending: isResettingJoinCode } =
        useResetWorkspaceJoinCode()

    const handleCopyToClipboard = () => {
        navigator.clipboard
            .writeText(`${window.location.origin}/join/${workspaceId}`)
            .then(() => {
                toast.success('Copied invite link to clipboard')
            })
    }

    const handleResetJoinCode = async () => {
        const confirmed = await confirm()

        if (confirmed) {
            resetJoinCode(
                { workspaceId },
                {
                    onSuccess: () => {
                        toast.success('Join code reset')
                    },
                    onError: () => {
                        toast.error('Failed to reset join code')
                    },
                },
            )
        }
    }

    return (
        <>
            <ConfirmDialog />
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invite people to {name}</DialogTitle>
                        <DialogDescription>
                            Use the code below to invite people to your
                            workspace.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-y-4 items-center justify-center py-2">
                        <div className="flex items-center">
                            <Input
                                type="text"
                                value={joinCode.toUpperCase()}
                                readOnly
                                className="text-2xl font-bold focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:ring-transparent"
                                autoFocus
                            />
                            <Button
                                variant="outline"
                                onClick={handleCopyToClipboard}
                                className="ml-2"
                            >
                                Copy Link <Copy className="size-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                    <div className="flex items-center justify-between w-full">
                        <Button
                            variant="outline"
                            onClick={handleResetJoinCode}
                            disabled={isResettingJoinCode}
                        >
                            Reset Join Code{' '}
                            <RefreshCcw className="size-4 ml-1" />
                        </Button>
                        <DialogClose asChild>
                            <Button>Close</Button>
                        </DialogClose>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
