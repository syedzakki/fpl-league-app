// League Constants

export const LEAGUE_CONFIG = {
  SEASON: "2024/25",
  FPL_BUY_IN: 2000,
  GW_BUY_IN: 100,
  CAPTAINCY_BUY_IN: 50,
  LAST_PLACE_PENALTY: -200,
  SECOND_PLACE_BONUS: 100,
  NUM_PLAYERS: 6,
  PRIZE_MONEY: {
    FIRST: 6000,
    SECOND: 3500,
    THIRD: 2000,
  },
  // Dummy team to exclude from calculations
  EXCLUDED_TEAM_ID: "9388548",
  EXCLUDED_TEAM_NAME: "Dummy",
} as const;

// Team ID to User Name mapping (FPL Entry IDs)
export const TEAM_MEMBERS: Record<string, string> = {
  "6196491": "Zakki",
  "1717953": "Chiru",
  "3296482": "Wasim",
  "8805762": "Sunad",
  "4375314": "Tejas",
  "2160638": "Anuj",
} as const;

// Get user name from team ID
export const getTeamName = (teamId: string | number): string => {
  const id = String(teamId);
  return TEAM_MEMBERS[id] || `Team ${teamId}`;
};

export const GOOGLE_SHEETS_CONFIG = {
  SPREADSHEET_ID: "1VCSA0pfSLoN305EW8jPS20Iu1QxiWwG0TIAR6zTVKmw",
  SHEET_NAME: "Sheet1",
  SUMMARY_SHEET: "Summary",
  TEAM_ID_RANGE: "B3:H3",
  GW_START_ROW: 5,
  MAX_GAMEWEEKS: 38,
} as const;

// FPL API endpoints
export const FPL_API = {
  BOOTSTRAP: "https://fantasy.premierleague.com/api/bootstrap-static/",
  FIXTURES: "https://fantasy.premierleague.com/api/fixtures/",
  TEAM_ENTRY: (teamId: string) => `https://fantasy.premierleague.com/api/entry/${teamId}/`,
  TEAM_HISTORY: (teamId: string) => `https://fantasy.premierleague.com/api/entry/${teamId}/history/`,
  LIVE_EVENT: (gw: number) => `https://fantasy.premierleague.com/api/event/${gw}/live/`,
  PLAYER: (playerId: number) => `https://fantasy.premierleague.com/api/element-summary/${playerId}/`,
} as const;

// FPL Core Insights GitHub raw data URLs (Updated repository)
export const FPL_CORE_INSIGHTS = {
  BASE_URL: "https://raw.githubusercontent.com/olbauday/FPL-Core-Insights/main/data/2024-25/",
  PLAYERS: "players.csv",
  PLAYER_STATS: "playerstats.csv",
  PLAYER_MATCH_STATS: "playermatchstats.csv",
  MATCHES: "matches.csv",
  FIXTURES: "fixtures.csv",
  TEAMS: "teams.csv",
  GAMEWEEKS: "gameweeks.csv",
} as const;

// Legacy URL (kept for backwards compatibility)
export const FPL_ELO_INSIGHTS = {
  BASE_URL: "https://raw.githubusercontent.com/olbauday/FPL-Elo-Insights/main/data/",
  PLAYERS: "players.csv",
  PLAYER_STATS: "playerstats.csv",
  MATCHES: "matches.csv",
  FIXTURES: "fixtures.csv",
  TEAMS: "teams.csv",
  GAMEWEEKS: "gameweeks.csv",
} as const;

