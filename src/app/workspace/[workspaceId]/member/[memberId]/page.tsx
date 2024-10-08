'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Loader } from 'lucide-react'
import { toast } from 'sonner'

import { Id } from '../../../../../../convex/_generated/dataModel'

import { useCreateOrGetConversation } from '@/features/conversations/api/use-create-or-get-conversation'
import { useMemberId } from '@/hooks/use-member-id'
import { useWorkspaceId } from '@/hooks/use-workspace-id'
import { Conversation } from './conversation'

export default function MemberIdPage() {
    const workspaceId = useWorkspaceId()
    const memberId = useMemberId()

    const [conversationId, setConversationId] = useState<Id<'conversations'> | null>(null)

    const { mutate, isPending } = useCreateOrGetConversation()

    useEffect(() => {
        if (workspaceId && memberId) {
            mutate(
                {
                    workspaceId,
                    memberId,
                },
                {
                    onSuccess: (data) => {
                        setConversationId(data)
                    },
                    onError: (error) => {
                        console.error(error)
                        toast.error('Failed to create or get conversation')
                    },
                },
            )
        }
    }, [workspaceId, memberId, mutate])

    if (isPending) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader className="size-5 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!conversationId) {
        return (
            <div className="flex flex-col gap-2 h-full items-center justify-center">
                <AlertTriangle className="size-5 text-muted-foreground" />
                <p className="text-muted-foreground">Failed to create or get conversation</p>
            </div>
        )
    }

    return <Conversation id={conversationId} />
}
