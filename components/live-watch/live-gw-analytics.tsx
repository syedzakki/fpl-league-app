"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, TrendingUp, Shield, TrendingDown, ArrowUpRight } from "lucide-react"
import { cn, formatOrdinal } from "@/lib/utils"
import { Manager } from "./types"
import { Progress } from "@/components/ui/progress"

interface LiveGWAnalyticsProps {
    managers: Manager[]
    myTeamId?: string | null
    gameweek: number
    myTeamName?: string | null
}

export function LiveGWAnalytics({ managers, myTeamId, gameweek, myTeamName }: LiveGWAnalyticsProps) {
    // Sort managers by live points
    const sortedManagers = [...managers].sort((a, b) => b.totalLivePoints - a.totalLivePoints)
    const myManager = sortedManagers.find(m => m.id === myTeamId)
    const myRank = sortedManagers.findIndex(m => m.id === myTeamId) + 1
    const myPoints = myManager?.totalLivePoints || 0

    // Calculate rank targets - show ranks better than mine
    const rankTargets = sortedManagers
        .slice(0, myRank - 1) // Get all managers ahead of me
        .map((manager, index) => ({
            rank: index + 1,
            managerName: manager.name,
            points: manager.totalLivePoints,
            gap: manager.totalLivePoints - myPoints
        }))

    // Calculate team dependency for this gameweek
    const calculateTeamDependency = () => {
        if (!myManager) return []

        // Mock data structure - in production, you'd analyze actual player data
        // This would require fetching each player's team from the FPL API
        const mockTeamData = [
            { team: "Arsenal", myPlayers: 2, myPoints: 15, avgPoints: 12 },
            { team: "Man City", myPlayers: 3, myPoints: 24, avgPoints: 28 },
            { team: "Liverpool", myPlayers: 2, myPoints: 14, avgPoints: 12 },
            { team: "Chelsea", myPlayers: 1, myPoints: 6, avgPoints: 8 },
            { team: "Spurs", myPlayers: 2, myPoints: 10, avgPoints: 9 },
        ]

        return mockTeamData.map(t => ({
            ...t,
            advantage: t.myPoints - t.avgPoints,
            dependencyPercent: (t.myPlayers / 15) * 100
        })).sort((a, b) => Math.abs(b.advantage) - Math.abs(a.advantage))
    }

    const teamDependency = calculateTeamDependency()
    const totalAdvantage = teamDependency.reduce((sum, t) => sum + t.advantage, 0)

    return (
        <div className="space-y-6">
            {/* Live Leaderboard */}
            <Card className="border-border/50 bg-card/40 backdrop-blur-md">
                <CardHeader className="pb-3 px-6 pt-6 border-b border-border/50">
                    <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-primary" />
                        Live Gameweek Leaderboard
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-border/20 max-h-[500px] overflow-y-auto scrollbar-thin">
                        {sortedManagers.map((manager, index) => {
                            const isMe = manager.id === myTeamId
                            return (
                                <div 
                                    key={manager.id} 
                                    className={cn(
                                        "flex items-center justify-between px-6 py-4 hover:bg-muted/20 transition-colors",
                                        isMe && "bg-primary/5 border-l-4 border-l-primary sticky top-0 z-10"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "flex items-center justify-center w-8 h-8 rounded-full font-sports font-black text-sm",
                                            index === 0 && "bg-yellow-500/20 text-yellow-500",
                                            index === 1 && "bg-gray-400/20 text-gray-400",
                                            index === 2 && "bg-orange-500/20 text-orange-500",
                                            index > 2 && "bg-muted/20 text-muted-foreground"
                                        )}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className={cn("font-bold text-sm", isMe && "text-primary")}>{manager.name}</p>
                                            <p className="text-[10px] text-muted-foreground">{manager.players.filter(p => p.minutes > 0).length} players active</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-mono font-black">{manager.totalLivePoints}</p>
                                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Points</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gameweek Rank Feed */}
            <Card className="h-full border-border/50 bg-card/40 backdrop-blur-md">
                <CardHeader className="pb-3 px-6 pt-6 border-b border-border/50">
                    <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-primary" />
                        GW{gameweek} Rank Feed
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-4 space-y-3">
                    {/* Current Position */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10">
                        <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-primary" />
                            <div>
                                <p className="font-bold text-sm tracking-tight text-primary">Your Position</p>
                                <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{myTeamName}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <Badge className="bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest">
                                {formatOrdinal(myRank)}
                            </Badge>
                            <p className="text-[9px] text-muted-foreground mt-0.5">{myPoints} pts</p>
                        </div>
                    </div>

                    {/* Rank Targets */}
                    {rankTargets.length > 0 ? (
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
                            {rankTargets.map((target) => {
                                const isTopThree = target.rank <= 3
                                return (
                                    <div 
                                        key={target.rank}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-xl border",
                                            isTopThree ? "border-yellow-500/30 bg-yellow-500/5" : "border-border/30 bg-muted/20"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                                                target.rank === 1 && "bg-yellow-500/20 text-yellow-500",
                                                target.rank === 2 && "bg-gray-400/20 text-gray-400",
                                                target.rank === 3 && "bg-orange-500/20 text-orange-500",
                                                target.rank > 3 && "bg-muted-foreground/20 text-muted-foreground"
                                            )}>
                                                {target.rank}
                                            </div>
                                            <div>
                                                <p className="font-bold text-xs tracking-tight">{target.managerName}</p>
                                                <p className="text-[9px] text-muted-foreground">{target.points} pts</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <ArrowUpRight className="w-3 h-3 text-orange-500" />
                                            <span className="text-xs font-mono font-black text-orange-500">
                                                +{target.gap}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Trophy className="w-10 h-10 mx-auto mb-2 text-yellow-500 fill-yellow-500/20" />
                            <p className="text-sm font-bold text-yellow-500">You're in 1st Place!</p>
                            <p className="text-[10px] text-muted-foreground mt-1">Keep up the great work</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Team Dependency This Gameweek */}
            <Card className="h-full border-border/50 bg-card/40 backdrop-blur-md">
                <CardHeader className="pb-3 px-6 pt-6 border-b border-border/50">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary" />
                            GW{gameweek} Team Dependency
                        </CardTitle>
                        <div className="text-right">
                            <p className="text-[8px] text-muted-foreground uppercase tracking-wider font-bold">Total Gain</p>
                            <p className={cn(
                                "text-lg font-mono font-black",
                                totalAdvantage > 0 ? "text-green-500" : "text-red-500"
                            )}>
                                {totalAdvantage > 0 ? "+" : ""}{totalAdvantage.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-4 space-y-4">
                    {teamDependency.map((team) => {
                        const isPositive = team.advantage > 0
                        
                        return (
                            <div key={team.team} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-muted/20 text-muted-foreground font-bold text-[10px]">
                                            {team.myPlayers}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{team.team}</p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {team.myPoints} pts • Avg: {team.avgPoints} pts
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isPositive ? (
                                            <TrendingUp className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <TrendingDown className="w-4 h-4 text-red-500" />
                                        )}
                                        <p className={cn(
                                            "text-base font-mono font-black",
                                            isPositive ? "text-green-500" : "text-red-500"
                                        )}>
                                            {isPositive ? "+" : ""}{team.advantage}
                                        </p>
                                    </div>
                                </div>
                                <Progress 
                                    value={team.dependencyPercent} 
                                    className="h-1.5" 
                                    indicatorColor={isPositive ? "bg-green-500" : "bg-red-500"}
                                />
                                <p className="text-[9px] text-muted-foreground text-right">
                                    {team.dependencyPercent.toFixed(1)}% of your squad
                                </p>
                            </div>
                        )
                    })}

                    {/* Summary */}
                    <div className="mt-4 pt-4 border-t border-border/50">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                GW Strategy
                            </span>
                            <Badge className={cn(
                                "text-xs font-black",
                                totalAdvantage > 0 ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                            )}>
                                {totalAdvantage > 0 ? "Outperforming" : "Underperforming"}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
            </div>
        </div>
    )
}
