"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Zap } from "lucide-react"

interface Rival {
    name: string
    teamName: string
    points: number
    rank: number
    captain: string
}

interface RivalWatchProps {
    rivals: Rival[]
}

export function RivalWatch({ rivals }: RivalWatchProps) {
    // Show only top 3 rivals
    const topRivals = rivals.slice(0, 3)

    const getInitials = (name: string) => {
        return name.slice(0, 2).toUpperCase()
    }

    return (
        <Card className="h-full border-border/50">
            <CardHeader className="flex flex-row items-center justify-between py-4 px-6 border-b border-border/50 bg-muted/5">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base font-bold uppercase italic tracking-tight">
                        Rival Watch
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                    {topRivals.map((rival, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
                            <Avatar className="h-8 w-8 border border-border/50">
                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                    {getInitials(rival.name)}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-sm truncate">{rival.name}</div>
                                <div className="text-[10px] text-muted-foreground">
                                    #{rival.rank} • <span className="text-yellow-600">C:</span> {rival.captain}
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="font-mono text-base font-bold">{rival.points}</div>
                            </div>
                        </div>
                    ))}
                    {topRivals.length === 0 && (
                        <div className="p-6 text-center text-xs text-muted-foreground">
                            No rivals to display
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
