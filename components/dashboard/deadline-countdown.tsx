"use client"

import { useEffect, useState } from "react"
import { Clock, AlarmClock } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface DeadlineCountdownProps {
    deadline: string // ISO string
    className?: string
}

import { BorderBeam } from "@/components/ui/border-beam"

interface DeadlineCountdownProps {
    deadline: string // ISO string
    gameweek: number
    className?: string
}

export function NextDeadlineWidget() {
    const [deadlineData, setDeadlineData] = useState<{ deadline: string; gameweek: number } | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDeadline = async () => {
            try {
                // Use our local API proxy to avoid CORS issues
                const response = await fetch("/api/fpl")
                if (!response.ok) throw new Error("Failed to fetch")
                const data = await response.json()

                if (data.success && data.data.events) {
                    const events = data.data.events

                    // Logic to find the next deadline
                    // 1. First, check if there is a 'next' gameweek explicitly marked
                    let nextEvent = events.find((e: any) => e.isNext)

                    // 2. If not, finding the first one with a future deadline
                    if (!nextEvent) {
                        const now = new Date()
                        nextEvent = events.find((e: any) => new Date(e.deadline) > now)
                    }

                    if (nextEvent) {
                        setDeadlineData({
                            deadline: nextEvent.deadline,
                            gameweek: nextEvent.id
                        })
                    }
                }
            } catch (error) {
                console.error("Error fetching deadline:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchDeadline()
    }, [])

    if (loading) return <Card className="p-6 h-full animate-pulse bg-muted/20 border-border/50" />

    // Fallback if no deadline found (end of season?)
    if (!deadlineData) return (
        <Card className="p-6 h-full flex flex-col items-center justify-center bg-muted/10 border-border/50">
            <span className="text-muted-foreground">Season Completed</span>
        </Card>
    )

    return <DeadlineCountdown deadline={deadlineData.deadline} gameweek={deadlineData.gameweek} />
}

export function DeadlineCountdown({ deadline, gameweek, className }: DeadlineCountdownProps) {
    const [timeLeft, setTimeLeft] = useState<{
        days: number
        hours: number
        minutes: number
        seconds: number
        totalSeconds: number
    }>({ days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 })

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime()
            const deadlineTime = new Date(deadline).getTime()
            const difference = deadlineTime - now

            if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 }

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((difference % (1000 * 60)) / 1000),
                totalSeconds: Math.floor(difference / 1000)
            }
        }

        setTimeLeft(calculateTimeLeft())
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000)
        return () => clearInterval(timer)
    }, [deadline])

    const isUrgent = timeLeft.totalSeconds > 0 && timeLeft.totalSeconds < 86400 // Less than 24 hours

    return (
        <Card className={cn("p-6 flex flex-col items-center justify-center relative overflow-hidden bg-card/60 backdrop-blur-2xl border-border/50 h-full group", className)}>
            <BorderBeam size={150} duration={8} delay={0} colorFrom="#FFCF99" colorTo="#92140C" />
            
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 scale-150 -rotate-12 translate-x-4 -translate-y-4">
                <Clock className="w-32 h-32" />
            </div>

            <div className="flex flex-col items-center gap-2 mb-6 z-10">
                <div className="flex items-center gap-2 text-muted-foreground uppercase tracking-widest text-[10px] font-bold">
                    <AlarmClock className={cn("h-3 w-3", isUrgent && "text-destructive animate-pulse")} />
                    <span>GW {gameweek} Deadline</span>
                </div>
                {isUrgent && (
                    <span className="inline-block px-3 py-1 rounded-full text-[9px] font-bold bg-destructive/20 text-destructive animate-pulse border border-destructive/30 uppercase tracking-tighter">
                        HURRY UP!
                    </span>
                )}
            </div>

            <div className="flex items-end gap-2 sm:gap-4 font-sports z-10">
                <TimeUnit value={timeLeft.days} label="Days" isUrgent={isUrgent} />
                <span className="text-2xl sm:text-4xl font-light text-muted-foreground/30 mb-2">:</span>
                <TimeUnit value={timeLeft.hours} label="Hrs" isUrgent={isUrgent} />
                <span className="text-2xl sm:text-4xl font-light text-muted-foreground/30 mb-2">:</span>
                <TimeUnit value={timeLeft.minutes} label="Mins" isUrgent={isUrgent} />
                <span className="text-2xl sm:text-4xl font-light text-muted-foreground/30 mb-2">:</span>
                <TimeUnit value={timeLeft.seconds} label="Secs" isUrgent={isUrgent} />
            </div>
        </Card>
    )
}

function TimeUnit({ value, label, isUrgent }: { value: number; label: string; isUrgent: boolean }) {
    const isSeconds = label === "Secs"
    return (
        <div className="flex flex-col items-center">
            <span className={cn(
                "font-black leading-none tracking-tighter tabular-nums transition-colors",
                isSeconds ? "text-2xl sm:text-4xl" : "text-4xl sm:text-6xl",
                isUrgent ? "text-destructive drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "text-foreground drop-shadow-xl",
                isUrgent && isSeconds && "animate-pulse"
            )}>
                {String(value).padStart(2, "0")}
            </span>
            <span className="text-[10px] uppercase font-medium text-muted-foreground tracking-wider mt-1">
                {label}
            </span>
        </div>
    )
}
