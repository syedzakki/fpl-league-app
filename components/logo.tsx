import { Trophy } from "lucide-react"
import Link from "next/link"

export function Logo({ className }: { className?: string }) {
    return (
        <Link href="/dashboard" className="flex items-center gap-2 group">
            <Trophy className="h-6 w-6 text-primary animate-pulse" />
            <span className="font-sports text-2xl font-bold tracking-wide italic uppercase text-sidebar-foreground">
                FPL <span className="text-primary">League</span>
            </span>
        </Link>
    )
}
