import { NextResponse } from "next/server";
import { FPL_ELO_INSIGHTS } from "@/lib/constants";
import { fetchBootstrapData, fetchFixtures } from "@/lib/fpl-api";

interface PlayerRecommendation {
  id: number;
  name: string;
  team: string;
  position: string;
  cost: number;
  form: number;
  totalPoints: number;
  expectedPoints: number;
  fixturesDifficulty: number;
  selectedBy: number;
  recommendation: "Strong Buy" | "Buy" | "Hold" | "Sell" | "Strong Sell";
  reasons: string[];
}

export async function GET() {
  try {
    // Fetch FPL bootstrap data
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

    const teamMap = new Map(bootstrap.teams.map((t) => [t.id, t]));
    const positionMap = new Map(bootstrap.element_types.map((p) => [p.id, p.singular_name_short]));
    
    // Get current gameweek - if current GW is finished, show recommendations for next GW
    const currentEvent = bootstrap.events.find((e) => e.is_current);
    const currentGw = currentEvent?.id || 1;
    const isCurrentGwFinished = currentEvent?.finished || false;
    
    // If current GW has finished, show recommendations for the next GW
    const targetGw = isCurrentGwFinished ? currentGw + 1 : currentGw;
    const nextEvent = bootstrap.events.find((e) => e.id === targetGw);
    const displayGw = nextEvent ? targetGw : currentGw;

    // Calculate fixture difficulty for next 5 gameweeks starting from target GW
    const teamFixtureDifficulty = new Map<number, number>();
    
    bootstrap.teams.forEach((team) => {
      const teamFixtures = fixtures
        .filter((f) => (f.team_h === team.id || f.team_a === team.id) && f.event && f.event >= displayGw && f.event < displayGw + 5)
        .map((f) => f.team_h === team.id ? f.team_h_difficulty : f.team_a_difficulty);
      
      const avgDifficulty = teamFixtures.length > 0 
        ? teamFixtures.reduce((sum, d) => sum + d, 0) / teamFixtures.length 
        : 3;
      
      teamFixtureDifficulty.set(team.id, avgDifficulty);
    });

    // Generate recommendations
    const recommendations: PlayerRecommendation[] = bootstrap.elements
      .filter((p) => p.status === "a" && parseFloat(p.form) > 0)
      .map((player) => {
        const team = teamMap.get(player.team);
        const position = positionMap.get(player.element_type) || "?";
        const form = parseFloat(player.form);
        const cost = player.now_cost / 10;
        const selectedBy = parseFloat(player.selected_by_percent);
        const fixtureDifficulty = teamFixtureDifficulty.get(player.team) || 3;
        
        // Calculate expected points based on form, fixtures, and value
        const formScore = form * 2;
        const fixtureBonus = (5 - fixtureDifficulty) * 0.5;
        const valueScore = form / cost;
        const expectedPoints = formScore + fixtureBonus + valueScore;
        
        // Generate recommendation
        let recommendation: PlayerRecommendation["recommendation"] = "Hold";
        const reasons: string[] = [];
        
        // Strong Buy criteria
        if (form >= 7 && fixtureDifficulty <= 2.5 && valueScore >= 1) {
          recommendation = "Strong Buy";
          reasons.push("Excellent form");
          reasons.push("Favorable fixtures");
          reasons.push("Great value");
        }
        // Buy criteria
        else if (form >= 5 && fixtureDifficulty <= 3 && valueScore >= 0.7) {
          recommendation = "Buy";
          if (form >= 5) reasons.push("Good form");
          if (fixtureDifficulty <= 3) reasons.push("Good fixtures");
          if (valueScore >= 0.7) reasons.push("Good value");
        }
        // Sell criteria
        else if (form < 3 || fixtureDifficulty > 4) {
          recommendation = form < 2 && fixtureDifficulty > 3.5 ? "Strong Sell" : "Sell";
          if (form < 3) reasons.push("Poor form");
          if (fixtureDifficulty > 4) reasons.push("Difficult fixtures");
        }
        // Hold
        else {
          reasons.push("Steady performer");
        }

        return {
          id: player.id,
          name: player.web_name,
          team: team?.short_name || "?",
          position,
          cost,
          form,
          totalPoints: player.total_points,
          expectedPoints: Math.round(expectedPoints * 10) / 10,
          fixturesDifficulty: Math.round(fixtureDifficulty * 10) / 10,
          selectedBy,
          recommendation,
          reasons,
        };
      })
      .sort((a, b) => b.expectedPoints - a.expectedPoints);

    // Get top picks by position
    const getTopByPosition = (pos: string, count: number) =>
      recommendations
        .filter((p) => p.position === pos && (p.recommendation === "Strong Buy" || p.recommendation === "Buy"))
        .slice(0, count);

    const bestTeam = {
      goalkeepers: getTopByPosition("GKP", 2),
      defenders: getTopByPosition("DEF", 5),
      midfielders: getTopByPosition("MID", 5),
      forwards: getTopByPosition("FWD", 3),
    };

    // Differential picks (low ownership, high form)
    const differentials = recommendations
      .filter((p) => p.selectedBy < 10 && p.form >= 5 && (p.recommendation === "Strong Buy" || p.recommendation === "Buy"))
      .slice(0, 10);

    // Premium picks (high cost, high value)
    const premiums = recommendations
      .filter((p) => p.cost >= 10 && p.form >= 5)
      .slice(0, 10);

    // Budget picks (low cost, good value)
    const budgetPicks = recommendations
      .filter((p) => p.cost <= 6 && p.form >= 4)
      .sort((a, b) => (b.form / b.cost) - (a.form / a.cost))
      .slice(0, 10);

    // Captain picks
    const captainPicks = recommendations
      .filter((p) => p.form >= 6)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        currentGameweek: displayGw,
        isForNextGameweek: isCurrentGwFinished,
        recommendations: recommendations.slice(0, 50),
        bestTeam,
        differentials,
        premiums,
        budgetPicks,
        captainPicks,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Recommendations API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

