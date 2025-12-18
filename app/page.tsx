"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useTeam } from "@/components/providers/team-provider"
import { Shield, ArrowRight, Trophy, Users, Loader2 } from "lucide-react"
import { BlurFade } from "@/components/ui/blur-fade"

interface Team {
  teamId: string
  userName: string
}

export default function LandingPage() {
  const router = useRouter()
  const { setTeam } = useTeam()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    // Fetch available teams (managers)
    const fetchTeams = async () => {
      try {
        const res = await fetch("/api/fpl-data")
        const data = await res.json()
        if (data.success && data.data?.leaderboard) {
          const teamList = data.data.leaderboard.map((t: any) => ({
            teamId: t.teamId,
            userName: t.userName
          }))
          setTeams(teamList)
        }
      } catch (err) {
        console.error("Failed to load teams", err)
      } finally {
        setLoading(false)
      }
    }
    fetchTeams()
  }, [])

  const handleLogin = () => {
    if (!selected) return
    const team = teams.find(t => t.teamId === selected)
    if (team) {
      console.log("Logging in via setTeam:", team)
      setTeam(team.teamId, team.userName)
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[120px] rounded-full" />
      </div>

      <BlurFade delay={0.1}>
        <div className="text-center mb-8 space-y-2 relative z-10">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-4">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-sports font-bold uppercase italic tracking-wider">
            FPL <span className="text-primary">League</span> Hub
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            The ultimate companion for your mini-league. Track rivals, visualize stats, and dominate the season.
          </p>
        </div>
      </BlurFade>

      <BlurFade delay={0.2}>
        <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-xl relative z-10">
          <CardHeader className="text-center border-b border-border/50 pb-6">
            <CardTitle>Select Your Team</CardTitle>
            <CardDescription>
              Identify yourself to personalize your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex flex-col items-center py-6 gap-2">
                <Loader2 className="animate-spin text-primary w-8 h-8" />
                <p className="text-sm text-muted-foreground">Loading League Data...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {teams.map((team) => (
                  <button
                    key={team.teamId}
                    onClick={() => setSelected(team.teamId)}
                    className={`
                       flex items-center gap-3 p-3 rounded-lg border transition-all text-left group
                       ${selected === team.teamId
                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                        : "bg-muted/30 border-transparent hover:border-primary/50 hover:bg-muted/50"}
                     `}
                  >
                    <div className={`p-2 rounded-full ${selected === team.teamId ? "bg-white/20" : "bg-primary/10"}`}>
                      <Shield className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm tracking-wide">{team.userName}</p>
                      <p className={`text-xs ${selected === team.teamId ? "text-primary-foreground/80" : "text-muted-foreground"}`}>Team ID: {team.teamId}</p>
                    </div>
                    {selected === team.teamId && <ArrowRight className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t border-border/50 pt-6">
            <Button
              className="w-full font-bold uppercase tracking-wider h-12 text-base"
              size="lg"
              disabled={!selected || loading}
              onClick={handleLogin}
            >
              Enter Hub
            </Button>
          </CardFooter>
        </Card>
      </BlurFade>

      <div className="mt-8 text-center text-xs text-muted-foreground relative z-10 flex items-center gap-2">
        <Users className="w-3 h-3" />
        <span>Sports-Grade Analytics • Live Updates • Rival Tracking</span>
      </div>
    </div>
  )
}
