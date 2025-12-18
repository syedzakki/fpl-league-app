"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Zap, TrendingUp, TrendingDown, Minus } from "lucide-react"

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

    const getRankBadgeColor = (rank: number) => {
        if (rank === 1) return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
        if (rank === 2) return "bg-slate-400/10 text-slate-400 border-slate-400/20"
        if (rank === 3) return "bg-orange-600/10 text-orange-600 border-orange-600/20"
        return "bg-muted text-muted-foreground border-border"
    }

    const getInitials = (name: string) => {
        return name.slice(0, 2).toUpperCase()
    }

    return (
        <Card className="h-full border-border/50">
            <CardHeader className="pb-3 border-b border-border/50">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        Rival Watch
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                        LIVE
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                    {topRivals.map((rival, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors">
                            <Avatar className="h-10 w-10 border-2 border-border/50">
                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                                    {getInitials(rival.name)}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className={`text-[10px] font-bold px-1.5 py-0 h-5 ${getRankBadgeColor(rival.rank)}`}>
                                        #{rival.rank}
                                    </Badge>
                                    <span className="font-bold text-sm truncate">{rival.name}</span>
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                    <span className="text-yellow-600 font-bold">C:</span> {rival.captain}
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="font-mono text-lg font-bold">{rival.points}</div>
                                <div className="text-[10px] text-muted-foreground">pts</div>
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
