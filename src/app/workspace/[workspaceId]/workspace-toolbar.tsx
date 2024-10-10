import { Info, SearchIcon } from 'lucide-react'

import { useGetWorkspace } from '@/features/workspaces/api/use-get-workspace'
import { useWorkspaceId } from '@/hooks/use-workspace-id'
import { Button } from '@/components/ui/button'

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command'
import { useState } from 'react'
import { useGetMembers } from '@/features/members/api/use-get-members'
import { useGetChannels } from '@/features/channels/api/use-get-channels'
import { useRouter } from 'next/navigation'

export default function WorkspaceIdToolbar() {
    const router = useRouter()
    const [open, setOpen] = useState(false)

    const workspaceId = useWorkspaceId()
    const { data } = useGetWorkspace({ workspaceId })

    const { data: channels } = useGetChannels({ workspaceId })
    const { data: members } = useGetMembers({ workspaceId })

    const onChannelClick = (channelId: string) => {
        setOpen(false)
        router.push(`/workspace/${workspaceId}/channel/${channelId}`)
    }

    const onMemberClick = (memberId: string) => {
        setOpen(false)
        router.push(`/workspace/${workspaceId}/member/${memberId}`)
    }

    return (
        <div className="bg-[#481349] flex items-center justify-between h-10 p-1.5">
            <div className="flex-1" />
            <div className="min-w-[280px] max-[642px] grow-[2] shrink">
                <Button
                    size="sm"
                    className="bg-accent/25 hover:bg-accent-25 w-full justify-start h-7 px-2"
                    onClick={() => setOpen(true)}
                >
                    <SearchIcon className="size-4 text-white mr-2" />
                    <span className="text-white text-xs">
                        Search &quot;{data?.name}&quot;
                    </span>
                </Button>

                <CommandDialog open={open} onOpenChange={setOpen}>
                    <CommandInput placeholder="Search" />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup heading="Channels">
                            {channels?.map((channel) => (
                                <CommandItem
                                    key={channel._id}
                                    onSelect={() => onChannelClick(channel._id)}
                                    className="cursor-pointer"
                                >
                                    {channel.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup heading="Members">
                            {members?.map((member) => (
                                <CommandItem
                                    key={member._id}
                                    onSelect={() => onMemberClick(member._id)}
                                    className="cursor-pointer"
                                >
                                    {member.user.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </CommandDialog>
            </div>

            <div className="ml-auto flex-1 flex items-center justify-end">
                <Button variant="transparent" size="iconSm">
                    <Info className="size-5 text-white" />
                </Button>
            </div>
        </div>
    )
}
