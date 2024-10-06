import { usePaginatedQuery } from 'convex/react'

import { api } from '../../../../../convex/_generated/api'
import { Id } from '../../../../../convex/_generated/dataModel'

const BATCH_SIZE = 20

export type GetMessagesReturnTypes = (typeof api.messages.get._returnType)['page']

interface UseGetMessagesProps {
    channelId?: Id<'channels'>
    conversationId?: Id<'conversations'>
    parentMessageId?: Id<'messages'>
}

export const useGetMessages = ({ channelId, conversationId, parentMessageId }: UseGetMessagesProps) => {
    const { results, status, loadMore } = usePaginatedQuery(
        api.messages.get,
        {
            channelId,
            conversationId,
            parentMessageId,
        },
        {
            initialNumItems: BATCH_SIZE,
        },
    )

    return {
        results,
        status,
        loadMore: () => loadMore(BATCH_SIZE),
    }
}
