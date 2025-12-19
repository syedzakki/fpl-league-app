import { NextResponse } from "next/server";
import {
  fetchBootstrapData,
  fetchFixtures,
  getCurrentGameweek,
  getInjuryNews,
  getTopPlayersByForm
} from "@/lib/fpl-api";

export async function GET() {
  try {
    const [bootstrap, fixtures, gameweekInfo, injuries, topPlayers] = await Promise.all([
      fetchBootstrapData(),
      fetchFixtures(),
      getCurrentGameweek(),
      getInjuryNews(),
      getTopPlayersByForm(30),
    ]);

    if (!bootstrap) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch FPL data" },
        { status: 500 }
      );
    }

    // Get upcoming fixtures (next 3 gameweeks)
    const currentGw = gameweekInfo?.current || 1;
    // Map ALL fixtures for historical/full views
    const allFixtures = fixtures?.map((f) => {
      const homeTeam = bootstrap.teams.find((t) => t.id === f.team_h);
      const awayTeam = bootstrap.teams.find((t) => t.id === f.team_a);
      return {
        id: f.id,
        gameweek: f.event,
        homeTeam: homeTeam?.short_name || "?",
        homeTeamFull: homeTeam?.name || "?",
        awayTeam: awayTeam?.short_name || "?",
        awayTeamFull: awayTeam?.name || "?",
        kickoff: f.kickoff_time,
        finished: f.finished,
        started: f.started,
        homeScore: f.team_h_score,
        awayScore: f.team_a_score,
        homeDifficulty: f.team_h_difficulty,
        awayDifficulty: f.team_a_difficulty,
      };
    }) || [];

    // Filter for upcoming fixtures (next 3 gameweeks) for the Insights dashboard
    const upcomingFixtures = allFixtures.filter(f => f.gameweek && f.gameweek >= currentGw && f.gameweek <= currentGw + 2);

    // Get team standings/strength
    const teamStrengths = bootstrap.teams
      .map((t) => ({
        id: t.id,
        name: t.name,
        shortName: t.short_name,
        strength: t.strength,
        attackHome: t.strength_attack_home,
        attackAway: t.strength_attack_away,
        defenceHome: t.strength_defence_home,
        defenceAway: t.strength_defence_away,
      }))
      .sort((a, b) => b.strength - a.strength);

    return NextResponse.json({
      success: true,
      data: {
        gameweek: gameweekInfo,
        fixtures: allFixtures,
        upcomingFixtures,
        injuries: injuries || [],
        topPlayers: topPlayers || [],
        teamStrengths,
        events: bootstrap.events.map((e) => ({
          id: e.id,
          name: e.name,
          deadline: e.deadline_time,
          finished: e.finished,
          isCurrent: e.is_current,
          isNext: e.is_next,
          averageScore: e.average_entry_score,
          highestScore: e.highest_score,
        })),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("FPL API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}


