/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useMemo, useState } from 'react'

import { useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { Id } from '../../../../convex/_generated/dataModel'

type RequestType = {
    workspaceId: Id<'workspaces'>
    name: string
}
type ResponseType = Id<'workspaces'> | null

type Options = {
    onSuccess?: (data: ResponseType) => void
    onError?: (error: Error) => void
    onSettled?: () => void
    throwError?: boolean
}

export const useUpdateWorkspace = () => {
    const [data, setData] = useState<ResponseType>(null)
    const [error, setError] = useState<Error | null>(null)

    const [status, setStatus] = useState<'success' | 'error' | 'settled' | 'pending' | null>(null)

    const isPending = useMemo(() => status === 'pending', [status])
    const isSuccess = useMemo(() => status === 'success', [status])
    const isError = useMemo(() => status === 'error', [status])
    const isSettled = useMemo(() => status === 'settled', [status])

    const mutation = useMutation(api.workspaces.update)

    const mutate = useCallback(
        async (values: RequestType, options?: Options) => {
            try {
                setData(null)
                setError(null)
                setStatus('pending')

                const response = await mutation(values)

                setData(response)
                setStatus('success')
                options?.onSuccess?.(response)
                return response
            } catch (error) {
                options?.onError?.(error as Error)
                setError(error as Error)
                setStatus('error')

                if (options?.throwError) {
                    throw error
                }
            } finally {
                setStatus('settled')
                options?.onSettled?.()
            }
        },
        [mutation],
    )

    return { mutate, data, error, status, isPending, isSuccess, isError, isSettled }
}
