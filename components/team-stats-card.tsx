"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadarChartComponent } from "@/components/charts/radar-chart"
import type { TeamStats, RadarChartData } from "@/lib/types"

interface TeamStatsCardProps {
  stats: TeamStats
  allTeamsStats?: TeamStats[]
}

export function TeamStatsCard({ stats, allTeamsStats = [] }: TeamStatsCardProps) {
  // Prepare radar chart data
  const radarData: RadarChartData[] = [
    {
      subject: "GW Wins",
      [stats.teamName]: stats.gwWins,
      ...(allTeamsStats.length > 0 ? {
        Average: Math.round(allTeamsStats.reduce((sum, t) => sum + t.gwWins, 0) / allTeamsStats.length),
        Max: Math.max(...allTeamsStats.map(t => t.gwWins)),
      } : {}),
    },
    {
      subject: "2nd Finishes",
      [stats.teamName]: stats.secondFinishes,
      ...(allTeamsStats.length > 0 ? {
        Average: Math.round(allTeamsStats.reduce((sum, t) => sum + t.secondFinishes, 0) / allTeamsStats.length),
        Max: Math.max(...allTeamsStats.map(t => t.secondFinishes)),
      } : {}),
    },
    {
      subject: "Last Finishes",
      [stats.teamName]: stats.lastFinishes,
      ...(allTeamsStats.length > 0 ? {
        Average: Math.round(allTeamsStats.reduce((sum, t) => sum + t.lastFinishes, 0) / allTeamsStats.length),
        Max: Math.max(...allTeamsStats.map(t => t.lastFinishes)),
      } : {}),
    },
    {
      subject: "Captaincy Wins",
      [stats.teamName]: stats.captaincyWins,
      ...(allTeamsStats.length > 0 ? {
        Average: Math.round(allTeamsStats.reduce((sum, t) => sum + t.captaincyWins, 0) / allTeamsStats.length),
        Max: Math.max(...allTeamsStats.map(t => t.captaincyWins)),
      } : {}),
    },
    {
      subject: "Avg Points",
      [stats.teamName]: Math.round(stats.averagePoints),
      ...(allTeamsStats.length > 0 ? {
        Average: Math.round(allTeamsStats.reduce((sum, t) => sum + t.averagePoints, 0) / allTeamsStats.length),
        Max: Math.max(...allTeamsStats.map(t => t.averagePoints)),
      } : {}),
    },
  ]

  const dataKeys = [stats.teamName, ...(allTeamsStats.length > 0 ? ["Average", "Max"] : [])]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{stats.teamName}</CardTitle>
            <CardDescription>Team ID: {stats.teamId}</CardDescription>
          </div>
          <Badge variant={stats.leaderboardPosition <= 3 ? "default" : "outline"}>
            #{stats.leaderboardPosition}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Points</p>
            <p className="text-2xl font-bold">{stats.totalPoints}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Average Points</p>
            <p className="text-2xl font-bold">{Math.round(stats.averagePoints)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Best GW</p>
            <p className="text-2xl font-bold">{stats.bestGameweek}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Worst GW</p>
            <p className="text-2xl font-bold">{stats.worstGameweek}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">GW Wins</p>
            <p className="text-xl font-semibold text-green-600">{stats.gwWins}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">2nd Finishes</p>
            <p className="text-xl font-semibold">{stats.secondFinishes}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Last Finishes</p>
            <p className="text-xl font-semibold text-red-600">{stats.lastFinishes}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Captaincy Wins</p>
            <p className="text-xl font-semibold text-blue-600">{stats.captaincyWins}</p>
          </div>
        </div>

        {allTeamsStats.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Performance Comparison</h3>
            <RadarChartComponent data={radarData} dataKeys={dataKeys} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

