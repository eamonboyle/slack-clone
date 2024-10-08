'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import Link from 'next/link'
import VerificationInput from 'react-verification-input'

import { useWorkspaceId } from '@/hooks/use-workspace-id'

import { useGetWorkspaceInfo } from '@/features/workspaces/api/use-get-workspace-info'
import { useJoinWorkspace } from '@/features/workspaces/api/use-join-workspace'

import { cn } from '@/lib/utils'

export default function JoinPage() {
    const workspaceId = useWorkspaceId()
    const router = useRouter()

    const { data: workspaceInfo, isLoading } = useGetWorkspaceInfo({ workspaceId })
    const { mutate: joinWorkspace, isPending: isJoiningWorkspace } = useJoinWorkspace()

    const isMember = useMemo(() => workspaceInfo?.isMember, [workspaceInfo])

    const [checkingIfMember, setCheckingIfMember] = useState(true)

    useEffect(() => {
        setCheckingIfMember(true)
        if (isMember) {
            router.replace(`/workspace/${workspaceId}`)
        } else {
            setCheckingIfMember(false)
        }
    }, [isMember, router, workspaceId])

    const handleJoinWorkspace = async (code: string) => {
        joinWorkspace(
            { workspaceId, joinCode: code },
            {
                onSuccess: (data) => {
                    router.replace(`/workspace/${workspaceId}`)
                    console.log(data)
                },
                onError: () => {
                    toast.error('Failed to join workspace')
                },
            },
        )
    }

    if (isLoading || checkingIfMember)
        return (
            <div className="h-full flex items-center justify-center">
                <Loader className="size-6 animate-spin text-muted-foreground" />
            </div>
        )

    return (
        <div className="h-full flex flex-col gap-y-8 items-center justify-center bg-white p-8">
            <Image src="/logo.svg" alt="Logo" width={60} height={60} className="w-auto h-auto" />
            <div className="flex flex-col gap-y-4 items-center justify-center max-w-md">
                <div className="flex flex-col gap-y-2 items-center justify-center">
                    <h1 className="text-2xl font-bold">Join {workspaceInfo?.name}</h1>
                    <p className="text-sm text-muted-foreground">Enter the join code to join the workspace</p>
                    <div className="my-2">
                        <VerificationInput
                            onComplete={handleJoinWorkspace}
                            length={6}
                            classNames={{
                                container: cn(
                                    'flex gap-x-2',
                                    isJoiningWorkspace && 'opacity-50 pointer-events-none cursor-not-allowed',
                                ),
                                character:
                                    'uppercase h-auto rounded-md border border-gray-300 flex items-center justify-center text-lg font-medium text-gray-500',
                                characterInactive: 'bg-muted',
                                characterSelected: 'bg-white text-black',
                                characterFilled: 'bg-white text-black',
                            }}
                            autoFocus
                        />
                    </div>
                    <div className="flex gap-x-4">
                        <Button variant="outline" asChild>
                            <Link href="/">Back to Home</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
