"use client"

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Zap, Shield, Trophy, AlertTriangle, Activity } from "lucide-react"
import { Match } from "./types"
import { cn } from "@/lib/utils"

interface EnhancedMatchModalProps {
    match: Match
    onClose: () => void
}

export function EnhancedMatchModal({ match, onClose }: EnhancedMatchModalProps) {
    const statCategories = [
        { 
            id: 'goals_scored', 
            label: 'Goals', 
            icon: '⚽',
            color: 'text-green-500',
            bgColor: 'bg-green-500/5',
            borderColor: 'border-green-500/20'
        },
        { 
            id: 'assists', 
            label: 'Assists', 
            icon: '🎯',
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/5',
            borderColor: 'border-blue-500/20'
        },
        { 
            id: 'bonus', 
            label: 'Bonus Points', 
            icon: '💎',
            color: 'text-yellow-500',
            bgColor: 'bg-yellow-500/5',
            borderColor: 'border-yellow-500/20'
        },
        { 
            id: 'bps', 
            label: 'BPS (Bonus Point System)', 
            icon: '📊',
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/5',
            borderColor: 'border-purple-500/20'
        },
        { 
            id: 'defcon_actions', 
            label: 'Defcon Actions', 
            icon: '🛡️',
            color: 'text-cyan-500',
            bgColor: 'bg-cyan-500/5',
            borderColor: 'border-cyan-500/20'
        },
        { 
            id: 'defensive_contribution', 
            label: 'Defcoin Points', 
            icon: '🔰',
            color: 'text-indigo-500',
            bgColor: 'bg-indigo-500/5',
            borderColor: 'border-indigo-500/20'
        },
        { 
            id: 'saves', 
            label: 'Saves', 
            icon: '🧤',
            color: 'text-orange-500',
            bgColor: 'bg-orange-500/5',
            borderColor: 'border-orange-500/20'
        },
        { 
            id: 'yellow_cards', 
            label: 'Yellow Cards', 
            icon: '🟨',
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-600/5',
            borderColor: 'border-yellow-600/20'
        },
        { 
            id: 'red_cards', 
            label: 'Red Cards', 
            icon: '🟥',
            color: 'text-red-500',
            bgColor: 'bg-red-500/5',
            borderColor: 'border-red-500/20'
        },
        { 
            id: 'penalties_saved', 
            label: 'Penalties Saved', 
            icon: '🥅',
            color: 'text-green-600',
            bgColor: 'bg-green-600/5',
            borderColor: 'border-green-600/20'
        },
        { 
            id: 'penalties_missed', 
            label: 'Penalties Missed', 
            icon: '❌',
            color: 'text-red-600',
            bgColor: 'bg-red-600/5',
            borderColor: 'border-red-600/20'
        },
        { 
            id: 'own_goals', 
            label: 'Own Goals', 
            icon: '⚠️',
            color: 'text-orange-600',
            bgColor: 'bg-orange-600/5',
            borderColor: 'border-orange-600/20'
        },
    ]

    const renderStatSection = (category: typeof statCategories[0]) => {
        const data = match.stats[category.id]
        if (!data || (data.h.length === 0 && data.a.length === 0)) return null

        return (
            <div key={category.id} className="space-y-3">
                <div className="flex items-center gap-2">
                    <div className={cn("p-1.5 rounded-lg", category.bgColor)}>
                        <span className="text-sm">{category.icon}</span>
                    </div>
                    <h4 className={cn("text-xs font-black uppercase tracking-wider", category.color)}>
                        {category.label}
                    </h4>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        {data.h.length > 0 ? (
                            data.h.map((item, i) => (
                                <div key={i} className={cn("flex items-center justify-between text-xs px-3 py-2 rounded-lg border", category.bgColor, category.borderColor)}>
                                    <span className="font-medium">{item.player}</span>
                                    <Badge className={cn("text-[10px] font-black", category.bgColor, category.color, "border-0")}>
                                        {item.value}
                                    </Badge>
                                </div>
                            ))
                        ) : (
                            <div className="text-[10px] text-muted-foreground text-center py-2">-</div>
                        )}
                    </div>
                    <div className="space-y-1.5">
                        {data.a.length > 0 ? (
                            data.a.map((item, i) => (
                                <div key={i} className={cn("flex items-center justify-between text-xs px-3 py-2 rounded-lg border", category.bgColor, category.borderColor)}>
                                    <span className="font-medium">{item.player}</span>
                                    <Badge className={cn("text-[10px] font-black", category.bgColor, category.color, "border-0")}>
                                        {item.value}
                                    </Badge>
                                </div>
                            ))
                        ) : (
                            <div className="text-[10px] text-muted-foreground text-center py-2">-</div>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
            <Card className="w-full max-w-4xl max-h-[85vh] overflow-hidden relative shadow-2xl border-primary/20 bg-card/95 backdrop-blur-xl">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full hover:bg-muted/50"
                    onClick={onClose}
                >
                    <X className="h-4 w-4" />
                </Button>

                <CardHeader className="text-center border-b border-border/50 bg-muted/5 pb-6">
                    <div className="flex items-center justify-center gap-8 mb-4">
                        <div className="text-center">
                            <div className="text-xs font-bold uppercase text-muted-foreground mb-2 tracking-wider">Home</div>
                            <div className="text-2xl font-sports font-black tracking-tight uppercase">{match.homeShort}</div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="text-5xl font-sports font-black flex items-center gap-4">
                                <span className={cn(match.homeScore! > match.awayScore! && "text-primary")}>{match.homeScore}</span>
                                <span className="text-muted-foreground/30 text-3xl">-</span>
                                <span className={cn(match.awayScore! > match.homeScore! && "text-primary")}>{match.awayScore}</span>
                            </div>
                            <Badge 
                                variant={match.finished ? "secondary" : "destructive"} 
                                className={cn("font-mono mt-3", !match.finished && "animate-pulse")}
                            >
                                {match.finished ? "Full Time" : `${match.minutes}'`}
                            </Badge>
                        </div>
                        <div className="text-center">
                            <div className="text-xs font-bold uppercase text-muted-foreground mb-2 tracking-wider">Away</div>
                            <div className="text-2xl font-sports font-black tracking-tight uppercase">{match.awayShort}</div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
                    <Tabs defaultValue="key" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-3 bg-muted/10 p-1 rounded-xl border border-border/20">
                            <TabsTrigger value="key" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-bold uppercase tracking-wider text-[10px]">
                                <Zap className="w-3 h-3 mr-1.5" /> Key Stats
                            </TabsTrigger>
                            <TabsTrigger value="defensive" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-bold uppercase tracking-wider text-[10px]">
                                <Shield className="w-3 h-3 mr-1.5" /> Defensive
                            </TabsTrigger>
                            <TabsTrigger value="discipline" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-bold uppercase tracking-wider text-[10px]">
                                <AlertTriangle className="w-3 h-3 mr-1.5" /> Discipline
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="key" className="space-y-6">
                            {renderStatSection(statCategories[0])} {/* Goals */}
                            {renderStatSection(statCategories[1])} {/* Assists */}
                            {renderStatSection(statCategories[2])} {/* Bonus */}
                            {renderStatSection(statCategories[3])} {/* BPS */}
                        </TabsContent>

                        <TabsContent value="defensive" className="space-y-6">
                            {renderStatSection(statCategories[4])} {/* Defcon */}
                            {renderStatSection(statCategories[5])} {/* Defcoin */}
                            {renderStatSection(statCategories[6])} {/* Saves */}
                            {renderStatSection(statCategories[9])} {/* Penalties Saved */}
                        </TabsContent>

                        <TabsContent value="discipline" className="space-y-6">
                            {renderStatSection(statCategories[7])} {/* Yellow Cards */}
                            {renderStatSection(statCategories[8])} {/* Red Cards */}
                            {renderStatSection(statCategories[10])} {/* Penalties Missed */}
                            {renderStatSection(statCategories[11])} {/* Own Goals */}
                        </TabsContent>
                    </Tabs>

                    {/* Info Box */}
                    <div className="mt-6 p-4 rounded-lg bg-muted/20 border border-border/50">
                        <div className="flex items-start gap-3">
                            <Activity className="w-4 h-4 text-primary mt-0.5" />
                            <div className="space-y-1 text-[10px] text-muted-foreground">
                                <p><strong className="text-foreground">BPS (Bonus Point System):</strong> Raw score determining bonus points. Top 3 BPS get +3, +2, +1 bonus.</p>
                                <p><strong className="text-foreground">Defcon Actions:</strong> Defensive actions (tackles, blocks, clearances) that contribute to Defcoin points.</p>
                                <p><strong className="text-foreground">Defcoin Points:</strong> FPL points earned from defensive contributions (+1 or +2 per action).</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

