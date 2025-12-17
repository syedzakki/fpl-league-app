// CSV Parser for Google Sheets data
// Handles tie-breaking rules:
// 1. GW Winner: Highest points → If tied, highest C+VC → If still tied, highest bench score
// 2. Same logic applies for 2nd place and last place determinations

import { LEAGUE_CONFIG } from "./constants";

export interface TeamGameweekData {
  teamId: string;
  points: number;
  captaincyPoints: number;
  benchPoints: number; // New: for tie-breaking
}

export interface ParsedSheetData {
  summary: Array<{
    userName: string;
    gwWins: number;
    secondFinishes: number;
    lastFinishes: number;
    captaincyWins: number;
    leaderboardPos: number;
    totalPoints: number;
  }>;
  gameweekData: Array<{
    gameweek: number;
    teams: TeamGameweekData[];
    // Debug info for verifying calculations
    winner?: { teamId: string; reason: string };
    second?: { teamId: string; reason: string };
    last?: { teamId: string; reason: string };
    captaincyWinner?: { teamId: string; reason: string };
  }>;
  teamIds: string[];
  teamNames: Record<string, string>;
  completedGameweeks: number;
}

/**
 * Tie-breaking comparison function
 * Returns negative if a should rank higher, positive if b should rank higher, 0 if truly tied
 * Order: points → captaincyPoints → benchPoints
 */
function compareTeamsForRanking(a: TeamGameweekData, b: TeamGameweekData): number {
  // First: Compare by points
  if (b.points !== a.points) {
    return b.points - a.points;
  }
  
  // Second: If points tied, compare by captaincy (C+VC)
  if (b.captaincyPoints !== a.captaincyPoints) {
    return b.captaincyPoints - a.captaincyPoints;
  }
  
  // Third: If captaincy also tied, compare by bench points
  if (b.benchPoints !== a.benchPoints) {
    return b.benchPoints - a.benchPoints;
  }
  
  // Truly tied - rare edge case
  return 0;
}

/**
 * Determine the tie-break reason for a ranking decision
 */
function getTieBreakReason(
  winner: TeamGameweekData, 
  runnerUp: TeamGameweekData | undefined,
  teamNames: Record<string, string>
): string {
  if (!runnerUp) return "Only participant";
  
  const winnerName = teamNames[winner.teamId] || winner.teamId;
  const runnerUpName = teamNames[runnerUp.teamId] || runnerUp.teamId;
  
  if (winner.points > runnerUp.points) {
    return `${winnerName} won by points (${winner.points} vs ${runnerUp.points})`;
  }
  
  if (winner.points === runnerUp.points) {
    if (winner.captaincyPoints > runnerUp.captaincyPoints) {
      return `Tied on points (${winner.points}), ${winnerName} won on C+VC (${winner.captaincyPoints} vs ${runnerUp.captaincyPoints})`;
    }
    
    if (winner.captaincyPoints === runnerUp.captaincyPoints) {
      if (winner.benchPoints > runnerUp.benchPoints) {
        return `Tied on points & C+VC, ${winnerName} won on bench (${winner.benchPoints} vs ${runnerUp.benchPoints})`;
      }
      
      if (winner.benchPoints === runnerUp.benchPoints) {
        return `COMPLETE TIE: ${winnerName} & ${runnerUpName} (${winner.points} pts, ${winner.captaincyPoints} C+VC, ${winner.benchPoints} bench)`;
      }
    }
  }
  
  return `${winnerName} won`;
}

