'use client'

import { Button } from '@/components/ui/button'
import { useAuthActions } from '@convex-dev/auth/react'
import { useRouter } from 'next/navigation'

export default function Home() {
    const router = useRouter()
    const { signOut } = useAuthActions()

    const handleSignOut = async () => {
        await signOut().finally(() => {
            router.push('/')
        })
    }

    return (
        <div>
            Logged In
            <Button onClick={handleSignOut}>Sign Out</Button>
        </div>
    )
}
