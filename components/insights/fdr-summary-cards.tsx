"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingDown, TrendingUp, Target } from "lucide-react"
import { cn } from "@/lib/utils"

interface Fixture {
  id: number
  gameweek: number
  homeTeam: string
  awayTeam: string
  homeDifficulty: number
  awayDifficulty: number
}

interface Team {
  id: number
  name: string
  shortName: string
}

interface FDRSummaryCardsProps {
  fixtures: Fixture[]
  teams: Team[]
  currentGw: number
}

export function FDRSummaryCards({ fixtures, teams, currentGw }: FDRSummaryCardsProps) {
  // Calculate average difficulty for each team over next 8 gameweeks
  const teamsWithDifficulty = teams
    .filter(t => t.id <= 20)
    .map(team => {
      const teamFixtures = fixtures
        .filter(f => 
          (f.homeTeam === team.shortName || f.awayTeam === team.shortName) && 
          f.gameweek >= currentGw && 
          f.gameweek < currentGw + 8
        )
        .map(f => {
          const isHome = f.homeTeam === team.shortName
          return isHome ? f.homeDifficulty : f.awayDifficulty
        })
      
      const avgDifficulty = teamFixtures.length > 0
        ? teamFixtures.reduce((sum, d) => sum + d, 0) / teamFixtures.length
        : 3
      
      return {
        ...team,
        avgDifficulty,
        fixtures: teamFixtures
      }
    })

  // Find best and worst fixture runs
  const sortedByDifficulty = [...teamsWithDifficulty].sort((a, b) => a.avgDifficulty - b.avgDifficulty)
  const bestFixtureRun = sortedByDifficulty[0]
  const worstFixtureRun = sortedByDifficulty[sortedByDifficulty.length - 1]
  const topThreeEasiest = sortedByDifficulty.slice(0, 3)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Best Fixture Run */}
      <Card className="border-green-500/30 bg-green-500/5 backdrop-blur-sm overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <TrendingDown className="w-20 h-20 text-green-500" />
        </div>
        <CardContent className="p-4 relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <TrendingDown className="h-4 w-4 text-green-500" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-green-600">Best Fixtures</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-sports font-black text-green-600">{bestFixtureRun.shortName}</span>
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-[10px] font-black">
                {bestFixtureRun.avgDifficulty.toFixed(2)} FDR
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{bestFixtureRun.name}</p>
            <div className="flex gap-1 mt-3">
              {bestFixtureRun.fixtures.slice(0, 5).map((diff, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-2 flex-1 rounded-full",
                    diff === 1 && "bg-[#00FF87]",
                    diff === 2 && "bg-green-500",
                    diff === 3 && "bg-yellow-500",
                    diff === 4 && "bg-orange-500",
                    diff === 5 && "bg-red-500"
                  )}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Toughest Schedule */}
      <Card className="border-red-500/30 bg-red-500/5 backdrop-blur-sm overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <TrendingUp className="w-20 h-20 text-red-500" />
        </div>
        <CardContent className="p-4 relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <TrendingUp className="h-4 w-4 text-red-500" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Toughest Run</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-sports font-black text-red-600">{worstFixtureRun.shortName}</span>
              <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-[10px] font-black">
                {worstFixtureRun.avgDifficulty.toFixed(2)} FDR
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{worstFixtureRun.name}</p>
            <div className="flex gap-1 mt-3">
              {worstFixtureRun.fixtures.slice(0, 5).map((diff, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-2 flex-1 rounded-full",
                    diff === 1 && "bg-[#00FF87]",
                    diff === 2 && "bg-green-500",
                    diff === 3 && "bg-yellow-500",
                    diff === 4 && "bg-orange-500",
                    diff === 5 && "bg-red-500"
                  )}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transfer Targets */}
      <Card className="border-primary/30 bg-primary/5 backdrop-blur-sm overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Target className="w-20 h-20 text-primary" />
        </div>
        <CardContent className="p-4 relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Transfer Targets</h3>
          </div>
          <div className="space-y-2">
            {topThreeEasiest.map((team, i) => (
              <div key={team.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-border/50 bg-muted/20">
                    {i + 1}
                  </Badge>
                  <span className="text-sm font-bold">{team.shortName}</span>
                </div>
                <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-[9px] font-black">
                  {team.avgDifficulty.toFixed(2)}
                </Badge>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-muted-foreground mt-3 uppercase tracking-wider">
            Teams with easiest fixtures
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

