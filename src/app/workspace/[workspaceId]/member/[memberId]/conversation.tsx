import { useGetMember } from '@/features/members/api/use-get-member'
import { Id } from '../../../../../../convex/_generated/dataModel'
import { useMemberId } from '@/hooks/use-member-id'
import { Loader } from 'lucide-react'
import { useGetMessages } from '@/features/messages/api/use-get-messages'
import { Header } from './header'
import { ChatInput } from './chat-input'
import { MessageList } from '@/components/message-list'

interface ConversationProps {
    id: Id<'conversations'>
}

export const Conversation = ({ id }: ConversationProps) => {
    const memberId = useMemberId()

    const { data: member, isLoading: isMemberLoading } = useGetMember({ memberId })
    const { results, status, loadMore } = useGetMessages({ conversationId: id })

    if (isMemberLoading || status === 'LoadingFirstPage') {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader className="size-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <Header memberName={member?.user.name} memberImage={member?.user.image} onClick={() => {}} />
            <MessageList
                variant="conversation"
                data={results}
                memberName={member?.user.name}
                memberImage={member?.user.image}
                loadMore={loadMore}
                isLoadingMore={status === 'LoadingMore'}
                canLoadMore={status === 'CanLoadMore'}
            />
            <ChatInput placeholder={`Message ${member?.user.name}`} conversationId={id} />
        </div>
    )
}
