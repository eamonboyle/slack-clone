import type { Metadata } from 'next'
import './globals.css'
import { ConvexClientProvider } from '@/components/CovexClientProvider'
import { ConvexAuthNextjsServerProvider } from '@convex-dev/auth/nextjs/server'

export const metadata: Metadata = {
    title: 'Slack Clone - NextJS',
    description: 'Slack Clone built with NextJS',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <ConvexAuthNextjsServerProvider>
            <html lang="en">
                <body className={`antialiased`}>
                    <ConvexClientProvider>{children}</ConvexClientProvider>
                </body>
            </html>
        </ConvexAuthNextjsServerProvider>
    )
}
