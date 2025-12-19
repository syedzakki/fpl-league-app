"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Zap, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface Rival {
    name: string
    teamName: string
    points: number
    rank: number
    captain: string
    isUp?: boolean
    isDown?: boolean
    gap?: number
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
        <Card className="h-full border-border/50 bg-card/50 backdrop-blur-md overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between py-5 px-6 border-b border-border/20 bg-muted/10">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                        <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base font-black uppercase italic tracking-tight">
                        Rival Watch
                    </CardTitle>
                </div>
                <Badge variant="outline" className="text-[10px] font-bold border-primary/20 text-primary">LIVE</Badge>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-border/10">
                    {topRivals.map((rival, i) => (
                        <div
                            key={i}
                            className={cn(
                                "relative flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-all duration-300 group",
                                i === 0 && "bg-primary/[0.02]"
                            )}
                        >
                            {i === 0 && (
                                <div className="absolute left-0 top-0 w-1 h-full bg-primary" />
                            )}

                            <Avatar className="h-10 w-10 border-2 border-border/50 ring-2 ring-background ring-offset-1 ring-offset-border/20 group-hover:scale-105 transition-transform">
                                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-black text-sm">
                                    {getInitials(rival.name)}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm tracking-tight text-foreground truncate">{rival.name}</span>
                                    {rival.isUp ? (
                                        <TrendingUp className="h-3 w-3 text-green-500" />
                                    ) : rival.isDown ? (
                                        <TrendingDown className="h-3 w-3 text-red-500" />
                                    ) : (
                                        <Minus className="h-3 w-3 text-muted-foreground/50" />
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest mt-0.5">
                                    <span className="text-foreground/80">RANK #{rival.rank}</span>
                                    <span className="text-primary/50 text-xs">•</span>
                                    <span className="flex items-center gap-1">
                                        <span className="text-yellow-600/80">©</span> {rival.captain}
                                    </span>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="font-mono text-lg font-black text-foreground">{rival.points}</div>
                                {rival.gap !== undefined && (
                                    <div className={cn(
                                        "text-[10px] font-black italic",
                                        rival.gap < 0 ? "text-green-500" : "text-red-400"
                                    )}>
                                        {rival.gap > 0 ? `+${rival.gap}` : rival.gap} PTS
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {topRivals.length === 0 && (
                        <div className="p-10 text-center">
                            <Zap className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No rivals detected</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
