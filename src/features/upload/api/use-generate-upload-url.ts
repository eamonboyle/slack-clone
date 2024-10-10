/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from 'convex/react'

import { api } from '../../../../convex/_generated/api'
import { useCallback, useMemo, useState } from 'react'

type ResponseType = string | null

type Options = {
    onSuccess?: (data: ResponseType) => void
    onError?: (error: Error) => void
    onSettled?: () => void
    throwError?: boolean
}

export const useGenerateUploadUrl = () => {
    const [data, setData] = useState<ResponseType>(null)
    const [error, setError] = useState<Error | null>(null)

    const [status, setStatus] = useState<
        'success' | 'error' | 'settled' | 'pending' | null
    >(null)

    const isPending = useMemo(() => status === 'pending', [status])
    const isSuccess = useMemo(() => status === 'success', [status])
    const isError = useMemo(() => status === 'error', [status])
    const isSettled = useMemo(() => status === 'settled', [status])

    const mutation = useMutation(api.upload.generateUploadUrl)

    const mutate = useCallback(
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        async (_values: {}, options?: Options) => {
            try {
                setData(null)
                setError(null)
                setStatus('pending')

                const response = await mutation()

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

    return {
        mutate,
        data,
        error,
        status,
        isPending,
        isSuccess,
        isError,
        isSettled,
    }
}
