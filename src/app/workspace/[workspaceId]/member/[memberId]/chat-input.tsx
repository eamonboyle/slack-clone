import { useRef, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Quill from 'quill'
import { toast } from 'sonner'

import { Id } from '../../../../../../convex/_generated/dataModel'

import { useCreateMessage } from '@/features/messages/api/use-create-message'
import { useWorkspaceId } from '@/hooks/use-workspace-id'
import { useGenerateUploadUrl } from '@/features/upload/api/use-generate-upload-url'

const Editor = dynamic(() => import('@/components/editor'), {
    ssr: false,
    loading: () => <p className="pb-6 text-center">Loading editor...</p>,
})

interface ChatInputProps {
    placeholder: string
    conversationId: Id<'conversations'>
}

interface CreateMessageValues {
    workspaceId: Id<'workspaces'>
    conversationId: Id<'conversations'>
    body: string
    image: Id<'_storage'> | undefined
}

export const ChatInput = ({ placeholder, conversationId }: ChatInputProps) => {
    const [editorKey, setEditorKey] = useState(0)
    const [isPending, setIsPending] = useState(false)

    const editorRef = useRef<Quill | null>(null)

    const workspaceId = useWorkspaceId()

    const { mutate: createMessage } = useCreateMessage()
    const { mutate: generateUploadUrl } = useGenerateUploadUrl()

    const uploadImage = useCallback(
        async (image: File): Promise<Id<'_storage'> | undefined> => {
            const maxRetries = 3
            let attempt = 0
            while (attempt < maxRetries) {
                try {
                    const url = await generateUploadUrl(
                        {},
                        { throwError: true },
                    )
                    if (!url) throw new Error('Failed to generate upload url')

                    const result = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': image.type },
                        body: image,
                    })

                    if (!result.ok) throw new Error('Failed to upload image')

                    const { storageId } = await result.json()
                    return storageId
                } catch (error) {
                    attempt++
                    if (attempt >= maxRetries) {
                        console.error(
                            'Image upload failed after multiple attempts:',
                            error,
                        )
                        toast.error('Failed to upload image')
                        return undefined
                    }
                }
            }
        },
        [generateUploadUrl],
    )

    const handleSubmit = useCallback(
        async ({ body, image }: { body: string; image: File | null }) => {
            try {
                setIsPending(true)
                if (editorRef.current) {
                    editorRef.current.enable(false)
                }

                const values: CreateMessageValues = {
                    workspaceId,
                    conversationId,
                    body,
                    image: undefined,
                }

                if (image) {
                    const storageId = await uploadImage(image)
                    if (storageId) values.image = storageId
                }

                await createMessage(values, { throwError: true })
                setEditorKey((prevKey) => prevKey + 1)
            } catch (error) {
                console.error('Failed to create message:', error)
                toast.error('Failed to send message')
            } finally {
                setIsPending(false)
                if (editorRef.current) {
                    editorRef.current.enable(true)
                }
            }
        },
        [workspaceId, conversationId, createMessage, uploadImage],
    )

    return (
        <div className="px-5 w-full">
            <Editor
                key={editorKey}
                placeholder={placeholder}
                onSubmit={handleSubmit}
                disabled={isPending}
                innerRef={editorRef}
            />
        </div>
    )
}
