
export interface PlayerStats {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
}

export interface Player {
  id: string;
  name: string;
  phone?: string;
  wechatId?: string;
  position: string;
  teamId: string;
  stats: PlayerStats;
  overall: number;
  goals: number;
  assists: number;
  imageUrl?: string;
  description?: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  logo: string;
  teamImageUrl?: string; // New field for team specific image
  players: Player[];
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  date: string;
  time: string;
  location: string;
  status: 'upcoming' | 'live' | 'finished';
  score?: { home: number; away: number };
}

export type ViewState = 'landing' | 'register' | 'teams' | 'table' | 'fixtures' | 'gallery' | 'rules' | 'admin' | 'stats' | 'about';
