import { LEAGUE_CONFIG } from "./constants";
import type { GameweekResult, FinancialRecord, GameweekFinancials, TeamStats } from "./types";

export function calculateGameweekFinancials(
  gameweek: number,
  results: GameweekResult[]
): GameweekFinancials {
  const gwPot = LEAGUE_CONFIG.NUM_PLAYERS * LEAGUE_CONFIG.GW_BUY_IN;
  const captaincyPot = LEAGUE_CONFIG.NUM_PLAYERS * LEAGUE_CONFIG.CAPTAINCY_BUY_IN;

  // Sort by points descending
  const sorted = [...results].sort((a, b) => b.points - a.points);
  
  const winner = sorted[0];
  const second = sorted[1];
  const last = sorted[sorted.length - 1];

  // Sort by captaincy points
  const sortedCaptaincy = [...results].sort((a, b) => b.captaincyPoints - a.captaincyPoints);
  const captaincyWinner = sortedCaptaincy[0];

  // Calculate payouts
  // Winner gets: pot - second bonus - last penalty
  const winnerPayout = gwPot - LEAGUE_CONFIG.SECOND_PLACE_BONUS - Math.abs(LEAGUE_CONFIG.LAST_PLACE_PENALTY);
  
  return {
    gameweek,
    gwPot,
    captaincyPot,
    winner: {
      teamId: winner.teamId,
      teamName: winner.teamId, // Will be replaced with actual name
      points: winner.points,
      payout: winnerPayout,
    },
    second: {
      teamId: second.teamId,
      teamName: second.teamId,
      points: second.points,
      payout: LEAGUE_CONFIG.SECOND_PLACE_BONUS,
    },
    last: {
      teamId: last.teamId,
      teamName: last.teamId,
      points: last.points,
      penalty: LEAGUE_CONFIG.LAST_PLACE_PENALTY,
    },
    captaincyWinner: {
      teamId: captaincyWinner.teamId,
      teamName: captaincyWinner.teamId,
      points: captaincyWinner.captaincyPoints,
      payout: captaincyPot,
    },
  };
}

export function calculateTeamFinancials(
  teamId: string,
  teamName: string,
  stats: TeamStats,
  allGameweekFinancials: GameweekFinancials[]
): FinancialRecord {
  const fplBuyIn = LEAGUE_CONFIG.FPL_BUY_IN;
  
  // Count completed gameweeks (assuming all gameweeks up to current are paid)
  const completedGWs = allGameweekFinancials.length;
  const gwBuyIns = completedGWs * LEAGUE_CONFIG.GW_BUY_IN;
  const captaincyBuyIns = completedGWs * LEAGUE_CONFIG.CAPTAINCY_BUY_IN;

  // Calculate winnings
  let gwWinnings = 0;
  let gwPenalties = 0;
  let gwSecondPlace = 0;
  let captaincyWinnings = 0;

  allGameweekFinancials.forEach((gw) => {
    if (gw.winner.teamId === teamId) {
      gwWinnings += gw.winner.payout;
    }
    if (gw.second.teamId === teamId) {
      gwSecondPlace += gw.second.payout;
    }
    if (gw.last.teamId === teamId) {
      gwPenalties += Math.abs(gw.last.penalty);
    }
    if (gw.captaincyWinner.teamId === teamId) {
      captaincyWinnings += gw.captaincyWinner.payout;
    }
  });

  // Add prize money based on final position
  let prizeMoney = 0;
  if (stats.leaderboardPosition === 1) {
    prizeMoney = LEAGUE_CONFIG.PRIZE_MONEY.FIRST;
  } else if (stats.leaderboardPosition === 2) {
    prizeMoney = LEAGUE_CONFIG.PRIZE_MONEY.SECOND;
  } else if (stats.leaderboardPosition === 3) {
    prizeMoney = LEAGUE_CONFIG.PRIZE_MONEY.THIRD;
  }

  const netPosition =
    -fplBuyIn -
    gwBuyIns -
    captaincyBuyIns +
    gwWinnings +
    gwSecondPlace -
    gwPenalties +
    captaincyWinnings +
    prizeMoney;

  return {
    teamId,
    teamName,
    fplBuyIn,
    gwBuyIns,
    gwWinnings,
    gwPenalties,
    gwSecondPlace,
    captaincyBuyIns,
    captaincyWinnings,
    netPosition: netPosition + prizeMoney, // Prize money already included in calculation
  };
}


