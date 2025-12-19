"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

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
}

interface ManagerActionsProps {
    myTeamPicks: Player[]
    recommendations: Recommendation[]
    isLoading?: boolean
}

export function ManagerActions({ myTeamPicks, recommendations, isLoading }: ManagerActionsProps) {
    if (isLoading) return <div className="h-48 animate-pulse bg-muted/20 rounded-xl border border-dashed border-border" />

    // Logic to generate Actions
    // 1. Identify "Sell" candidates in my team (low form, injured)
    const sellCandidates = myTeamPicks
        .filter(p => parseFloat(p.form) < 2 || p.status !== "a")
        .sort((a, b) => parseFloat(a.form) - parseFloat(b.form))
        .slice(0, 3)

    // 2. Identify "Buy" targets from recommendations not in my team
    const myPlayerIds = new Set(myTeamPicks.map(p => p.element))
    const buyTargets = recommendations
        .filter(r => !myPlayerIds.has(r.id) && (r.recommendation === "Strong Buy" || r.recommendation === "Buy"))
        .slice(0, 3)

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border/50 bg-card/40 backdrop-blur-md overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <TrendingDown className="w-24 h-24 text-destructive" />
                </div>
                <CardHeader className="pb-3 px-6 pt-6">
                    <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        Priority Sells / Holds
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0 space-y-4">
                    {sellCandidates.length > 0 ? (
                        sellCandidates.map((p, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-destructive/5 border border-destructive/10">
                                <div>
                                    <p className="font-bold text-sm tracking-tight">{p.name}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">{p.teamName} • Form: {p.form}</p>
                                </div>
                                <Badge variant="outline" className={cn(
                                    "text-[9px] font-black uppercase tracking-widest",
                                    p.status !== "a" ? "border-red-500/50 text-red-500" : "border-orange-500/50 text-orange-500"
                                )}>
                                    {p.status !== "a" ? "Flagged" : "Underperforming"}
                                </Badge>
                            </div>
                        ))
                    ) : (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/5 border border-green-500/10">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            <p className="text-xs font-bold text-green-600/80 uppercase tracking-wider">No weak links detected</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/40 backdrop-blur-md overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Sparkles className="w-24 h-24 text-primary" />
                </div>
                <CardHeader className="pb-3 px-6 pt-6">
                    <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        Recommended Replacements
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0 space-y-4">
                    {buyTargets.map((r, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10">
                            <div className="flex-1">
                                <p className="font-bold text-sm tracking-tight">{r.name}</p>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold">{r.team} • £{r.cost}m • Form: {r.form}</p>
                            </div>
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-primary/20 hover:text-primary transition-all">
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}
