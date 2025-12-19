"use client"

import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star } from "lucide-react"
import { BlurFade } from "@/components/ui/blur-fade"
import { cn } from "@/lib/utils"
import { Manager } from "./types"

interface ManagerLiveCardProps {
    manager: Manager
    index: number
}

export function ManagerLiveCard({ manager, index }: ManagerLiveCardProps) {
    const sortedPlayers = [...manager.players].sort((a, b) => b.points - a.points)

    return (
        <BlurFade delay={0.1 + index * 0.05}>
            <Card className="h-full flex flex-col border-border/50 hover:border-primary/30 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between py-4 px-5 border-b border-border/50 bg-muted/5">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-primary/20">
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                {manager.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-sm font-bold italic uppercase">{manager.name}</CardTitle>
                            <CardDescription className="text-[10px] uppercase font-bold tracking-tighter opacity-50">
                                {manager.players.filter(p => p.minutes > 0).length} / 11 Playing
                            </CardDescription>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-sports font-black text-primary">{manager.totalLivePoints}</div>
                        <div className="text-[9px] font-bold uppercase tracking-widest opacity-50">Live Pts</div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 flex-1">
                    <div className="divide-y divide-border/50 max-h-[300px] overflow-y-auto custom-scrollbar">
                        {sortedPlayers.map((player) => (
                            <div key={player.id} className="flex items-center justify-between px-5 py-2.5 hover:bg-muted/10 transition-colors group">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-1.5">
                                        <span className={cn(
                                            "text-xs font-bold",
                                            player.minutes > 0 ? "text-foreground" : "text-muted-foreground"
                                        )}>
                                            {player.name}
                                        </span>
                                        {player.isCaptain && <Badge className="h-4 px-1 text-[8px] font-black bg-primary text-primary-foreground">C</Badge>}
                                        {player.isViceCaptain && <Badge className="h-4 px-1 text-[8px] font-black bg-muted text-muted-foreground uppercase">V</Badge>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] text-muted-foreground uppercase tracking-tight">
                                            {player.minutes > 0 ? `${player.minutes}'` : "Not Started"}
                                        </span>
                                        {player.minutes > 0 && (
                                            <div className="flex gap-1">
                                                {/* Defensive Actions (Defcon) vs Points (Defcoin) */}
                                                {player.isDefensive && (
                                                    <>
                                                        <Badge variant="outline" className="h-3.5 px-1 text-[8px] border-primary/20 bg-primary/5 text-primary">
                                                            DEF {player.defcon}
                                                        </Badge>
                                                        {player.defcoinPoints > 0 && (
                                                            <Badge className="h-3.5 px-1 text-[8px] font-black bg-emerald-500 text-white border-none">
                                                                +{player.defcoinPoints}
                                                            </Badge>
                                                        )}
                                                    </>
                                                )}

                                                {/* BPS vs Bonus Points */}
                                                <Badge variant="outline" className="h-3.5 px-1 text-[8px] border-muted-foreground/20 bg-muted/5 text-muted-foreground">
                                                    BPS {player.bps}
                                                </Badge>
                                                {player.bonusPoints > 0 && (
                                                    <Badge className="h-3.5 px-1 text-[8px] font-black bg-amber-500 text-white border-none">
                                                        +{player.bonusPoints}
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                        {player.isDefensive && player.minutes > 0 && player.hasCleanSheet && (
                                            <Badge variant="outline" className="h-3.5 px-1 text-[8px] border-blue-500/20 bg-blue-500/5 text-blue-500">
                                                CS
                                            </Badge>
                                        )}
                                        {player.points > 5 && <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />}
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    <div className={cn(
                                        "text-sm font-mono font-bold",
                                        player.points > 0 ? "text-primary" : "text-muted-foreground"
                                    )}>
                                        {player.points}
                                    </div>
                                    <div className="flex gap-1 overflow-hidden h-3">
                                        {player.stats.filter(s => s.value !== 0).map((s, idx) => (
                                            <span key={idx} className="text-[8px] font-medium text-muted-foreground/50 uppercase tracking-tighter">
                                                {s.identifier.slice(0, 3)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </BlurFade>
    )
}
