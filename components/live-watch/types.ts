export interface Match {
    id: number
    home: string
    homeShort: string
    away: string
    awayShort: string
    homeScore: number | null
    awayScore: number | null
    started: boolean
    finished: boolean
    minutes: number
    kickoff: string
    stats: Record<string, { h: { player: string, value: number }[], a: { player: string, value: number }[] }>
    homeId: number
    awayId: number
    xG?: { home: number; away: number }
}

export interface Manager {
    id: string
    name: string
    totalLivePoints: number
    players: {
        id: number
        name: string
        points: number
        multiplier: number
        isCaptain: boolean
        isViceCaptain: boolean
        minutes: number
        defcon: number // raw actions
        defcoinPoints: number // points from actions
        bps: number // raw bps
        bonusPoints: number // expected bonus
        hasCleanSheet: boolean
        isDefensive: boolean
        stats: any[]
    }[]
}
