"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, TrendingUp, TrendingDown, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

interface TeamDependency {
    team: string
    yourPlayers: number
    avgPlayersAround: number
    gainFromTeam: number
}

interface TeamDependencyProps {
    myTeamPicks: any[]
    leagueAverage?: TeamDependency[]
}

export function TeamDependency({ myTeamPicks, leagueAverage = [] }: TeamDependencyProps) {
    // Calculate team distribution from user's picks
    const teamCounts: Record<string, number> = {}
    myTeamPicks.forEach(player => {
        const teamName = player.teamName || "Unknown"
        teamCounts[teamName] = (teamCounts[teamName] || 0) + 1
    })

    // Mock league average data (in production, calculate from all managers' teams)
    const mockLeagueData: TeamDependency[] = [
        { team: "Arsenal", yourPlayers: teamCounts["Arsenal"] || 0, avgPlayersAround: 6.55, gainFromTeam: 28.45 },
        { team: "Man Utd", yourPlayers: teamCounts["Man Utd"] || 0, avgPlayersAround: 4.97, gainFromTeam: 8.03 },
        { team: "Chelsea", yourPlayers: teamCounts["Chelsea"] || 0, avgPlayersAround: 6.19, gainFromTeam: -6.19 },
        { team: "Man City", yourPlayers: teamCounts["Man City"] || 0, avgPlayersAround: 26.76, gainFromTeam: -2.76 },
        { team: "Liverpool", yourPlayers: teamCounts["Liverpool"] || 0, avgPlayersAround: 3.90, gainFromTeam: 2.10 },
        { team: "Aston Villa", yourPlayers: teamCounts["Aston Villa"] || 0, avgPlayersAround: 2.06, gainFromTeam: -2.06 },
        { team: "Sunderland", yourPlayers: teamCounts["Sunderland"] || 0, avgPlayersAround: 1.03, gainFromTeam: 1.97 },
        { team: "Bournemouth", yourPlayers: teamCounts["Bournemouth"] || 0, avgPlayersAround: 2.96, gainFromTeam: -1.96 },
        { team: "Fulham", yourPlayers: teamCounts["Fulham"] || 0, avgPlayersAround: 1.64, gainFromTeam: -1.64 },
        { team: "Spurs", yourPlayers: teamCounts["Spurs"] || 0, avgPlayersAround: 0.82, gainFromTeam: 1.18 },
        { team: "Everton", yourPlayers: teamCounts["Everton"] || 0, avgPlayersAround: 0.64, gainFromTeam: -0.64 },
        { team: "Brentford", yourPlayers: teamCounts["Brentford"] || 0, avgPlayersAround: 1.39, gainFromTeam: 0.61 },
    ].sort((a, b) => Math.abs(b.gainFromTeam) - Math.abs(a.gainFromTeam))

    const totalYourPlayers = mockLeagueData.reduce((sum, t) => sum + t.yourPlayers, 0)
    const totalGain = mockLeagueData.reduce((sum, t) => sum + t.gainFromTeam, 0)

    return (
        <Card className="border-border/50 bg-card/40 backdrop-blur-md">
            <CardHeader className="border-b border-border/50 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-base uppercase tracking-wider font-bold">
                            <Shield className="h-5 w-5 text-primary" />
                            Team Dependency Analysis
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                            How your squad compares to top 10k managers
                        </CardDescription>
                    </div>
                    <div className="text-right">
                        <p className="text-[8px] text-muted-foreground uppercase tracking-wider font-bold">Total Gain</p>
                        <p className={cn(
                            "text-2xl font-mono font-black",
                            totalGain > 0 ? "text-green-500" : "text-red-500"
                        )}>
                            {totalGain > 0 ? "+" : ""}{totalGain.toFixed(2)}
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-border/20">
                    {mockLeagueData.map((team) => {
                        const isPositive = team.gainFromTeam > 0
                        const hasPlayers = team.yourPlayers > 0
                        const dependencyLevel = (team.yourPlayers / 15) * 100 // Max 15 players
                        
                        return (
                            <div 
                                key={team.team}
                                className={cn(
                                    "px-6 py-4 hover:bg-muted/20 transition-colors",
                                    hasPlayers && "bg-muted/5"
                                )}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted/20 text-muted-foreground font-bold text-xs">
                                            {team.yourPlayers}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{team.team}</p>
                                            <p className="text-[10px] text-muted-foreground">
                                                Avg: {team.avgPlayersAround.toFixed(2)} players
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-[8px] text-muted-foreground uppercase tracking-wider font-bold mb-0.5">
                                                {isPositive ? "Advantage" : "Disadvantage"}
                                            </p>
                                            <div className="flex items-center gap-1">
                                                {isPositive ? (
                                                    <TrendingUp className="w-3 h-3 text-green-500" />
                                                ) : (
                                                    <TrendingDown className="w-3 h-3 text-red-500" />
                                                )}
                                                <p className={cn(
                                                    "text-lg font-mono font-black",
                                                    isPositive ? "text-green-500" : "text-red-500"
                                                )}>
                                                    {isPositive ? "+" : ""}{team.gainFromTeam.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {hasPlayers && (
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                                            <span>Squad Dependency</span>
                                            <span>{dependencyLevel.toFixed(0)}%</span>
                                        </div>
                                        <Progress 
                                            value={dependencyLevel} 
                                            className="h-1.5"
                                        />
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Summary Footer */}
                <div className="px-6 py-4 bg-muted/10 border-t border-border/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                Total Squad: {totalYourPlayers} Players
                            </span>
                        </div>
                        <Badge className={cn(
                            "text-xs font-black",
                            totalGain > 0 ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                        )}>
                            {totalGain > 0 ? "Differential Advantage" : "Template Disadvantage"}
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

