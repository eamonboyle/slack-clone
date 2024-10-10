import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Id } from '../../../../convex/_generated/dataModel'
import { useConfirm } from '@/hooks/use-confirm'
import { useWorkspaceId } from '@/hooks/use-workspace-id'
import { useCurrentMember } from '../api/use-current-member'
import { useGetMember } from '../api/use-get-member'
import { useUpdateMember } from '../api/use-update-member'
import { useRemoveMember } from '../api/use-remove-member'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
    AlertTriangle,
    ChevronDownIcon,
    Loader,
    MailIcon,
    XIcon,
} from 'lucide-react'

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'

interface ProfileProps {
    memberId: Id<'members'>
    onClose: () => void
}

export const Profile = ({ memberId, onClose }: ProfileProps) => {
    const router = useRouter()
    const workspaceId = useWorkspaceId()

    const [RemoveDialog, confirmRemove] = useConfirm(
        'Remove member?',
        'Are you sure you want to remove this member?',
    )
    const [LeaveDialog, confirmLeave] = useConfirm(
        'Leave workspace?',
        'Are you sure you want to leave this workspace?',
    )
    const [UpdateDialog, confirmUpdate] = useConfirm(
        'Update member role?',
        'Are you sure you want to update this member role?',
    )

    const { data: currentMember, isLoading: isLoadingCurrentMember } =
        useCurrentMember({ workspaceId })
    const { data: member, isLoading: isLoadingMember } = useGetMember({
        memberId,
    })
    const { mutate: updateMember } = useUpdateMember()
    const { mutate: removeMember, isPending: isRemovingMember } =
        useRemoveMember()

    const handleRemoveMember = async () => {
        const ok = await confirmRemove()
        if (!ok) return

        removeMember(
            { memberId },
            {
                onSuccess: () => {
                    toast.success('Member removed from workspace')
                    onClose()
                },
                onError: () => {
                    toast.error('Failed to remove member')
                },
            },
        )
    }

    const handleLeaveWorkspace = async () => {
        const ok = await confirmLeave()
        if (!ok) return

        removeMember(
            { memberId },
            {
                onSuccess: () => {
                    router.push(`/`)
                    toast.success('You left the workspace')
                    onClose()
                },
                onError: (error) => {
                    console.log('error', error)
                    toast.error('Failed to leave workspace')
                },
            },
        )
    }

    const handleUpdateMember = async (role: 'admin' | 'member') => {
        const ok = await confirmUpdate()
        if (!ok) return

        updateMember(
            { memberId, role },
            {
                onSuccess: () => {
                    toast.success('Member role updated')
                },
                onError: () => {
                    toast.error('Failed to update member role')
                },
            },
        )
    }

    if (isLoadingMember || isLoadingCurrentMember) {
        return (
            <div className="h-full flex flex-col">
                <div className="flex justify-between items-center px-4 h-[49px] border-b">
                    <p className="text-lg font-bold">Profile</p>
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

    if (!member) {
        return (
            <div className="h-full flex flex-col">
                <div className="flex justify-between items-center px-4 h-[49px] border-b">
                    <p className="text-lg font-bold">Profile</p>
                    <Button onClick={onClose} size="iconSm" variant="ghost">
                        <XIcon className="size-5 stroke-1.5" />
                    </Button>
                </div>
                <div className="flex flex-col gap-y-2 h-full items-center justify-center">
                    <AlertTriangle className="size-5 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                        Profile not found
                    </p>
                </div>
            </div>
        )
    }

    return (
        <>
            <RemoveDialog />
            <LeaveDialog />
            <UpdateDialog />
            <div className="h-full flex flex-col">
                <div className="h-[49px] flex justify-between items-center px-4 border-b">
                    <p className="text-lg font-bold">Profile</p>
                    <Button onClick={onClose} size="iconSm" variant="ghost">
                        <XIcon className="size-5 stroke-1.5" />
                    </Button>
                </div>
                <div className="flex flex-col items-center justify-center p-4">
                    <Avatar className="max-w-[256px] max-h-[256px] size-full">
                        <AvatarImage src={member.user.image} />
                        <AvatarFallback className="text-4xl lg:text-6xl">
                            {member.user.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </div>
                <div className="flex flex-col p-4">
                    <p className="text-xl font-bold">{member.user.name}</p>
                    {currentMember && (
                        <div className="flex items-center gap-2 mt-4">
                            {currentMember.role === 'admin' &&
                                currentMember._id !== memberId && (
                                    <>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full capitalize"
                                                >
                                                    {member.role}{' '}
                                                    <ChevronDownIcon className="size-4 ml-2" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-full">
                                                <DropdownMenuRadioGroup
                                                    value={member.role}
                                                    onValueChange={(role) =>
                                                        handleUpdateMember(
                                                            role as
                                                                | 'admin'
                                                                | 'member',
                                                        )
                                                    }
                                                >
                                                    <DropdownMenuRadioItem
                                                        value="admin"
                                                        className="cursor-pointer"
                                                    >
                                                        Admin
                                                    </DropdownMenuRadioItem>
                                                    <DropdownMenuRadioItem
                                                        value="member"
                                                        className="cursor-pointer"
                                                    >
                                                        Member
                                                    </DropdownMenuRadioItem>
                                                </DropdownMenuRadioGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <Button
                                            variant="destructive"
                                            className="w-full"
                                            disabled={isRemovingMember}
                                            onClick={handleRemoveMember}
                                        >
                                            Remove
                                        </Button>
                                    </>
                                )}
                            {currentMember._id === memberId &&
                                currentMember.role !== 'admin' && (
                                    <Button
                                        variant="destructive"
                                        className="w-full"
                                        onClick={handleLeaveWorkspace}
                                        disabled={isRemovingMember}
                                    >
                                        Leave Workspace
                                    </Button>
                                )}
                        </div>
                    )}
                </div>
                <Separator />
                <div className="flex flex-col p-4">
                    <p className="text-sm font-bold mb-4">
                        Contact Information
                    </p>
                    <div className="flex items-center gap-2">
                        <div className="size-9 rounded-md bg-muted flex items-center justify-center">
                            <MailIcon className="size-4" />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-[13px] font-semibold text-muted-foreground">
                                Email Address
                            </p>
                            <Link
                                href={`mailto:${member.user.email}`}
                                className="text-sm hover:underline text-[#126483]"
                            >
                                {member.user.email}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
