"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Target, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface Player {
    element: number
    name: string
    teamName: string
    form: string
    now_cost: number
    status: string
}

interface Recommendation {
    id: number
    name: string
    team: string
    position: string
    cost: number
    form: number
    recommendation: string
    fixturesDifficulty: number
    selectedBy: number
}

interface PositionBasedReplacementsProps {
    myTeamPicks: Player[]
    recommendations: Recommendation[]
    isLoading?: boolean
}

export function PositionBasedReplacements({ myTeamPicks, recommendations, isLoading }: PositionBasedReplacementsProps) {
    const [activePosition, setActivePosition] = useState<"GK" | "DEF" | "MID" | "FWD">("DEF")
    
    if (isLoading) return <div className="h-48 animate-pulse bg-muted/20 rounded-xl border border-dashed border-border" />

    // Filter out players already in user's squad
    const myPlayerIds = new Set(myTeamPicks.map(p => p.element))
    const availableRecommendations = recommendations.filter(r => !myPlayerIds.has(r.id))

    // Group by position
    const positionGroups = {
        GK: availableRecommendations.filter(r => r.position === "GK" && (r.recommendation === "Strong Buy" || r.recommendation === "Buy")).slice(0, 3),
        DEF: availableRecommendations.filter(r => r.position === "DEF" && (r.recommendation === "Strong Buy" || r.recommendation === "Buy")).slice(0, 3),
        MID: availableRecommendations.filter(r => r.position === "MID" && (r.recommendation === "Strong Buy" || r.recommendation === "Buy")).slice(0, 3),
        FWD: availableRecommendations.filter(r => r.position === "FWD" && (r.recommendation === "Strong Buy" || r.recommendation === "Buy")).slice(0, 3),
    }

    const getDifficultyColor = (difficulty: number) => {
        if (difficulty <= 2) return "text-green-500"
        if (difficulty <= 3) return "text-yellow-500"
        return "text-orange-500"
    }

    const renderPlayerCard = (player: Recommendation) => (
        <div key={player.id} className="p-4 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-all group">
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <p className="font-bold text-sm tracking-tight mb-1">{player.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">{player.team}</p>
                </div>
                <Badge variant="outline" className={cn(
                    "text-[9px] font-black uppercase tracking-widest",
                    player.recommendation === "Strong Buy" ? "border-green-500/50 text-green-500 bg-green-500/10" : "border-primary/50 text-primary bg-primary/10"
                )}>
                    {player.recommendation}
                </Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-muted/20 rounded-lg p-2">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">Form</p>
                    <p className="text-sm font-bold text-green-500">{player.form.toFixed(1)}</p>
                </div>
                <div className="bg-muted/20 rounded-lg p-2">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">Cost</p>
                    <p className="text-sm font-bold text-primary">£{player.cost.toFixed(1)}m</p>
                </div>
                <div className="bg-muted/20 rounded-lg p-2">
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">FDR</p>
                    <p className={cn("text-sm font-bold", getDifficultyColor(player.fixturesDifficulty))}>
                        {player.fixturesDifficulty.toFixed(1)}
                    </p>
                </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-border/20">
                <p className="text-[9px] text-muted-foreground">
                    Selected by <span className="font-bold text-foreground">{player.selectedBy.toFixed(1)}%</span> of managers
                </p>
            </div>
        </div>
    )

    return (
        <Card className="border-border/50 bg-card/40 backdrop-blur-md overflow-hidden">
            <CardHeader className="pb-3 px-6 pt-6 border-b border-border/50">
                <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    Recommended Replacements by Position
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <Tabs value={activePosition} onValueChange={(value) => setActivePosition(value as typeof activePosition)}>
                    <TabsList className="grid w-full grid-cols-4 bg-muted/10 p-1 rounded-xl border border-border/20 mb-4">
                        <TabsTrigger value="GK" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-bold uppercase tracking-wider text-[10px]">
                            GK
                        </TabsTrigger>
                        <TabsTrigger value="DEF" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-bold uppercase tracking-wider text-[10px]">
                            DEF
                        </TabsTrigger>
                        <TabsTrigger value="MID" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-bold uppercase tracking-wider text-[10px]">
                            MID
                        </TabsTrigger>
                        <TabsTrigger value="FWD" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-bold uppercase tracking-wider text-[10px]">
                            FWD
                        </TabsTrigger>
                    </TabsList>

                    {(["GK", "DEF", "MID", "FWD"] as const).map((position) => (
                        <TabsContent key={position} value={position} className="space-y-4">
                            {positionGroups[position].length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {positionGroups[position].map(renderPlayerCard)}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <TrendingUp className="h-12 w-12 text-muted-foreground/30 mb-3" />
                                    <p className="text-sm text-muted-foreground">No strong buy recommendations for {position} at the moment</p>
                                    <p className="text-xs text-muted-foreground/60 mt-1">Check back after the next gameweek</p>
                                </div>
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card>
    )
}

