"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useTeam } from "@/components/providers/team-provider"
import { Shield, ArrowRight, Trophy, Users, Loader2 } from "lucide-react"
import { BlurFade } from "@/components/ui/blur-fade"
import { Meteors } from "@/components/ui/meteors"
import { ShineBorder } from "@/components/ui/shine-border"
import { ShinyButton } from "@/components/ui/shiny-button"

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
      <Meteors number={30} />
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-50">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[120px] rounded-full" />
      </div>

      <BlurFade delay={0.1}>
        <div className="text-center mb-10 space-y-4 relative z-10">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mb-2 border border-primary/10 shadow-lg shadow-primary/10">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-5xl md:text-7xl font-sports font-bold uppercase italic tracking-tighter bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-transparent">
            FPL <span className="text-primary">League</span> Hub
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
            The ultimate companion for your mini-league. <br />Track rivals, visualize stats, and dominate.
          </p>
        </div>
      </BlurFade>

      <BlurFade delay={0.2}>
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <Card className="w-full max-w-2xl border-border/50 bg-card/80 backdrop-blur-xl relative z-10 overflow-hidden shadow-2xl">
            <ShineBorder className="absolute inset-0 w-full h-full pointer-events-none opacity-50" shineColor={["#FFCF99", "#92140C"]} duration={10} />
            <CardHeader className="text-center border-b border-border/50 pb-6">
              <CardTitle className="uppercase tracking-widest text-sm font-bold text-muted-foreground">Identity Verification</CardTitle>
              <CardDescription className="text-xl font-bold text-foreground">
                Select Your Team
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex flex-col items-center py-8 gap-3">
                  <Loader2 className="animate-spin text-primary w-10 h-10" />
                  <p className="text-sm font-medium text-muted-foreground animate-pulse">Syncing League Data...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {teams.map((team) => (
                    <button
                      key={team.teamId}
                      onClick={() => setSelected(team.teamId)}
                      className={`
                          flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 text-left group relative overflow-hidden
                          ${selected === team.teamId
                          ? "bg-primary/10 border-primary shadow-[0_0_20px_rgba(var(--primary),0.3)]"
                          : "bg-muted/30 border-transparent hover:border-primary/50 hover:bg-muted/50"}
                        `}
                    >
                      {selected === team.teamId && (
                        <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                      )}
                      <div className={`p-2 rounded-full z-10 transition-colors ${selected === team.teamId ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                        <Shield className="w-5 h-5" />
                      </div>
                      <div className="flex-1 z-10">
                        <p className={`font-bold text-base tracking-wide ${selected === team.teamId ? "text-primary" : "text-foreground"}`}>{team.userName}</p>
                        <p className="text-xs text-muted-foreground font-mono">ID: {team.teamId}</p>
                      </div>
                      {selected === team.teamId && <ArrowRight className="w-5 h-5 text-primary z-10 animate-in slide-in-from-left-2" />}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t border-border/50 pt-6 flex justify-center pb-8">
              <ShinyButton
                className="w-full max-w-[200px]"
                onClick={handleLogin}
              // disabled={!selected || loading} // ShinyButton might not proxy disabled prop correctly, need to check implementation or wrap
              >
                Enter Hub
              </ShinyButton>
            </CardFooter>
          </Card>
        </div>
      </BlurFade>

      <div className="mt-12 text-center text-[10px] text-muted-foreground/50 relative z-10 flex flex-col gap-1 items-center uppercase tracking-[0.2em] font-bold">
        <Users className="w-4 h-4 mb-2 opacity-50" />
        <span>Sports-Grade Analytics • Season 24/25</span>
      </div>
    </div>
  )
}