export function parseCSV(csvText: string): ParsedSheetData {
  const lines = csvText.split("\n").filter(line => line.trim());
  
  if (lines.length < 5) {
    return {
      summary: [],
      gameweekData: [],
      teamIds: [],
      teamNames: {},
      completedGameweeks: 0,
    };
  }

  // Parse team IDs from row 3 (index 2) - "team_id => | 6196491 | 1717953 | ..."
  const teamIdRow = lines[2]?.split(",") || [];
  const allTeamIds: string[] = [];
  const teamNames: Record<string, string> = {};
  
  // Skip first column, extract team IDs
  for (let i = 1; i < teamIdRow.length && i <= 7; i++) {
    const id = teamIdRow[i]?.trim();
    if (id && !isNaN(Number(id))) {
      allTeamIds.push(id);
    }
  }

  // Parse team names from row 4 (index 3) - "Gameweek | Zakki | Chiru | ..."
  const teamNameRow = lines[3]?.split(",") || [];
  for (let i = 1; i < teamNameRow.length && i <= allTeamIds.length; i++) {
    const name = teamNameRow[i]?.trim();
    if (name && allTeamIds[i - 1]) {
      teamNames[allTeamIds[i - 1]] = name;
    }
  }

  // Filter out excluded team (Dummy)
  const teamIds = allTeamIds.filter(id => 
    id !== LEAGUE_CONFIG.EXCLUDED_TEAM_ID && 
    teamNames[id]?.toLowerCase() !== LEAGUE_CONFIG.EXCLUDED_TEAM_NAME.toLowerCase()
  );

  // Parse gameweek data starting from row 5 (index 4)
  const gameweekData: ParsedSheetData["gameweekData"] = [];
  let completedGameweeks = 0;
  
  for (let rowIdx = 4; rowIdx < lines.length; rowIdx++) {
    const row = lines[rowIdx].split(",");
    const gwLabel = row[0]?.trim();
    
    // Check if this is a gameweek row (GW1, GW2, etc.)
    if (!gwLabel || !gwLabel.match(/^GW\d+$/i)) {
      // Check if we hit the "Total" row
      if (gwLabel?.toLowerCase() === "total") {
        break;
      }
      continue;
    }

    const gameweek = parseInt(gwLabel.replace(/^GW/i, ""), 10);
    if (isNaN(gameweek)) continue;

    const teams: TeamGameweekData[] = [];
    let hasPoints = false;
    
    // Parse points for each team (columns 1-7 for left table)
    for (let colIdx = 1; colIdx <= allTeamIds.length && colIdx < row.length; colIdx++) {
      const pointsStr = row[colIdx]?.trim();
      const points = pointsStr ? parseFloat(pointsStr) : 0;
      const teamId = allTeamIds[colIdx - 1];
      
      // Skip excluded team
      if (teamId === LEAGUE_CONFIG.EXCLUDED_TEAM_ID || 
          teamNames[teamId]?.toLowerCase() === LEAGUE_CONFIG.EXCLUDED_TEAM_NAME.toLowerCase()) {
        continue;
      }
      
      if (teamId) {
        teams.push({
          teamId,
          points: isNaN(points) ? 0 : points,
          captaincyPoints: 0,
          benchPoints: 0, // Will be parsed if available
        });
        if (points > 0) hasPoints = true;
      }
    }

    // Parse captaincy points from right table (columns 10-16, index 9-15)
    // Sheet structure: Col 1-7 = points, Col 8-9 = separator, Col 10-16 = captaincy
    if (row.length > 10) {
      for (let colIdx = 10; colIdx < row.length && colIdx <= 16; colIdx++) {
        const originalTeamId = allTeamIds[colIdx - 10];
        
        // Skip excluded team
        if (originalTeamId === LEAGUE_CONFIG.EXCLUDED_TEAM_ID ||
            teamNames[originalTeamId]?.toLowerCase() === LEAGUE_CONFIG.EXCLUDED_TEAM_NAME.toLowerCase()) {
          continue;
        }
        
        const capPointsStr = row[colIdx]?.trim();
        const capPoints = capPointsStr ? parseFloat(capPointsStr) : 0;
        
        // Find the corresponding team in our filtered teams array
        const team = teams.find(t => t.teamId === originalTeamId);
        if (team && !isNaN(capPoints)) {
          team.captaincyPoints = capPoints;
        }
      }
    }

    // Parse bench points if available (columns 18-24, index 17-23)
    // This is optional - only if your sheet has bench data
    if (row.length > 18) {
      for (let colIdx = 18; colIdx < row.length && colIdx <= 24; colIdx++) {
        const originalTeamId = allTeamIds[colIdx - 18];
        
        if (originalTeamId === LEAGUE_CONFIG.EXCLUDED_TEAM_ID ||
            teamNames[originalTeamId]?.toLowerCase() === LEAGUE_CONFIG.EXCLUDED_TEAM_NAME.toLowerCase()) {
          continue;
        }
        
        const benchPointsStr = row[colIdx]?.trim();
        const benchPoints = benchPointsStr ? parseFloat(benchPointsStr) : 0;
        
        const team = teams.find(t => t.teamId === originalTeamId);
        if (team && !isNaN(benchPoints)) {
          team.benchPoints = benchPoints;
        }
      }
    }

    if (teams.length > 0) {
      gameweekData.push({ gameweek, teams });
      // Only count as completed if there are actual points
      if (hasPoints) {
        completedGameweeks = gameweek;
      }
    }
  }

  // Filter gameweekData to only include completed gameweeks
  const completedGameweekData = gameweekData.filter(gw => {
    const totalPoints = gw.teams.reduce((sum, t) => sum + t.points, 0);
    return totalPoints > 0;
  });

  // Calculate summary from completed gameweek data with proper tie-breaking
  const teamStats: Record<string, {
    gwWins: number;
    secondFinishes: number;
    lastFinishes: number;
    captaincyWins: number;
    totalPoints: number;
    points: number[];
  }> = {};

  teamIds.forEach(id => {
    teamStats[id] = {
      gwWins: 0,
      secondFinishes: 0,
      lastFinishes: 0,
      captaincyWins: 0,
      totalPoints: 0,
      points: [],
    };
  });

  // Process each completed gameweek with tie-breaking
  completedGameweekData.forEach((gw, gwIndex) => {
    // Filter out teams with 0 points (likely incomplete data)
    const activeTeams = gw.teams.filter(t => t.points > 0);
    if (activeTeams.length === 0) return;

    // Sort teams using comprehensive tie-breaking
    const sorted = [...activeTeams].sort(compareTeamsForRanking);
    
    // Accumulate total points for all teams
    sorted.forEach((team) => {
      const stats = teamStats[team.teamId];
      if (!stats) return;
      stats.points.push(team.points);
      stats.totalPoints += team.points;
    });

    if (sorted.length > 0) {
      // FIRST PLACE: Winner is the first after sorting (handles all tie-breaks)
      const winner = sorted[0];
      const runnerUp = sorted[1];
      
      if (winner && teamStats[winner.teamId]) {
        teamStats[winner.teamId].gwWins++;
        
        // Add debug info to gameweek data
        completedGameweekData[gwIndex].winner = {
          teamId: winner.teamId,
          reason: getTieBreakReason(winner, runnerUp, teamNames)
        };
      }
      
      // SECOND PLACE: Second in sorted order (if different from winner on some criteria)
      if (sorted.length > 1) {
        const second = sorted[1];
        const third = sorted[2];
        
        // Only award 2nd place if they're actually behind the winner
        // (Check if comparison shows they're truly 2nd, not tied for 1st)
        if (second && compareTeamsForRanking(winner, second) !== 0) {
          if (teamStats[second.teamId]) {
            teamStats[second.teamId].secondFinishes++;
            
            completedGameweekData[gwIndex].second = {
              teamId: second.teamId,
              reason: getTieBreakReason(second, third, teamNames)
            };
          }
        }
      }
      
      // LAST PLACE: Last in sorted order (but not if they're the winner - handles 1-team edge case)
      if (sorted.length > 1) {
        const last = sorted[sorted.length - 1];
        const secondLast = sorted[sorted.length - 2];
        
        // Only award last place if they're actually behind everyone
        if (last && compareTeamsForRanking(secondLast, last) !== 0) {
          // Make sure last place isn't also the winner (edge case)
          if (last.teamId !== winner.teamId && teamStats[last.teamId]) {
            teamStats[last.teamId].lastFinishes++;
            
            completedGameweekData[gwIndex].last = {
              teamId: last.teamId,
              reason: `Last place: ${teamNames[last.teamId] || last.teamId} (${last.points} pts)`
            };
          }
        }
      }
    }

    // CAPTAINCY WINNER: Separate competition based on C+VC points
    const teamsWithCaptaincy = activeTeams.filter(t => t.captaincyPoints > 0);
    if (teamsWithCaptaincy.length > 0) {
      // Sort by captaincy points only for this competition
      const sortedCap = [...teamsWithCaptaincy].sort((a, b) => {
        if (b.captaincyPoints !== a.captaincyPoints) {
          return b.captaincyPoints - a.captaincyPoints;
        }
        // If C+VC tied, use total points as tie-breaker for captaincy
        return b.points - a.points;
      });
      
      const capWinner = sortedCap[0];
      const capRunnerUp = sortedCap[1];
      
      if (capWinner && teamStats[capWinner.teamId]) {
        // Only one winner for captaincy (first after tie-breaking)
        teamStats[capWinner.teamId].captaincyWins++;
        
        let reason = `${teamNames[capWinner.teamId]} won with ${capWinner.captaincyPoints} C+VC pts`;
        if (capRunnerUp && capWinner.captaincyPoints === capRunnerUp.captaincyPoints) {
          reason = `Tied on C+VC (${capWinner.captaincyPoints}), ${teamNames[capWinner.teamId]} won on total points`;
        }
        
        completedGameweekData[gwIndex].captaincyWinner = {
          teamId: capWinner.teamId,
          reason
        };
      }
    }
  });

  // Build summary array (excluding Dummy)
  const summaryArray = teamIds.map((id) => {
    const stats = teamStats[id];
    
    return {
      userName: teamNames[id] || `Team ${id}`,
      gwWins: stats.gwWins,
      secondFinishes: stats.secondFinishes,
      lastFinishes: stats.lastFinishes,
      captaincyWins: stats.captaincyWins,
      leaderboardPos: 0,
      totalPoints: stats.totalPoints,
    };
  });

  // Calculate leaderboard positions (also with tie-breaking for display)
  summaryArray.sort((a, b) => {
    // Primary: Total points
    if (b.totalPoints !== a.totalPoints) {
      return b.totalPoints - a.totalPoints;
    }
    // Secondary: GW wins
    if (b.gwWins !== a.gwWins) {
      return b.gwWins - a.gwWins;
    }
    // Tertiary: Captaincy wins
    return b.captaincyWins - a.captaincyWins;
  });
  
  summaryArray.forEach((entry, idx) => {
    entry.leaderboardPos = idx + 1;
  });

  return {
    summary: summaryArray,
    gameweekData: completedGameweekData,
    teamIds,
    teamNames,
    completedGameweeks,
  };
}

