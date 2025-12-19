"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, AlertCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface Player {
    id: number
    name: string
    fullName: string
    team: string
    teamFull: string
    position: string
    cost: number
    costChange: number
    costChangeStart: number
    selectedBy: number
    form: number
    transfersIn: number
    transfersOut: number
    status: string
    news: string
}

interface PriceChangesData {
    risers: Player[]
    fallers: Player[]
    likelyRisers: Player[]
    likelyFallers: Player[]
    lastUpdated: string
}

export function PriceChanges() {
    const [data, setData] = useState<PriceChangesData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchPriceChanges()
    }, [])

    const fetchPriceChanges = async () => {
        try {
            setLoading(true)
            const response = await fetch("/api/price-changes")
            const json = await response.json()
            if (json.success) {
                setData(json.data)
            }
        } catch (error) {
            console.error("Failed to fetch price changes:", error)
        } finally {
            setLoading(false)
        }
    }

    const getPositionColor = (position: string) => {
        switch (position) {
            case "GKP": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
            case "DEF": return "bg-green-500/10 text-green-500 border-green-500/20"
            case "MID": return "bg-blue-500/10 text-blue-500 border-blue-500/20"
            case "FWD": return "bg-red-500/10 text-red-500 border-red-500/20"
            default: return "bg-muted/10 text-muted-foreground border-border/20"
        }
    }

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
        if (num >= 1000) return (num / 1000).toFixed(0) + "K"
        return num.toLocaleString()
    }

    const renderPlayerCard = (player: Player, type: "riser" | "faller" | "likely") => {
        const isRiser = type === "riser" || type === "likely"
        const changeAmount = type === "likely" ? (isRiser ? player.transfersIn : player.transfersOut) : Math.abs(player.costChange)
        
        return (
            <div 
                key={player.id}
                className={cn(
                    "p-4 rounded-xl border transition-all hover:scale-[1.02]",
                    isRiser ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20"
                )}
            >
                <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={cn("text-[9px] font-bold", getPositionColor(player.position))}>
                                {player.position}
                            </Badge>
                            <Badge variant="outline" className="text-[9px] font-bold border-border/30">
                                {player.team}
                            </Badge>
                        </div>
                        <p className="font-bold text-base tracking-tight">{player.name}</p>
                        <p className="text-[10px] text-muted-foreground">{player.fullName}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xl font-mono font-black text-primary">£{player.cost.toFixed(1)}m</p>
                        {type !== "likely" && (
                            <div className={cn(
                                "flex items-center gap-1 justify-end text-xs font-black",
                                isRiser ? "text-green-500" : "text-red-500"
                            )}>
                                {isRiser ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {isRiser ? "+" : ""}{player.costChange.toFixed(1)}m
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border/20">
                    <div>
                        <p className="text-[8px] text-muted-foreground uppercase tracking-wider font-bold">Ownership</p>
                        <p className="text-xs font-bold">{player.selectedBy.toFixed(1)}%</p>
                    </div>
                    <div>
                        <p className="text-[8px] text-muted-foreground uppercase tracking-wider font-bold">Form</p>
                        <p className="text-xs font-bold">{player.form.toFixed(1)}</p>
                    </div>
                    <div>
                        <p className="text-[8px] text-muted-foreground uppercase tracking-wider font-bold">
                            {type === "likely" ? (isRiser ? "In" : "Out") : "Change"}
                        </p>
                        <p className={cn(
                            "text-xs font-bold",
                            isRiser ? "text-green-500" : "text-red-500"
                        )}>
                            {type === "likely" ? formatNumber(changeAmount) : `${isRiser ? "+" : ""}${changeAmount.toFixed(1)}m`}
                        </p>
                    </div>
                </div>

                {player.news && (
                    <div className="mt-2 p-2 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-start gap-2">
                        <AlertCircle className="w-3 h-3 text-orange-500 flex-shrink-0 mt-0.5" />
                        <p className="text-[10px] text-orange-500 font-medium">{player.news}</p>
                    </div>
                )}
            </div>
        )
    }

    if (loading) {
        return (
            <Card className="border-border/50 bg-card/40 backdrop-blur-md">
                <CardContent className="p-12">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!data) {
        return (
            <Card className="border-border/50 bg-card/40 backdrop-blur-md">
                <CardContent className="p-12">
                    <p className="text-center text-muted-foreground">Failed to load price changes</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-border/50 bg-card/40 backdrop-blur-md">
            <CardHeader className="pb-3 px-6 pt-6 border-b border-border/50">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        Price Changes
                    </CardTitle>
                    <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        Updated {new Date(data.lastUpdated).toLocaleTimeString()}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <Tabs defaultValue="risers" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4 bg-muted/10 border border-border/20 backdrop-blur-sm">
                        <TabsTrigger value="risers" className="gap-1.5 data-[state=active]:bg-green-500/10 data-[state=active]:text-green-500">
                            <TrendingUp className="w-3 h-3" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Risers</span>
                        </TabsTrigger>
                        <TabsTrigger value="fallers" className="gap-1.5 data-[state=active]:bg-red-500/10 data-[state=active]:text-red-500">
                            <TrendingDown className="w-3 h-3" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Fallers</span>
                        </TabsTrigger>
                        <TabsTrigger value="likely-rise" className="gap-1.5 data-[state=active]:bg-green-500/10 data-[state=active]:text-green-500">
                            <Clock className="w-3 h-3" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Likely Rise</span>
                        </TabsTrigger>
                        <TabsTrigger value="likely-fall" className="gap-1.5 data-[state=active]:bg-red-500/10 data-[state=active]:text-red-500">
                            <Clock className="w-3 h-3" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Likely Fall</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="risers" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {data.risers.map(player => renderPlayerCard(player, "riser"))}
                        </div>
                    </TabsContent>

                    <TabsContent value="fallers" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {data.fallers.map(player => renderPlayerCard(player, "faller"))}
                        </div>
                    </TabsContent>

                    <TabsContent value="likely-rise" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {data.likelyRisers.map(player => renderPlayerCard(player, "likely"))}
                        </div>
                    </TabsContent>

                    <TabsContent value="likely-fall" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {data.likelyFallers.map(player => renderPlayerCard(player, "likely"))}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}

