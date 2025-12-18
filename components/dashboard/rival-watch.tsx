"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
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
    return (
        <Card className="h-full">
            <CardHeader className="pb-2 border-b border-border/50">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        Rival Watch
                    </CardTitle>
                    <span className="text-[10px] font-mono text-muted-foreground bg-muted/30 px-2 py-0.5 rounded">
                        LIVE
                    </span>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                    {rivals.map((rival, i) => (
                        <div key={i} className="flex items-center justify-between p-3 hover:bg-muted/5 transition-colors">
                            <div className="flex flex-col">
                                <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded w-fit mb-1">
                                    {rival.rank}th
                                </span>
                                <span className="font-bold text-sm truncate max-w-[120px]">{rival.teamName}</span>
                                <span className="text-[10px] text-muted-foreground">{rival.name}</span>
                            </div>

                            <div className="flex flex-col items-end">
                                <div className="flex items-baseline gap-1">
                                    <span className="font-mono text-lg font-bold">{rival.points}</span>
                                    <span className="text-[10px] text-muted-foreground">pts</span>
                                </div>
                                <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <span className="text-yellow-600 font-bold">C:</span> {rival.captain}
                                </div>
                            </div>
                        </div>
                    ))}
                    {rivals.length === 0 && (
                        <div className="p-4 text-center text-xs text-muted-foreground">
                            No rivals selected. Pin managers to track them here.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
