import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { FaGithub } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import { SignInFlow } from '../types'
import { useState } from 'react'
import { useAuthActions } from '@convex-dev/auth/react'
import { TriangleAlert } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SignInCardProps {
    setState: (state: SignInFlow) => void
}

export const SignInCard = ({ setState }: SignInCardProps) => {
    const { signIn } = useAuthActions()
    const router = useRouter()

    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [password, setPassword] = useState('')

    const handlePasswordSign = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        signIn('password', { email, password, flow: 'signIn' })
            .catch((err) => {
                console.error(err)
                setError('Invalid email or password')
            })
            .finally(() => {
                setIsLoading(false)
                router.push('/')
            })
    }

    const handleProviderSignIn = (value: 'github' | 'google') => {
        setIsLoading(true)
        signIn(value).finally(() => {
            setIsLoading(false)
            router.push('/')
        })
    }

    return (
        <Card className="w-full h-full p-8">
            <CardHeader className="px-0 pt-0">
                <CardTitle>Log in to continue</CardTitle>
                <CardDescription>
                    Use your email or another service to continue
                </CardDescription>
            </CardHeader>
            {error && (
                <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive mb-6">
                    <TriangleAlert className="size-4" />
                    <p>{error}</p>
                </div>
            )}
            <CardContent className="space-y-5 px-0 pb-0">
                <form className="space-y-2.5" onSubmit={handlePasswordSign}>
                    <Input
                        disabled={false}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        type="email"
                        required
                    />
                    <Input
                        disabled={false}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        type="password"
                        required
                    />
                    <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        disabled={isLoading}
                    >
                        Continue
                    </Button>
                </form>
                <Separator />
                <div className="flex flex-col gap-y-2.5">
                    <Button
                        variant="outline"
                        onClick={() => {
                            handleProviderSignIn('google')
                        }}
                        className="w-full relative"
                        size="lg"
                        disabled={isLoading}
                    >
                        <FcGoogle className="size-5 absolute top-3 left-2.5" />
                        Continue with Google
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            handleProviderSignIn('github')
                        }}
                        className="w-full relative"
                        size="lg"
                        disabled={isLoading}
                    >
                        <FaGithub className="size-5 absolute top-3 left-2.5" />
                        Continue with GitHub
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                    Don&apos;t have an account?{' '}
                    <span
                        className="text-sky-700 hover:underline cursor-pointer"
                        onClick={() => setState('signUp')}
                    >
                        Sign up
                    </span>
                </p>
            </CardContent>
        </Card>
    )
}
