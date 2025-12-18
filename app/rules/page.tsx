"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BlurFade } from "@/components/ui/blur-fade"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Trophy, DollarSign, Medal, AlertCircle, Award, ArrowRightLeft, Target, Users, Calendar, Crown, Shield, Wallet } from "lucide-react"
import { LEAGUE_CONFIG, TEAM_MEMBERS } from "@/lib/constants"
import { ShineBorder } from "@/components/ui/shine-border"
import { BorderBeam } from "@/components/ui/border-beam"

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <div className="container mx-auto px-4 py-8">
        <BlurFade delay={0}>
          <div className="mb-8 text-center md:text-left relative overflow-hidden p-6 rounded-2xl bg-card border border-border/50 shadow-sm">
            <ShineBorder className="absolute inset-0 w-full h-full pointer-events-none opacity-20" shineColor={["#FFCF99", "#92140C"]} duration={12} />
            <h1 className="text-4xl md:text-6xl font-sports font-bold uppercase italic tracking-tighter mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent inline-block">
              League Constitution
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl relative z-10">
              The official rulebook governing the {LEAGUE_CONFIG.SEASON} season. Financials, scoring, and conduct.
            </p>
          </div>
        </BlurFade>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Financial Structure */}
          <BlurFade delay={0.1}>
            <Card className="h-full relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm group hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                    <Wallet className="h-6 w-6" />
                  </div>
                  <CardTitle className="uppercase tracking-wider font-bold">Financials</CardTitle>
                </div>
                <CardDescription>Total buy-ins and breakdowns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                  <span className="text-sm font-medium">One-Time Entry</span>
                  <span className="font-mono text-xl font-bold text-green-500">₹{LEAGUE_CONFIG.FPL_BUY_IN.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <span className="text-sm font-medium">Weekly Buy-In</span>
                  <span className="font-mono text-xl font-bold text-primary">₹{LEAGUE_CONFIG.GW_BUY_IN}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
                  <span className="text-sm font-medium">Captaincy Pot</span>
                  <span className="font-mono text-xl font-bold text-purple-500">₹{LEAGUE_CONFIG.CAPTAINCY_BUY_IN}</span>
                </div>
                <div className="pt-4 border-t border-border/50">
                  <div className="flex justify-between items-center">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Weekly Total</span>
                    <span className="text-2xl font-black italic">₹{LEAGUE_CONFIG.GW_BUY_IN + LEAGUE_CONFIG.CAPTAINCY_BUY_IN}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </BlurFade>

          {/* Prize Distribution */}
          <BlurFade delay={0.2}>
            <Card className="h-full relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm group hover:border-yellow-500/50 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <CardTitle className="uppercase tracking-wider font-bold">Prize Pool</CardTitle>
                </div>
                <CardDescription>End of season rewards</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative p-4 rounded-xl bg-gradient-to-br from-yellow-500/20 to-transparent border border-yellow-500/20">
                  <Crown className="absolute top-2 right-2 h-12 w-12 text-yellow-500/20 rotate-12" />
                  <span className="text-xs font-bold text-yellow-500 uppercase tracking-widest block mb-1">Champion</span>
                  <span className="text-3xl font-black text-foreground">₹{LEAGUE_CONFIG.PRIZE_MONEY.FIRST.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Runner Up</span>
                    <span className="text-lg font-bold">₹{LEAGUE_CONFIG.PRIZE_MONEY.SECOND.toLocaleString()}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Third Place</span>
                    <span className="text-lg font-bold">₹{LEAGUE_CONFIG.PRIZE_MONEY.THIRD.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </BlurFade>

          {/* Gameweek Rules */}
          <BlurFade delay={0.3}>
            <Card className="h-full relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm lg:row-span-2">
              <BorderBeam size={200} duration={20} delay={5} colorFrom="#3b82f6" colorTo="#8b5cf6" />
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <CardTitle className="uppercase tracking-wider font-bold">Weekly Battles</CardTitle>
                </div>
                <CardDescription>Rules for gameweek winners</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="gw-winner">
                    <AccordionTrigger className="uppercase font-bold text-sm">Gameweek Winner</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      <p className="mb-2">Takes the pot after deductions.</p>
                      <div className="bg-muted p-2 rounded text-xs font-mono">
                        Pot = (Players × ₹{LEAGUE_CONFIG.GW_BUY_IN}) - 2nd Place Bonus + Last Penalty
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="runner-up">
                    <AccordionTrigger className="uppercase font-bold text-sm">Runner Up</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      Gets a bonus of <span className="text-green-500 font-bold">₹{LEAGUE_CONFIG.SECOND_PLACE_BONUS}</span> from the pool.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="last-place">
                    <AccordionTrigger className="uppercase font-bold text-sm text-destructive">Last Place Penalty</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      Must pay an extra <span className="text-destructive font-bold">₹{LEAGUE_CONFIG.LAST_PLACE_PENALTY}</span> into the winner's pot.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="captaincy">
                    <AccordionTrigger className="uppercase font-bold text-sm text-purple-500">Captaincy Challenge</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      <p className="mb-2">Separate pot awarded to the manager with the highest combined points from Captain + Vice Captain.</p>
                      <p className="text-xs italic opacity-70">Tie-breaker: Highest total GW score wins.</p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="mt-6 p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500 mt-1 shrink-0" />
                    <div className="text-xs text-muted-foreground">
                      <span className="font-bold text-foreground block mb-1">Tie Breaker Rule</span>
                      If total points are tied, the C+VC score determines the winner. If that is also tied, the pot is split.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </BlurFade>

          {/* Transfer Policy */}
          <BlurFade delay={0.4}>
            <Card className="h-full relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm lg:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                    <ArrowRightLeft className="h-6 w-6" />
                  </div>
                  <CardTitle className="uppercase tracking-wider font-bold">Transfer Policy</CardTitle>
                </div>
                <CardDescription>Hits and point deductions</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Standard Rules
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      1 Free Transfer per week
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Max 2 roll-over transfers
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                      -4 points per extra transfer
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                  <h4 className="font-bold mb-2 text-primary">League Specific Calculation</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    We track "Net Points" which includes all hit costs. However, for weekly competitions:
                  </p>
                  <div className="flex items-center gap-2 text-xs font-mono bg-muted p-2 rounded justify-center">
                    <Target className="h-3 w-3" />
                    WEEKLY WINNER = POINTS BEFORE HITS
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center mt-2">
                    Hits only affect your long-term Season Rank.
                  </p>
                </div>
              </CardContent>
            </Card>
          </BlurFade>

          {/* Members (Footer) */}
          <BlurFade delay={0.5}>
            <Card className="h-full relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm lg:col-span-3">
              <CardHeader>
                <CardTitle className="uppercase tracking-wider font-bold text-sm text-muted-foreground">Active Managers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Object.values(TEAM_MEMBERS).map((member) => (
                    <Badge key={member} variant="secondary" className="px-3 py-1 text-xs">
                      {member}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </BlurFade>

        </div>
      </div>
    </div>
  )
}
