"use client"

import { Zap } from "lucide-react"
import { Match } from "./types"

export function MatchStatsBreakdown({ stats }: { stats: Match['stats'] }) {
    const categories = [
        { id: 'goals_scored', label: 'Goals', icon: '⚽' },
        { id: 'assists', label: 'Assists', icon: '👟' },
        { id: 'own_goals', label: 'Own Goals', icon: '❌' },
        { id: 'penalties_saved', label: 'Penalties Saved', icon: '🥅' },
        { id: 'penalties_missed', label: 'Penalties Missed', icon: '🏴' },
        { id: 'yellow_cards', label: 'Yellow Cards', icon: '🟨' },
        { id: 'red_cards', label: 'Red Cards', icon: '🟥' },
        { id: 'saves', label: 'Saves', icon: '🧤' },
        { id: 'bonus', label: 'Bonus Points (+3, +2, +1)', icon: '💎' },
        { id: 'bps', label: 'BPS (System Value)', icon: '📈' },
        { id: 'defensive_contribution', label: 'Defcoin Points (+1, +2)', icon: '🛡️' },
        { id: 'defcon_actions', label: 'Defcon (Key Actions)', icon: '⚙️' },
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 text-primary">
                <Zap className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-widest text-[10px] md:text-xs">Statistical Breakdown</h4>
            </div>

            <div className="space-y-4">
                {categories.map((cat) => {
                    const data = stats[cat.id]
                    if (!data || (data.h.length === 0 && data.a.length === 0)) return null

                    return (
                        <div key={cat.id} className="grid grid-cols-2 gap-4 border-b border-border/30 pb-4">
                            <div className="col-span-2 text-[10px] font-bold uppercase text-muted-foreground text-center mb-1">
                                {cat.icon} {cat.label}
                            </div>
                            <div className="space-y-1">
                                {data.h.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs px-2 py-1 rounded bg-muted/20">
                                        <span className="font-medium">{item.player}</span>
                                        <span className="font-mono font-bold text-primary">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-1">
                                {data.a.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs px-2 py-1 rounded bg-muted/20">
                                        <span className="font-medium">{item.player}</span>
                                        <span className="font-mono font-bold text-primary">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
