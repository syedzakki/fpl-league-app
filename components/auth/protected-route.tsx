"use client"

import { useTeam } from "@/components/providers/team-provider"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, ReactNode } from "react"
import { RefreshCw } from "lucide-react"

interface ProtectedRouteProps {
    children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { selectedTeamId, isLoading } = useTeam()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (!isLoading && !selectedTeamId && pathname !== "/") {
            router.push("/")
        }
    }, [selectedTeamId, isLoading, router, pathname])

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
                <RefreshCw className="animate-spin h-10 w-10 text-primary" />
                <p className="text-sm font-medium text-muted-foreground animate-pulse uppercase tracking-widest">
                    Verifying Session...
                </p>
            </div>
        )
    }

    if (!selectedTeamId && pathname !== "/") {
        return null
    }

    return <>{children}</>
}
