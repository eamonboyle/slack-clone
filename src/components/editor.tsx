import { MutableRefObject, useEffect, useLayoutEffect, useRef, useState } from 'react'

import Quill, { QuillOptions } from 'quill'
import { Delta, Op } from 'quill/core'
import 'quill/dist/quill.snow.css'

import { PiTextAa } from 'react-icons/pi'
import { MdSend } from 'react-icons/md'
import { ImageIcon, Smile } from 'lucide-react'

import { Button } from './ui/button'
import { Hint } from './hint'
import { cn } from '@/lib/utils'

type EditorValue = {
    image: File | null
    body: string
}

interface EditorProps {
    variant?: 'create' | 'update'
    onSubmit: ({ image, body }: EditorValue) => void
    onCancel?: () => void
    placeholder?: string
    defaultValue?: Delta | Op[]
    disabled?: boolean
    innerRef?: MutableRefObject<Quill | null>
}

const Editor = ({
    variant = 'create',
    onSubmit,
    onCancel,
    placeholder = 'Write a message...',
    defaultValue = [],
    disabled = false,
    innerRef,
}: EditorProps) => {
    const [text, setText] = useState('')
    const [isToolbarVisible, setIsToolbarVisible] = useState(true)

    const submitRef = useRef(onSubmit)
    const placeholderRef = useRef(placeholder)
    const quillRef = useRef<Quill | null>(null)
    const defaultValueRef = useRef(defaultValue)
    const containerRef = useRef<HTMLDivElement>(null)
    const disabledRef = useRef(disabled)

    useLayoutEffect(() => {
        submitRef.current = onSubmit
        placeholderRef.current = placeholder
        defaultValueRef.current = defaultValue
        disabledRef.current = disabled
    })

    useEffect(() => {
        if (!containerRef.current) {
            return
        }

        const container = containerRef.current
        const editorContainer = container.appendChild(container.ownerDocument.createElement('div'))

        const options: QuillOptions = {
            theme: 'snow',
            placeholder: placeholderRef.current,
            readOnly: disabledRef.current,
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    ['link'],
                    [
                        {
                            list: 'ordered',
                        },
                        {
                            list: 'bullet',
                        },
                    ],
                ],
                keyboard: {
                    bindings: {
                        enter: {
                            key: 'Enter',
                            handler: () => {
                                if (variant === 'create') {
                                    submitRef.current({
                                        image: null,
                                        body: quillRef.current?.root.innerHTML || '',
                                    })
                                } else if (variant === 'update') {
                                    submitRef.current({
                                        image: null,
                                        body: quillRef.current?.root.innerHTML || '',
                                    })
                                }
                            },
                        },
                        shift_enter: {
                            key: 13,
                            shiftKey: true,
                            handler: () => {
                                quillRef.current?.insertText(quillRef.current.getLength(), '\n')
                            },
                        },
                    },
                },
            },
        }

        const quill = new Quill(editorContainer, options)
        quillRef.current = quill
        quillRef.current.focus()

        if (innerRef) {
            innerRef.current = quill
        }

        quill.setContents(defaultValueRef.current)
        setText(quill.getText())

        quill.on(Quill.events.TEXT_CHANGE, () => {
            setText(quill.getText())
        })

        return () => {
            quill.off(Quill.events.TEXT_CHANGE)

            if (container) {
                container.innerHTML = ''
            }

            if (quillRef.current) {
                quillRef.current = null
            }

            if (innerRef) {
                innerRef.current = null
            }
        }
    }, [innerRef])

    const toggleToolbar = () => {
        setIsToolbarVisible((prev) => !prev)
        const toolbarElement = containerRef.current?.querySelector('.ql-toolbar')

        if (toolbarElement) {
            toolbarElement?.classList.toggle('hidden')
        }
    }

    const isEmpty = text.replace(/<(.|\n)*?>/g, '').trim().length === 0

    return (
        <div className="flex flex-col pb-2">
            <div className="flex flex-col border border-slate-200 rounded-md overflow-hidden focus-within:border-slate-300 focus-within:shadow-sm transition bg-white">
                <div ref={containerRef} className="h-full ql-custom" />
                <div className="flex px-2 pb-2 z-[5]">
                    <Hint label={isToolbarVisible ? 'Hide formatting' : 'Show formatting'}>
                        <Button disabled={disabled} variant="ghost" size="iconSm" onClick={toggleToolbar}>
                            <PiTextAa className="size-4" />
                        </Button>
                    </Hint>
                    <Hint label="Add emoji">
                        <Button disabled={disabled} variant="ghost" size="iconSm" onClick={() => {}}>
                            <Smile className="size-4" />
                        </Button>
                    </Hint>
                    {variant === 'create' && (
                        <Hint label="Add image">
                            <Button disabled={disabled} variant="ghost" size="iconSm" onClick={() => {}}>
                                <ImageIcon className="size-4" />
                            </Button>
                        </Hint>
                    )}

                    {variant === 'create' && (
                        <Hint label="Send message">
                            <Button
                                disabled={disabled || isEmpty}
                                onClick={() => {}}
                                className={cn(
                                    'ml-auto',
                                    isEmpty
                                        ? 'bg-white hover:bg-white/80 text-muted-foreground'
                                        : 'bg-[#007A5A] hover:bg-[#007A5A]/80 text-white',
                                )}
                                size="iconSm"
                            >
                                <MdSend className="size-4" />
                            </Button>
                        </Hint>
                    )}

                    {variant === 'update' && (
                        <div className="ml-auto flex items-center gap-x-2">
                            <Button variant="outline" size="sm" onClick={() => {}} disabled={false}>
                                Cancel
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {}}
                                disabled={disabled || isEmpty}
                                className="bg-[#007A5A] hover:bg-[#007A5A]/80 text-white"
                            >
                                Save
                            </Button>
                        </div>
                    )}
                </div>
            </div>
            <div className="p-2 text-[10px] text-muted-foreground flex justify-end">
                <p>
                    <strong>Shift + Return</strong> to add a new line
                </p>
            </div>
        </div>
    )
}

export default Editor
