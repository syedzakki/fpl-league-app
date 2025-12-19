"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Target, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface RankBracket {
    rank: number
    points: number
    pointsPostAutoSubs: number
    pointsAhead: number
}

interface RankFeedProps {
    myRank: number
    myPoints: number
    totalManagers: number
}

export function RankFeed({ myRank, myPoints, totalManagers }: RankFeedProps) {
    // Define rank brackets to show
    const brackets = [1, 100, 1000, 5000, 10000, 25000, 50000, 100000, 200000, 300000, 400000, 500000, 1000000, 2000000, 3000000, 4000000]
    
    // Calculate estimated points for each bracket (simplified calculation)
    // In production, you'd fetch this from FPL API or calculate based on historical data
    const calculateBracketPoints = (rank: number): RankBracket => {
        // Rough estimation: top rank ~1150 pts, decreasing logarithmically
        const basePoints = 1150
        const pointsDecay = Math.log(rank + 1) * 15
        const estimatedPoints = Math.max(basePoints - pointsDecay, 500)
        
        return {
            rank,
            points: Math.round(estimatedPoints),
            pointsPostAutoSubs: Math.round(estimatedPoints), // Simplified
            pointsAhead: Math.round(estimatedPoints - myPoints)
        }
    }

    // Filter brackets to show only those at or above user's rank
    const relevantBrackets = brackets
        .filter(rank => rank <= myRank)
        .map(calculateBracketPoints)
        .reverse() // Show from user's rank upwards

    // Add user's current rank if not in brackets
    if (!brackets.includes(myRank)) {
        relevantBrackets.unshift({
            rank: myRank,
            points: myPoints,
            pointsPostAutoSubs: myPoints,
            pointsAhead: 0
        })
    }

    return (
        <Card className="border-border/50 bg-card/40 backdrop-blur-md">
            <CardHeader className="border-b border-border/50 py-4">
                <CardTitle className="flex items-center gap-2 text-base uppercase tracking-wider font-bold">
                    <Target className="h-5 w-5 text-primary" />
                    Rank Targets
                </CardTitle>
                <CardDescription className="text-xs">
                    Points needed to reach key rank milestones
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-border/20">
                    {relevantBrackets.map((bracket, index) => {
                        const isMyRank = bracket.rank === myRank
                        const isTopRank = bracket.rank === 1
                        
                        return (
                            <div 
                                key={bracket.rank}
                                className={cn(
                                    "flex items-center justify-between px-6 py-4 hover:bg-muted/20 transition-colors",
                                    isMyRank && "bg-primary/5 border-l-4 border-l-primary"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    {isTopRank ? (
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-500/20">
                                            <Trophy className="w-5 h-5 text-yellow-500" />
                                        </div>
                                    ) : (
                                        <div className={cn(
                                            "flex items-center justify-center w-10 h-10 rounded-full font-sports font-black text-sm",
                                            isMyRank ? "bg-primary/20 text-primary" : "bg-muted/20 text-muted-foreground"
                                        )}>
                                            {bracket.rank >= 1000000 ? `${(bracket.rank / 1000000).toFixed(1)}M` :
                                             bracket.rank >= 1000 ? `${(bracket.rank / 1000).toFixed(0)}K` :
                                             bracket.rank}
                                        </div>
                                    )}
                                    <div>
                                        <p className={cn("font-bold text-sm", isMyRank && "text-primary")}>
                                            {isTopRank ? "Rank 1" : `Top ${bracket.rank.toLocaleString()}`}
                                        </p>
                                        {isMyRank && (
                                            <Badge className="mt-1 bg-primary/10 text-primary border-primary/20 text-[8px] px-1.5 py-0 h-4">
                                                Your Current Rank
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-[8px] text-muted-foreground uppercase tracking-wider font-bold mb-0.5">Points Needed</p>
                                        <p className="text-xl font-mono font-black">{bracket.points.toLocaleString()}</p>
                                    </div>
                                    {!isMyRank && bracket.pointsAhead > 0 && (
                                        <div className="text-right">
                                            <p className="text-[8px] text-muted-foreground uppercase tracking-wider font-bold mb-0.5">Gap</p>
                                            <div className="flex items-center gap-1">
                                                <TrendingUp className="w-3 h-3 text-orange-500" />
                                                <p className="text-lg font-mono font-black text-orange-500">
                                                    +{bracket.pointsAhead}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}

