// FPL League App Types

export interface Team {
  id: string;
  name: string;
  teamId: number;
}

export interface GameweekResult {
  gameweek: number;
  teamId: string;
  points: number;
  captaincyPoints: number;
  position: number;
  isWinner: boolean;
  isSecond: boolean;
  isLast: boolean;
}

export interface TeamStats {
  teamId: string;
  teamName: string;
  gwWins: number;
  secondFinishes: number;
  lastFinishes: number;
  captaincyWins: number;
  leaderboardPosition: number;
  totalPoints: number;
  averagePoints: number;
  bestGameweek: number;
  worstGameweek: number;
}

export interface FinancialRecord {
  teamId: string;
  teamName: string;
  fplBuyIn: number; // 2000
  gwBuyIns: number; // 100 per GW
  gwWinnings: number; // from GW wins
  gwPenalties: number; // -200 for last place
  gwSecondPlace: number; // +100 for 2nd
  captaincyBuyIns: number; // 50 per GW
  captaincyWinnings: number; // from captaincy wins
  netPosition: number; // total
}

export interface GameweekFinancials {
  gameweek: number;
  gwPot: number; // 6 * 100 = 600
  captaincyPot: number; // 6 * 50 = 300
  winner: {
    teamId: string;
    teamName: string;
    points: number;
    payout: number;
  };
  second: {
    teamId: string;
    teamName: string;
    points: number;
    payout: number;
  };
  last: {
    teamId: string;
    teamName: string;
    points: number;
    penalty: number;
  };
  captaincyWinner: {
    teamId: string;
    teamName: string;
    points: number;
    payout: number;
  };
}

export interface GameweekDetail {
  gameweek: number;
  points: number;
  rank: number;
  transfers: number;
  hits: number;
  hitCost: number;
  transferDetails?: {
    playersIn: string[];
    playersOut: string[];
  };
}

export interface LeaderboardEntry {
  position: number;
  teamId: string;
  teamName: string;
  totalPoints: number;
  gwWins: number;
  secondFinishes: number;
  lastFinishes: number;
  captaincyWins: number;
  netFinancial: number;
  overallRank?: number;
  gameweekHistory?: GameweekDetail[];
}

export interface RadarChartData {
  subject: string;
  [key: string]: string | number;
}

