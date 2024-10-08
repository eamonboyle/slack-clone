'use client'

import Sidebar from './sidebar'
import Toolbar from './workspace-toolbar'
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from '@/components/ui/resizable'
import { WorkspaceSidebar } from './workspace-sidebar'
import { usePanel } from '@/hooks/use-panel'
import { Loader } from 'lucide-react'
import { Id } from '../../../../convex/_generated/dataModel'
import { Thread } from '@/features/messages/components/thread'
import { Profile } from '@/features/members/components/profile'
import { useCurrentUser } from '@/features/auth/api/use-current-user'

interface WorkspaceIdLayoutProps {
    children: React.ReactNode
}

export default function WorkspaceIdLayout({
    children,
}: WorkspaceIdLayoutProps) {
    const { parentMessageId, profileMemberId, onClose } = usePanel()

    const showPanel = !!parentMessageId || !!profileMemberId

    const { data: user, isLoading: isUserLoading } = useCurrentUser()

    if (isUserLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader className="size-5 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-red-500">
                    You must be logged in to access this workspace.
                </p>
            </div>
        )
    }

    return (
        <div className="h-full">
            <Toolbar />
            <div className="flex h-[calc(100vh-40px)]">
                <Sidebar />
                <ResizablePanelGroup
                    direction="horizontal"
                    autoSaveId="sc-workspace-layout"
                >
                    <ResizablePanel
                        defaultSize={20}
                        minSize={11}
                        className="bg-[#5E2C5F]"
                    >
                        <WorkspaceSidebar />
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={80} minSize={20}>
                        {children}
                    </ResizablePanel>
                    {showPanel && (
                        <>
                            <ResizableHandle withHandle />
                            <ResizablePanel minSize={20} defaultSize={29}>
                                {parentMessageId ? (
                                    <Thread
                                        messageId={
                                            parentMessageId as Id<'messages'>
                                        }
                                        onClose={onClose}
                                    />
                                ) : profileMemberId ? (
                                    <Profile
                                        memberId={
                                            profileMemberId as Id<'members'>
                                        }
                                        onClose={onClose}
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <Loader className="size-5 animate-spin text-muted-foreground" />
                                    </div>
                                )}
                            </ResizablePanel>
                        </>
                    )}
                </ResizablePanelGroup>
            </div>
        </div>
    )
}
