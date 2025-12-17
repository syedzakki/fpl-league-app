"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { CheckCircle2, Clock, Radio } from "lucide-react"

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
      <Card className="bg-white dark:bg-[#1A1F16] border-[#DBC2CF] dark:border-[#19297C]">
        <CardContent className="p-8 text-center">
          <p className="text-[#19297C] dark:text-[#DBC2CF]">No fixtures available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {fixtures.map((fixture) => (
        <Card 
          key={fixture.id} 
          className={`bg-white dark:bg-[#1A1F16] border-[#DBC2CF] dark:border-[#19297C] overflow-hidden transition-all ${
            fixture.started && !fixture.finished ? 'ring-2 ring-[#F26430]' : ''
          }`}
        >
          <CardContent className="p-0">
            {/* Status Bar */}
            <div className={`py-1.5 px-3 text-xs font-medium flex items-center justify-between ${
              fixture.finished 
                ? 'bg-[#19297C] text-white'
                : fixture.started 
                ? 'bg-[#F26430] text-white'
                : 'bg-[#DBC2CF]/30 dark:bg-[#19297C]/30 text-[#19297C] dark:text-[#DBC2CF]'
            }`}>
              <div className="flex items-center gap-1.5">
                {fixture.finished ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" />
                    <span>FT</span>
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
              <span className="text-xs opacity-75">GW{gameweek}</span>
            </div>

            {/* Match Details */}
            <div className="p-4 space-y-3">
              {/* Home Team */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-[#DBC2CF]/20 dark:bg-[#19297C]/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-[#19297C] dark:text-[#028090]">
                      {fixture.homeTeam}
                    </span>
                  </div>
                  <span className="font-semibold text-[#1A1F16] dark:text-[#FFFCF2] truncate">
                    {fixture.homeTeamFull}
                  </span>
                </div>
                {(fixture.started || fixture.finished) && fixture.homeScore !== null ? (
                  <span className="text-2xl font-bold font-mono text-[#1A1F16] dark:text-[#FFFCF2] ml-2">
                    {fixture.homeScore}
                  </span>
                ) : null}
              </div>

              {/* Score Separator or vs */}
              <div className="flex items-center justify-center">
                {fixture.started || fixture.finished ? (
                  <div className="h-px w-full bg-[#DBC2CF] dark:bg-[#19297C]" />
                ) : (
                  <span className="text-xs text-[#19297C] dark:text-[#DBC2CF] font-medium">vs</span>
                )}
              </div>

              {/* Away Team */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-[#DBC2CF]/20 dark:bg-[#19297C]/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-[#19297C] dark:text-[#028090]">
                      {fixture.awayTeam}
                    </span>
                  </div>
                  <span className="font-semibold text-[#1A1F16] dark:text-[#FFFCF2] truncate">
                    {fixture.awayTeamFull}
                  </span>
                </div>
                {(fixture.started || fixture.finished) && fixture.awayScore !== null ? (
                  <span className="text-2xl font-bold font-mono text-[#1A1F16] dark:text-[#FFFCF2] ml-2">
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

