import { UserButton } from '@/features/auth/components/user-button'
import WorkspaceSwitcher from './workspace-switcher'
import { Bell, Home, MessageSquare, MoreHorizontal } from 'lucide-react'
import { SidebarButton } from './sidebar-button'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="w-[70px] h-full bg-[#481349] flex flex-col gap-y-4 items-center pt-[9px] pb-4">
            <WorkspaceSwitcher />
            <SidebarButton icon={Home} label="Home" isActive={pathname === '/workspace/home'} />
            <SidebarButton icon={MessageSquare} label="DMs" isActive={pathname === '/workspace/dms'} />
            <SidebarButton icon={Bell} label="Activity" isActive={pathname === '/workspace/activity'} />
            <SidebarButton icon={MoreHorizontal} label="More" isActive={pathname === '/workspace/more'} />
            <div className="flex flex-col items-center justify-center gap-y-1 mt-auto px-4">
                <UserButton />
            </div>
        </aside>
    )
}
