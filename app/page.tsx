"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useTeam } from "@/components/providers/team-provider"
import { Shield, ArrowRight, Trophy, Users, Loader2, Star, ChevronRight } from "lucide-react"
import { BlurFade } from "@/components/ui/blur-fade"
import { Meteors } from "@/components/ui/meteors"
import { ShineBorder } from "@/components/ui/shine-border"
import { ShinyButton } from "@/components/ui/shiny-button"
import { TEAM_MEMBERS } from "@/lib/constants"

export default function LandingPage() {
  const router = useRouter()
  const { setTeam } = useTeam()
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)

  // Use TEAM_MEMBERS directly for reliable data
  const teams = useMemo(() => {
    return Object.entries(TEAM_MEMBERS).map(([id, name]) => ({
      teamId: id,
      userName: name,
      initials: name.substring(0, 2).toUpperCase()
    }))
  }, [])

  useEffect(() => {
    // Simulate initial sequence
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleLogin = () => {
    if (!selected) return
    const team = teams.find(t => t.teamId === selected)
    if (team) {
      setTeam(team.teamId, team.userName)
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        <Meteors number={40} />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full animate-pulse-slow pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/10 blur-[150px] rounded-full animate-pulse-slow pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />
      </div>

      <div className="w-full max-w-5xl z-10 space-y-12">
        <BlurFade delay={0.1}>
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <Star className="w-3.5 h-3.5 text-primary fill-primary" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/70">Elite Manager Toolkit</span>
            </div>

            <div className="relative inline-block">
              <h1 className="text-6xl md:text-9xl font-sports font-black uppercase italic tracking-tighter leading-none">
                <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">FPL</span>{" "}
                <span className="relative drop-shadow-[0_0_30px_rgba(var(--primary),0.5)]">
                  <span className="text-primary italic">LEAGUE</span>
                  <div className="absolute -inset-1 bg-primary/20 blur-2xl -z-10 animate-pulse" />
                </span>{" "}
                <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">HUB</span>
              </h1>
            </div>

            <p className="text-white/40 text-lg md:text-xl max-w-2xl mx-auto font-medium tracking-tight leading-relaxed">
              The ultimate performance dashboard for your mini-league.
              <span className="block text-white/20 text-sm mt-2 uppercase tracking-widest font-bold">Track • Analyze • Dominate</span>
            </p>
          </div>
        </BlurFade>

        <BlurFade delay={0.3}>
          <div className="relative max-w-xl mx-auto">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-secondary/50 rounded-[2.5rem] blur-2xl opacity-20" />

            <Card className="relative overflow-hidden border-white/10 bg-black/40 backdrop-blur-[40px] rounded-[2rem] shadow-2xl shadow-black/50">
              <ShineBorder className="absolute inset-0 w-full h-full pointer-events-none" shineColor={["#FFCF99", "#92140C", "#FFCF99"]} duration={14} />

              <CardHeader className="p-8 pb-4 text-center border-b border-white/5">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-primary/50" />
                  <CardTitle className="uppercase tracking-[0.4em] text-[11px] font-black text-primary">Identity Access</CardTitle>
                  <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-primary/50" />
                </div>
                <CardDescription className="text-2xl font-bold text-white tracking-tight">
                  Select Your Manager Profile
                </CardDescription>
              </CardHeader>

              <CardContent className="p-8 pt-6">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-6">
                    <div className="relative pt-1">
                      <div className="w-16 h-16 border-2 border-primary/20 rounded-full border-t-primary animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-primary animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-1 text-center">
                      <p className="text-sm font-bold text-white uppercase tracking-widest animate-pulse">Syncing League Data</p>
                      <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Connecting to FPL Gateway...</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar p-1">
                    {teams.map((team) => (
                      <button
                        key={team.teamId}
                        onClick={() => setSelected(team.teamId)}
                        onMouseEnter={() => setHovered(team.teamId)}
                        onMouseLeave={() => setHovered(null)}
                        className={`
                          group relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-500 text-left
                          ${selected === team.teamId
                            ? "bg-primary/20 border-primary ring-1 ring-primary/50 shadow-[0_0_30px_rgba(var(--primary),0.2)]"
                            : "bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10"}
                        `}
                      >
                        <div className={`
                          w-12 h-12 rounded-xl flex items-center justify-center font-sports text-lg font-black italic transition-all duration-500
                          ${selected === team.teamId
                            ? "bg-primary text-primary-foreground rotate-3 scale-110 shadow-lg shadow-primary/30"
                            : "bg-white/10 text-white/40 group-hover:bg-primary/20 group-hover:text-primary group-hover:scale-105"}
                        `}>
                          {team.initials}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-base tracking-tight truncate transition-colors duration-300 ${selected === team.teamId ? "text-white" : "text-white/70"}`}>
                            {team.userName}
                          </p>
                          <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Team ID: {team.teamId}</p>
                        </div>

                        {selected === team.teamId ? (
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 animate-in zoom-in duration-300">
                            <Shield className="w-3.5 h-3.5 text-primary" />
                          </div>
                        ) : (
                          <ChevronRight className={`w-4 h-4 text-white/10 group-hover:text-primary/50 transition-all duration-300 ${hovered === team.teamId ? "translate-x-1" : ""}`} />
                        )}

                        {/* Interactive Shine Effect */}
                        <div className={`absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-opacity duration-500 pointer-events-none rounded-2xl ${hovered === team.teamId ? "opacity-100" : ""}`} />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>

              <CardFooter className="p-8 pt-0 flex flex-col gap-4">
                <ShinyButton
                  className={`w-full h-16 rounded-2xl text-lg font-black uppercase tracking-[0.2em] transition-all duration-500 ${!selected ? "opacity-30 grayscale cursor-not-allowed" : "opacity-100 scale-[1.02]"}`}
                  onClick={handleLogin}
                >
                  <span className="flex items-center justify-center gap-3">
                    Enter Data Hub
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </span>
                </ShinyButton>

                <p className="text-[10px] text-center text-white/20 uppercase tracking-[0.3em] font-black">
                  Authorized Access Only • FPL Identity Confirmed
                </p>
              </CardFooter>
            </Card>
          </div>
        </BlurFade>

        <div className="text-center space-y-4 pt-8">
          <div className="flex items-center justify-center gap-8 opacity-20 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-1000">
            <Users className="w-6 h-6 text-white" />
            <Trophy className="w-6 h-6 text-white" />
            <Shield className="w-6 h-6 text-white" />
          </div>
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">
            Powered by Sports-Grade Analytics • 2024/25
          </p>
        </div>
      </div>
    </div>
  )
}