/**
 * Utility function to analyze a specific gameweek for debugging
 */
export function analyzeGameweek(gw: ParsedSheetData["gameweekData"][0], teamNames: Record<string, string>): string[] {
  const logs: string[] = [];
  const sorted = [...gw.teams].sort(compareTeamsForRanking);
  
  logs.push(`=== Gameweek ${gw.gameweek} Analysis ===`);
  logs.push("");
  logs.push("Rankings after tie-breaking:");
  
  sorted.forEach((team, idx) => {
    const name = teamNames[team.teamId] || team.teamId;
    logs.push(`${idx + 1}. ${name}: ${team.points} pts | C+VC: ${team.captaincyPoints} | Bench: ${team.benchPoints}`);
  });
  
  logs.push("");
  
  if (gw.winner) {
    logs.push(`🏆 GW Winner: ${teamNames[gw.winner.teamId]} - ${gw.winner.reason}`);
  }
  if (gw.second) {
    logs.push(`🥈 2nd Place: ${teamNames[gw.second.teamId]} - ${gw.second.reason}`);
  }
  if (gw.last) {
    logs.push(`💀 Last Place: ${teamNames[gw.last.teamId]} - ${gw.last.reason}`);
  }
  if (gw.captaincyWinner) {
    logs.push(`👑 Captaincy Winner: ${teamNames[gw.captaincyWinner.teamId]} - ${gw.captaincyWinner.reason}`);
  }
  
  return logs;
}
