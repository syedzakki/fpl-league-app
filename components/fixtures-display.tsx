"use client"

import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"
import { CheckCircle2, Clock, Radio } from "lucide-react"
import { cn } from "@/lib/utils"

interface Fixture {
  id: number
  homeTeam: string
  homeTeamFull: string
  awayTeam: string
  awayTeamFull: string
  kickoff: string | null
  finished: boolean
  started: boolean
  homeScore: number | null
  awayScore: number | null
  minutes?: number
}

interface FixturesDisplayProps {
  fixtures: Fixture[]
  gameweek: number
}

export function FixturesDisplay({ fixtures, gameweek }: FixturesDisplayProps) {
  if (fixtures.length === 0) {
    return (
      <Card className="bg-muted/10 border-border/50 border-dashed">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No fixtures available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {fixtures.map((fixture) => (
        <Card
          key={fixture.id}
          className={cn(
            "bg-card border-border/50 overflow-hidden transition-all hover:bg-muted/20",
            fixture.started && !fixture.finished ? 'ring-1 ring-destructive border-transparent' : ''
          )}
        >
          <CardContent className="p-0">
            {/* Status Bar */}
            <div className={cn(
              "py-1.5 px-3 text-[10px] uppercase tracking-wider font-bold flex items-center justify-between",
              fixture.finished
                ? 'bg-muted/50 text-muted-foreground'
                : fixture.started
                  ? 'bg-destructive text-destructive-foreground'
                  : 'bg-muted/30 text-muted-foreground'
            )}>
              <div className="flex items-center gap-1.5">
                {fixture.finished ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Full Time</span>
                  </>
                ) : fixture.started ? (
                  <>
                    <Radio className="h-3 w-3 animate-pulse" />
                    <span>LIVE {fixture.minutes ? `${fixture.minutes}'` : ''}</span>
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3" />
                    <span>{fixture.kickoff ? format(new Date(fixture.kickoff), 'EEE HH:mm') : 'TBD'}</span>
                  </>
                )}
              </div>
              <span className="opacity-75">GW{gameweek}</span>
            </div>

            {/* Match Details */}
            <div className="p-4 space-y-3">
              {/* Home Team */}
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                      {fixture.homeTeam}
                    </span>
                  </div>
                  <span className={cn("text-sm font-bold truncate", fixture.homeScore !== null && fixture.awayScore !== null && fixture.homeScore > fixture.awayScore ? "text-foreground" : "text-muted-foreground")}>
                    {fixture.homeTeamFull}
                  </span>
                </div>
                {(fixture.started || fixture.finished) && fixture.homeScore !== null ? (
                  <span className={cn("text-xl font-bold font-mono ml-2", fixture.homeScore > (fixture.awayScore || 0) ? "text-primary" : "text-foreground")}>
                    {fixture.homeScore}
                  </span>
                ) : null}
              </div>

              {/* Score Separator or vs */}
              <div className="flex items-center justify-center -my-1 opacity-20">
                {fixture.started || fixture.finished ? (
                  <div className="h-px w-full bg-border" />
                ) : (
                  <span className="text-[10px] font-bold uppercase">vs</span>
                )}
              </div>

              {/* Away Team */}
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                      {fixture.awayTeam}
                    </span>
                  </div>
                  <span className={cn("text-sm font-bold truncate", fixture.awayScore !== null && fixture.homeScore !== null && fixture.awayScore > fixture.homeScore ? "text-foreground" : "text-muted-foreground")}>
                    {fixture.awayTeamFull}
                  </span>
                </div>
                {(fixture.started || fixture.finished) && fixture.awayScore !== null ? (
                  <span className={cn("text-xl font-bold font-mono ml-2", fixture.awayScore > (fixture.homeScore || 0) ? "text-primary" : "text-foreground")}>
                    {fixture.awayScore}
                  </span>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
