"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Zap, Trophy, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Manager } from "./types"

interface TeamPlayerTilesProps {
    managers: Manager[]
    myTeamId?: string | null
}

export function TeamPlayerTiles({ managers, myTeamId }: TeamPlayerTilesProps) {
    // Sort managers by live points
    const sortedManagers = [...managers].sort((a, b) => b.totalLivePoints - a.totalLivePoints)

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedManagers.map((manager, index) => {
                const isMe = manager.id === myTeamId
                const activePlayers = manager.players.filter(p => p.minutes > 0)
                const benchedPlayers = manager.players.filter(p => p.minutes === 0)
                
                return (
                    <Card 
                        key={manager.id}
                        className={cn(
                            "border-border/50 bg-card/40 backdrop-blur-md overflow-hidden",
                            isMe && "ring-2 ring-primary/50 border-primary/30"
                        )}
                    >
                        <CardHeader className="pb-3 border-b border-border/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
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
                                        <CardTitle className={cn(
                                            "text-sm font-bold",
                                            isMe && "text-primary"
                                        )}>
                                            {manager.name}
                                        </CardTitle>
                                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider">
                                            {activePlayers.length} playing
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-mono font-black text-primary">
                                        {manager.totalLivePoints}
                                    </p>
                                    <p className="text-[8px] text-muted-foreground uppercase tracking-wider">
                                        Points
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        
                        <CardContent className="p-3">
                            <div className="max-h-[280px] overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                                {/* Active Players */}
                                {activePlayers.length > 0 && (
                                    <>
                                        <div className="text-[8px] font-black uppercase tracking-wider text-green-500 mb-1 sticky top-0 bg-card/95 backdrop-blur-sm py-1 z-10">
                                            Active ({activePlayers.length})
                                        </div>
                                        {activePlayers.map((player) => (
                                            <div 
                                                key={player.id}
                                                className="flex items-center justify-between text-[10px] px-2 py-1.5 rounded-lg bg-green-500/5 border border-green-500/10 hover:bg-green-500/10 transition-colors"
                                            >
                                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                                    {player.isCaptain && (
                                                        <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-[7px] px-1 py-0 h-3.5 flex-shrink-0">
                                                            C
                                                        </Badge>
                                                    )}
                                                    {player.isViceCaptain && (
                                                        <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[7px] px-1 py-0 h-3.5 flex-shrink-0">
                                                            V
                                                        </Badge>
                                                    )}
                                                    <span className="font-bold truncate">{player.name}</span>
                                                    <span className="text-[8px] text-muted-foreground flex items-center gap-0.5 flex-shrink-0">
                                                        <Clock className="w-2 h-2" />
                                                        {player.minutes}'
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                                    {player.isDefensive && player.defcon > 0 && (
                                                        <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[7px] px-1 py-0 h-3.5 flex items-center gap-0.5">
                                                            <Shield className="w-2 h-2" />
                                                            {player.defcon}
                                                        </Badge>
                                                    )}
                                                    {player.bps > 0 && (
                                                        <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 text-[7px] px-1 py-0 h-3.5 flex items-center gap-0.5">
                                                            <Zap className="w-2 h-2" />
                                                            {player.bps}
                                                        </Badge>
                                                    )}
                                                    {player.bonusPoints > 0 && (
                                                        <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-[7px] px-1 py-0 h-3.5 flex items-center gap-0.5">
                                                            <Trophy className="w-2 h-2" />
                                                            +{player.bonusPoints}
                                                        </Badge>
                                                    )}
                                                    <span className="font-mono font-black text-primary ml-1">
                                                        {player.points}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}

                                {/* Benched Players */}
                                {benchedPlayers.length > 0 && (
                                    <>
                                        <div className="text-[8px] font-black uppercase tracking-wider text-muted-foreground mb-1 mt-2 sticky top-0 bg-card/95 backdrop-blur-sm py-1 z-10">
                                            Benched ({benchedPlayers.length})
                                        </div>
                                        {benchedPlayers.map((player) => (
                                            <div 
                                                key={player.id}
                                                className="flex items-center justify-between text-[10px] px-2 py-1.5 rounded-lg bg-muted/10 border border-border/20 opacity-60"
                                            >
                                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                                    <span className="font-bold truncate">{player.name}</span>
                                                    <span className="text-[8px] text-muted-foreground">0'</span>
                                                </div>
                                                <span className="font-mono font-black text-muted-foreground">0</span>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}

