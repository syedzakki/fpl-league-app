"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BlurFade } from "@/components/ui/blur-fade"
import { Trophy, DollarSign, Medal, AlertCircle, Award, ArrowRightLeft, Target, Users, Calendar } from "lucide-react"
import { LEAGUE_CONFIG, TEAM_MEMBERS } from "@/lib/constants"

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-[#FFFCF2] dark:bg-[#1A1F16]">
      <div className="container mx-auto px-4 py-6">
        <BlurFade delay={0}>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#1A1F16] dark:text-[#FFFCF2] mb-2">
              League Rules - Season 25/26
            </h1>
            <p className="text-[#19297C] dark:text-[#DBC2CF]">
              Official rules and financial structure for our FPL private league
            </p>
          </div>
        </BlurFade>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Buy-Ins */}
          <BlurFade delay={0.1}>
            <Card className="bg-white dark:bg-[#1A1F16] border-[#DBC2CF] dark:border-[#19297C]">
              <CardHeader className="border-b border-[#DBC2CF] dark:border-[#19297C]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#028090]/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-[#028090]" />
                  </div>
                  <div>
                    <CardTitle className="text-[#1A1F16] dark:text-[#FFFCF2]">Buy-Ins</CardTitle>
                    <CardDescription className="text-[#19297C] dark:text-[#DBC2CF]">
                      Entry fees and weekly contributions
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#F26430]/5 border border-[#F26430]/20">
                  <div>
                    <p className="text-sm text-[#19297C] dark:text-[#DBC2CF]">FPL Entry Fee</p>
                    <p className="text-xs text-[#19297C]/70 dark:text-[#DBC2CF]/70">One-time payment</p>
                  </div>
                  <p className="text-2xl font-bold text-[#F26430]">₹{LEAGUE_CONFIG.FPL_BUY_IN.toLocaleString()}</p>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#028090]/5 border border-[#028090]/20">
                  <div>
                    <p className="text-sm text-[#19297C] dark:text-[#DBC2CF]">Gameweek Buy-In</p>
                    <p className="text-xs text-[#19297C]/70 dark:text-[#DBC2CF]/70">Per gameweek</p>
                  </div>
                  <p className="text-2xl font-bold text-[#028090]">₹{LEAGUE_CONFIG.GW_BUY_IN}</p>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#19297C]/5 border border-[#19297C]/20">
                  <div>
                    <p className="text-sm text-[#19297C] dark:text-[#DBC2CF]">Captaincy Buy-In</p>
                    <p className="text-xs text-[#19297C]/70 dark:text-[#DBC2CF]/70">Per gameweek</p>
                  </div>
                  <p className="text-2xl font-bold text-[#19297C] dark:text-[#DBC2CF]">₹{LEAGUE_CONFIG.CAPTAINCY_BUY_IN}</p>
                </div>
                
                <div className="pt-3 border-t border-[#DBC2CF] dark:border-[#19297C]">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#1A1F16] dark:text-[#FFFCF2]">Total Per Gameweek</p>
                    <p className="text-xl font-bold text-[#F26430]">
                      ₹{LEAGUE_CONFIG.GW_BUY_IN + LEAGUE_CONFIG.CAPTAINCY_BUY_IN}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </BlurFade>

          {/* Gameweek Competition */}
          <BlurFade delay={0.15}>
            <Card className="bg-white dark:bg-[#1A1F16] border-[#DBC2CF] dark:border-[#19297C]">
              <CardHeader className="border-b border-[#DBC2CF] dark:border-[#19297C]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#F7E733]/10 flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-[#F7E733]" />
                  </div>
                  <div>
                    <CardTitle className="text-[#1A1F16] dark:text-[#FFFCF2]">Gameweek Competition</CardTitle>
                    <CardDescription className="text-[#19297C] dark:text-[#DBC2CF]">
                      Weekly prizes and penalties
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="p-3 rounded-lg bg-[#4DAA57]/5 border border-[#4DAA57]/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-[#4DAA57]" />
                      <p className="text-sm font-semibold text-[#1A1F16] dark:text-[#FFFCF2]">1st Place Winner</p>
                    </div>
                    <Badge className="bg-[#4DAA57] text-white">Highest Points</Badge>
                  </div>
                  <p className="text-xs text-[#19297C] dark:text-[#DBC2CF] mb-2">
                    Receives remaining pot after 2nd place bonus and last place penalty
                  </p>
                  <p className="text-lg font-bold text-[#4DAA57]">
                    ≈ ₹{(LEAGUE_CONFIG.NUM_PLAYERS * LEAGUE_CONFIG.GW_BUY_IN - LEAGUE_CONFIG.SECOND_PLACE_BONUS + LEAGUE_CONFIG.LAST_PLACE_PENALTY).toLocaleString()}
                  </p>
                </div>
                
                <div className="p-3 rounded-lg bg-[#1BE7FF]/5 border border-[#1BE7FF]/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Medal className="h-4 w-4 text-[#1BE7FF]" />
                      <p className="text-sm font-semibold text-[#1A1F16] dark:text-[#FFFCF2]">2nd Place</p>
                    </div>
                    <Badge className="bg-[#1BE7FF] text-[#2B2D42]">Second Highest</Badge>
                  </div>
                  <p className="text-xs text-[#19297C] dark:text-[#DBC2CF] mb-2">Bonus payout</p>
                  <p className="text-lg font-bold text-[#1BE7FF]">+₹{LEAGUE_CONFIG.SECOND_PLACE_BONUS}</p>
                </div>
                
                <div className="p-3 rounded-lg bg-[#FF3A20]/5 border border-[#FF3A20]/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-[#FF3A20]" />
                      <p className="text-sm font-semibold text-[#1A1F16] dark:text-[#FFFCF2]">Last Place</p>
                    </div>
                    <Badge className="bg-[#FF3A20] text-white">Lowest Points</Badge>
                  </div>
                  <p className="text-xs text-[#19297C] dark:text-[#DBC2CF] mb-2">Penalty (added to pot)</p>
                  <p className="text-lg font-bold text-[#FF3A20]">{LEAGUE_CONFIG.LAST_PLACE_PENALTY}</p>
                </div>

                <div className="pt-3 border-t border-[#DBC2CF] dark:border-[#19297C]">
                  <div className="flex items-center gap-2 text-xs text-[#19297C] dark:text-[#DBC2CF]">
                    <Target className="h-4 w-4" />
                    <p><strong>Tie-Breaker:</strong> If points are tied, C+VC points decide the winner</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </BlurFade>

          {/* Captaincy Competition */}
          <BlurFade delay={0.2}>
            <Card className="bg-white dark:bg-[#1A1F16] border-[#DBC2CF] dark:border-[#19297C]">
              <CardHeader className="border-b border-[#DBC2CF] dark:border-[#19297C]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#F26430]/10 flex items-center justify-center">
                    <Award className="h-5 w-5 text-[#F26430]" />
                  </div>
                  <div>
                    <CardTitle className="text-[#1A1F16] dark:text-[#FFFCF2]">Captaincy Competition</CardTitle>
                    <CardDescription className="text-[#19297C] dark:text-[#DBC2CF]">
                      Captain + Vice Captain points
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="p-4 rounded-lg bg-[#F26430]/5 border border-[#F26430]/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-[#F26430]" />
                      <p className="text-base font-semibold text-[#1A1F16] dark:text-[#FFFCF2]">C+VC Winner</p>
                    </div>
                    <Badge className="bg-[#F26430] text-white">Highest C+VC</Badge>
                  </div>
                  <p className="text-sm text-[#19297C] dark:text-[#DBC2CF] mb-3">
                    Team with the highest combined Captain + Vice Captain points wins the entire captaincy pot
                  </p>
                  <p className="text-2xl font-bold text-[#F26430]">
                    ₹{(LEAGUE_CONFIG.NUM_PLAYERS * LEAGUE_CONFIG.CAPTAINCY_BUY_IN).toLocaleString()}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-xs text-[#19297C] dark:text-[#DBC2CF]">
                    <Target className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p><strong>Calculation:</strong> C+VC points = (Captain points × multiplier) + Vice Captain points</p>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-[#19297C] dark:text-[#DBC2CF]">
                    <Target className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p><strong>Tie-Breaker:</strong> If C+VC points are tied, total gameweek points decide the winner</p>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-[#19297C] dark:text-[#DBC2CF]">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p><strong>Note:</strong> This is a separate competition from the gameweek winner</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </BlurFade>

          {/* Season Prizes */}
          <BlurFade delay={0.25}>
            <Card className="bg-white dark:bg-[#1A1F16] border-[#DBC2CF] dark:border-[#19297C]">
              <CardHeader className="border-b border-[#DBC2CF] dark:border-[#19297C]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#F7E733]/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-[#F7E733]" />
                  </div>
                  <div>
                    <CardTitle className="text-[#1A1F16] dark:text-[#FFFCF2]">Season Prizes</CardTitle>
                    <CardDescription className="text-[#19297C] dark:text-[#DBC2CF]">
                      Final standings rewards
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="p-3 rounded-lg bg-[#F7E733]/10 border border-[#F7E733]/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-[#F7E733]" />
                      <p className="text-sm font-semibold text-[#1A1F16] dark:text-[#FFFCF2]">1st Place</p>
                    </div>
                    <Badge className="bg-[#F7E733] text-[#2B2D42]">Champion</Badge>
                  </div>
                  <p className="text-2xl font-bold text-[#F7E733]">₹{LEAGUE_CONFIG.PRIZE_MONEY.FIRST.toLocaleString()}</p>
                </div>
                
                <div className="p-3 rounded-lg bg-[#1BE7FF]/10 border border-[#1BE7FF]/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Medal className="h-5 w-5 text-[#1BE7FF]" />
                      <p className="text-sm font-semibold text-[#1A1F16] dark:text-[#FFFCF2]">2nd Place</p>
                    </div>
                    <Badge className="bg-[#1BE7FF] text-[#2B2D42]">Runner-up</Badge>
                  </div>
                  <p className="text-2xl font-bold text-[#1BE7FF]">₹{LEAGUE_CONFIG.PRIZE_MONEY.SECOND.toLocaleString()}</p>
                </div>
                
                <div className="p-3 rounded-lg bg-[#4DAA57]/10 border border-[#4DAA57]/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-[#4DAA57]" />
                      <p className="text-sm font-semibold text-[#1A1F16] dark:text-[#FFFCF2]">3rd Place</p>
                    </div>
                    <Badge className="bg-[#4DAA57] text-white">Third</Badge>
                  </div>
                  <p className="text-2xl font-bold text-[#4DAA57]">₹{LEAGUE_CONFIG.PRIZE_MONEY.THIRD.toLocaleString()}</p>
                </div>

                <div className="pt-3 border-t border-[#DBC2CF] dark:border-[#19297C]">
                  <div className="flex items-center gap-2 text-xs text-[#19297C] dark:text-[#DBC2CF]">
                    <AlertCircle className="h-4 w-4" />
                    <p>Paid from the initial ₹2,000 FPL buy-in pot</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </BlurFade>

          {/* Transfer Rules */}
          <BlurFade delay={0.3}>
            <Card className="bg-white dark:bg-[#1A1F16] border-[#DBC2CF] dark:border-[#19297C] lg:col-span-2">
              <CardHeader className="border-b border-[#DBC2CF] dark:border-[#19297C]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#FF3A20]/10 flex items-center justify-center">
                    <ArrowRightLeft className="h-5 w-5 text-[#FF3A20]" />
                  </div>
                  <div>
                    <CardTitle className="text-[#1A1F16] dark:text-[#FFFCF2]">Transfer Rules & Hits</CardTitle>
                    <CardDescription className="text-[#19297C] dark:text-[#DBC2CF]">
                      How hits are counted in our league
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-[#1A1F16] dark:text-[#FFFCF2]">FPL Standard Rules</h4>
                    <ul className="space-y-2 text-sm text-[#19297C] dark:text-[#DBC2CF]">
                      <li className="flex items-start gap-2">
                        <span className="text-[#028090] mt-1">•</span>
                        <span>Each team gets 1 free transfer per gameweek</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#028090] mt-1">•</span>
                        <span>Unused free transfers roll over (maximum 2)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#028090] mt-1">•</span>
                        <span>Each transfer beyond free transfers = -4 points (1 hit)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#028090] mt-1">•</span>
                        <span>Special events (e.g., AFCON) may grant additional free transfers</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-[#1A1F16] dark:text-[#FFFCF2]">Our League Calculation</h4>
                    <ul className="space-y-2 text-sm text-[#19297C] dark:text-[#DBC2CF]">
                      <li className="flex items-start gap-2">
                        <span className="text-[#F26430] mt-1">•</span>
                        <span><strong>Hits are counted for every gameweek</strong> in our financial tracking</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#F26430] mt-1">•</span>
                        <span>Hit costs displayed as: -4, -8, -12, etc.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#F26430] mt-1">•</span>
                        <span>FPL total points already include all hit deductions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#F26430] mt-1">•</span>
                        <span>We track both "points with hits" and "points without hits" for transparency</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-[#FF3A20]/5 border border-[#FF3A20]/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-[#FF3A20] flex-shrink-0 mt-0.5" />
                    <div className="space-y-2 text-sm text-[#19297C] dark:text-[#DBC2CF]">
                      <p className="font-semibold text-[#1A1F16] dark:text-[#FFFCF2]">Important Note:</p>
                      <p>All gameweek competitions use <strong>points before hits</strong> (as shown in individual GW points). Hit deductions only affect your overall FPL rank and total points, not weekly competitions.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </BlurFade>

          {/* League Members */}
          <BlurFade delay={0.35}>
            <Card className="bg-white dark:bg-[#1A1F16] border-[#DBC2CF] dark:border-[#19297C] lg:col-span-2">
              <CardHeader className="border-b border-[#DBC2CF] dark:border-[#19297C]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#19297C]/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-[#19297C] dark:text-[#DBC2CF]" />
                  </div>
                  <div>
                    <CardTitle className="text-[#1A1F16] dark:text-[#FFFCF2]">League Members</CardTitle>
                    <CardDescription className="text-[#19297C] dark:text-[#DBC2CF]">
                      {LEAGUE_CONFIG.NUM_PLAYERS} active participants in Season 25/26
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.values(TEAM_MEMBERS).map((name, index) => (
                    <div key={name} className="p-3 rounded-lg bg-[#DBC2CF]/10 dark:bg-[#19297C]/10 border border-[#DBC2CF] dark:border-[#19297C]">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-[#F26430] flex items-center justify-center text-white font-bold text-sm">
                          {name.substring(0, 2).toUpperCase()}
                        </div>
                        <p className="font-semibold text-[#1A1F16] dark:text-[#FFFCF2]">{name}</p>
                      </div>
                    </div>
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

