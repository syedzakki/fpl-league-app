import { NextResponse } from "next/server";
import { fetchBootstrapData, fetchFixtures } from "@/lib/fpl-api";
import { TEAM_MEMBERS } from "@/lib/constants";

// Fetch team entry info for current gameweek points
async function fetchTeamEntry(teamId: string): Promise<{
  summary_event_points: number;
  summary_event_rank: number;
} | null> {
  try {
    const response = await fetch(
      `https://fantasy.premierleague.com/api/entry/${teamId}/`,
      { next: { revalidate: 60 } }
    );
    if (!response.ok) return null;
    const data = await response.json();
    return {
      summary_event_points: data.summary_event_points || 0,
      summary_event_rank: data.summary_event_rank || 0,
    };
  } catch (error) {
    console.error(`Error fetching team ${teamId}:`, error);
    return null;
  }
}

export async function GET() {
  try {
    const teamIds = Object.keys(TEAM_MEMBERS);
    
    // Fetch bootstrap and fixtures in parallel
    const [bootstrap, fixtures] = await Promise.all([
      fetchBootstrapData(),
      fetchFixtures(),
    ]);

    if (!bootstrap || !fixtures) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch FPL data" },
        { status: 500 }
      );
    }

    // Get current gameweek
    const currentEvent = bootstrap.events.find((e: any) => e.is_current);
    if (!currentEvent) {
      return NextResponse.json(
        { success: false, error: "No current gameweek found" },
        { status: 404 }
      );
    }

    const currentGw = currentEvent.id;
    const isLive = !currentEvent.finished;

    // Get fixtures for current gameweek
    const currentGwFixtures = fixtures
      .filter((f) => f.event === currentGw)
      .map((f) => {
        const homeTeam = bootstrap.teams.find((t) => t.id === f.team_h);
        const awayTeam = bootstrap.teams.find((t) => t.id === f.team_a);
        return {
          id: f.id,
          homeTeam: homeTeam?.short_name || "?",
          homeTeamFull: homeTeam?.name || "?",
          awayTeam: awayTeam?.short_name || "?",
          awayTeamFull: awayTeam?.name || "?",
          kickoff: f.kickoff_time,
          finished: f.finished,
          started: f.started,
          homeScore: f.team_h_score,
          awayScore: f.team_a_score,
          minutes: f.minutes,
        };
      })
      .sort((a, b) => {
        if (!a.kickoff || !b.kickoff) return 0;
        return new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime();
      });

    // Count match statuses
    const matchesFinished = currentGwFixtures.filter((f) => f.finished).length;
    const matchesOngoing = currentGwFixtures.filter((f) => f.started && !f.finished).length;
    const matchesScheduled = currentGwFixtures.filter((f) => !f.started && !f.finished).length;

    // Fetch current gameweek points for all teams
    const teamEntries = await Promise.all(
      teamIds.map((id) => fetchTeamEntry(id))
    );

    // Build team points data
    const teamPoints = teamIds.map((teamId, index) => {
      const entry = teamEntries[index];
      const userName = TEAM_MEMBERS[teamId];
      return {
        teamId,
        userName,
        points: entry?.summary_event_points || 0,
        rank: entry?.summary_event_rank || 0,
      };
    });

    // Sort by points
    teamPoints.sort((a, b) => b.points - a.points);

    // Calculate insights
    const totalPoints = teamPoints.reduce((sum, t) => sum + t.points, 0);
    const averagePoints = teamPoints.length > 0 ? Math.round(totalPoints / teamPoints.length) : 0;
    const highestScorer = teamPoints[0];
    const lowestScorer = teamPoints[teamPoints.length - 1];
    const pointsSpread = highestScorer.points - lowestScorer.points;

    return NextResponse.json({
      success: true,
      data: {
        gameweek: currentGw,
        isLive,
        deadline: currentEvent.deadline_time,
        averageScore: currentEvent.average_entry_score || 0,
        highestScore: currentEvent.highest_score || 0,
        fixtures: currentGwFixtures,
        matchStats: {
          total: currentGwFixtures.length,
          finished: matchesFinished,
          ongoing: matchesOngoing,
          scheduled: matchesScheduled,
        },
        teamPoints,
        insights: {
          averagePoints,
          highestScorer: {
            name: highestScorer.userName,
            points: highestScorer.points,
          },
          lowestScorer: {
            name: lowestScorer.userName,
            points: lowestScorer.points,
          },
          pointsSpread,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Current gameweek API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

