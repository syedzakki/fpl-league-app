// FPL Official API Service
import { FPL_API } from "./constants";

export interface FPLBootstrapData {
  events: FPLEvent[];
  teams: FPLTeam[];
  elements: FPLPlayer[];
  element_types: FPLPosition[];
}

export interface FPLEvent {
  id: number;
  name: string;
  deadline_time: string;
  finished: boolean;
  is_current: boolean;
  is_next: boolean;
  is_previous: boolean;
  average_entry_score: number;
  highest_score: number;
  most_selected: number;
  most_captained: number;
  top_element: number;
  chip_plays: { chip_name: string; num_played: number }[];
}

export interface FPLTeam {
  id: number;
  code: number;
  name: string;
  short_name: string;
  strength: number;
  strength_overall_home: number;
  strength_overall_away: number;
  strength_attack_home: number;
  strength_attack_away: number;
  strength_defence_home: number;
  strength_defence_away: number;
}

export interface FPLPlayer {
  id: number;
  code: number;
  first_name: string;
  second_name: string;
  web_name: string;
  team: number;
  team_code: number;
  element_type: number;
  status: string;
  news: string;
  news_added: string | null;
  chance_of_playing_next_round: number | null;
  chance_of_playing_this_round: number | null;
  now_cost: number;
  total_points: number;
  event_points: number;
  points_per_game: string;
  form: string;
  selected_by_percent: string;
  transfers_in_event: number;
  transfers_out_event: number;
  expected_goals: string;
  expected_assists: string;
  expected_goal_involvements: string;
  ict_index: string;
}

export interface FPLPosition {
  id: number;
  singular_name: string;
  singular_name_short: string;
  plural_name: string;
  plural_name_short: string;
}

export interface FPLFixture {
  id: number;
  event: number | null;
  team_h: number;
  team_a: number;
  team_h_score: number | null;
  team_a_score: number | null;
  kickoff_time: string | null;
  finished: boolean;
  started: boolean;
  minutes: number;
  provisional_start_time: boolean;
  team_h_difficulty: number;
  team_a_difficulty: number;
}

// Fetch bootstrap data (players, teams, events)
export async function fetchBootstrapData(): Promise<FPLBootstrapData | null> {
  try {
    const response = await fetch(FPL_API.BOOTSTRAP, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch bootstrap data: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching FPL bootstrap data:", error);
    return null;
  }
}

// Fetch fixtures
export async function fetchFixtures(): Promise<FPLFixture[] | null> {
  try {
    const response = await fetch(FPL_API.FIXTURES, {
      next: { revalidate: 300 },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch fixtures: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching FPL fixtures:", error);
    return null;
  }
}

// Get current gameweek
export async function getCurrentGameweek(): Promise<{
  current: number;
  finished: number;
  isLive: boolean;
} | null> {
  const data = await fetchBootstrapData();
  if (!data) return null;

  const currentEvent = data.events.find((e) => e.is_current);
  const finishedEvents = data.events.filter((e) => e.finished);
  const lastFinished = finishedEvents.length > 0 
    ? Math.max(...finishedEvents.map((e) => e.id)) 
    : 0;

  return {
    current: currentEvent?.id || lastFinished + 1,
    finished: lastFinished,
    isLive: currentEvent ? !currentEvent.finished : false,
  };
}

// Get players with injury news
export async function getInjuryNews(): Promise<{
  teamId: number;
  teamName: string;
  players: {
    id: number;
    name: string;
    news: string;
    newsAdded: string | null;
    chanceOfPlaying: number | null;
    status: string;
  }[];
}[] | null> {
  const data = await fetchBootstrapData();
  if (!data) return null;

  const teamMap = new Map(data.teams.map((t) => [t.id, t.name]));
  
  // Group players with news by team
  type PlayerWithNews = {
    id: number;
    name: string;
    news: string;
    newsAdded: string | null;
    chanceOfPlaying: number | null;
    status: string;
  };
  const injuredByTeam = new Map<number, PlayerWithNews[]>();
  
  data.elements
    .filter((p) => p.news && p.news.length > 0)
    .forEach((player) => {
      const teamPlayers = injuredByTeam.get(player.team) || [];
      teamPlayers.push({
        id: player.id,
        name: player.web_name,
        news: player.news,
        newsAdded: player.news_added,
        chanceOfPlaying: player.chance_of_playing_next_round,
        status: player.status,
      });
      injuredByTeam.set(player.team, teamPlayers);
    });

  const result = Array.from(injuredByTeam.entries())
    .map(([teamId, players]) => ({
      teamId,
      teamName: teamMap.get(teamId) || `Team ${teamId}`,
      players,
    }))
    .sort((a, b) => a.teamName.localeCompare(b.teamName));

  return result;
}

// Get upcoming fixtures for a team
export async function getTeamFixtures(teamId: number, limit: number = 5): Promise<{
  gameweek: number;
  opponent: string;
  isHome: boolean;
  difficulty: number;
  kickoff: string | null;
}[] | null> {
  const [bootstrap, fixtures] = await Promise.all([
    fetchBootstrapData(),
    fetchFixtures(),
  ]);

  if (!bootstrap || !fixtures) return null;

  const teamMap = new Map(bootstrap.teams.map((t) => [t.id, t]));
  const currentGw = bootstrap.events.find((e) => e.is_current)?.id || 1;

  return fixtures
    .filter((f) => (f.team_h === teamId || f.team_a === teamId) && f.event && f.event >= currentGw && !f.finished)
    .slice(0, limit)
    .map((f) => {
      const isHome = f.team_h === teamId;
      const opponentId = isHome ? f.team_a : f.team_h;
      const opponent = teamMap.get(opponentId);
      
      return {
        gameweek: f.event!,
        opponent: opponent?.short_name || `Team ${opponentId}`,
        isHome,
        difficulty: isHome ? f.team_h_difficulty : f.team_a_difficulty,
        kickoff: f.kickoff_time,
      };
    });
}

// Get best players by form
export async function getTopPlayersByForm(limit: number = 20): Promise<{
  id: number;
  name: string;
  team: string;
  position: string;
  form: number;
  cost: number;
  totalPoints: number;
  selectedBy: number;
  expectedGoals: number;
  expectedAssists: number;
}[] | null> {
  const data = await fetchBootstrapData();
  if (!data) return null;

  const teamMap = new Map(data.teams.map((t) => [t.id, t.short_name]));
  const positionMap = new Map(data.element_types.map((p) => [p.id, p.singular_name_short]));

  return data.elements
    .filter((p) => parseFloat(p.form) > 0)
    .sort((a, b) => parseFloat(b.form) - parseFloat(a.form))
    .slice(0, limit)
    .map((p) => ({
      id: p.id,
      name: p.web_name,
      team: teamMap.get(p.team) || `Team ${p.team}`,
      position: positionMap.get(p.element_type) || "?",
      form: parseFloat(p.form),
      cost: p.now_cost / 10,
      totalPoints: p.total_points,
      selectedBy: parseFloat(p.selected_by_percent),
      expectedGoals: parseFloat(p.expected_goals),
      expectedAssists: parseFloat(p.expected_assists),
    }));
}

