// Extended profile data for Elite info panels (mock, future-proof)

export interface TeamProfile {
  id: string;
  coach_name: string;
  coach_nationality: string;
  key_players: { name: string; position: string; rating: number }[];
  squad_avg_age: number;
  rotation_depth: number; // 0-100
  performance_4y: {
    win_rate: number;
    draw_rate: number;
    loss_rate: number;
    gf_pg: number;
    ga_pg: number;
    cs_rate: number;
    btts_rate: number;
    home_win: number;
    away_win: number;
  };
  press_intensity: number;
  possession_bias: number;
  transition_speed: number;
}

export interface PlayerProfile {
  id: string;
  age: number;
  preferred_foot: string;
  height: string;
  goals_total: number;
  assists_total: number;
  goals_per_game_recent: number;
  minutes_per_match: number;
  shots_per_90: number;
  xg_proxy: number;
  injury_status: "Fit" | "Doubtful" | "Out";
  last_injury: string;
  card_rate: number; // yellows per 90
  last5: { match: string; rating: number; contribution: string }[];
  role_tags: string[];
  best_used_in: string[];
}

export interface CoachProfile {
  id: string;
  age: number;
  tenure_start: string;
  formations_usage: { formation: string; pct: number }[];
  possession_score: number;
  directness_score: number;
  press_intensity: number;
  rotation_rate: number;
  when_leading: string;
  when_trailing: string;
  sub_timing: string;
  sub_aggressiveness: number;
  performance_4y: { win_rate: number; ppg: number; big_match_pct: number };
  risk_flags: string[];
}

export const teamProfiles: Record<string, TeamProfile> = {
  t1: {
    id: "t1", coach_name: "Dorival Júnior", coach_nationality: "Brazilian",
    key_players: [
      { name: "Vinícius Jr.", position: "LW", rating: 91 },
      { name: "Rodrygo", position: "RW", rating: 87 },
      { name: "Casemiro", position: "CDM", rating: 84 },
      { name: "Alisson", position: "GK", rating: 88 },
      { name: "Marquinhos", position: "CB", rating: 85 },
    ],
    squad_avg_age: 26.8, rotation_depth: 82,
    performance_4y: { win_rate: 62, draw_rate: 20, loss_rate: 18, gf_pg: 1.8, ga_pg: 0.9, cs_rate: 38, btts_rate: 52, home_win: 68, away_win: 52 },
    press_intensity: 78, possession_bias: 55, transition_speed: 90,
  },
  t2: {
    id: "t2", coach_name: "Julian Nagelsmann", coach_nationality: "German",
    key_players: [
      { name: "Jamal Musiala", position: "AM", rating: 89 },
      { name: "Florian Wirtz", position: "AM", rating: 88 },
      { name: "Kai Havertz", position: "CF", rating: 84 },
      { name: "Antonio Rüdiger", position: "CB", rating: 86 },
      { name: "Manuel Neuer", position: "GK", rating: 85 },
    ],
    squad_avg_age: 25.4, rotation_depth: 78,
    performance_4y: { win_rate: 58, draw_rate: 22, loss_rate: 20, gf_pg: 1.6, ga_pg: 1.0, cs_rate: 35, btts_rate: 55, home_win: 72, away_win: 55 },
    press_intensity: 85, possession_bias: 65, transition_speed: 72,
  },
  t3: {
    id: "t3", coach_name: "Lionel Scaloni", coach_nationality: "Argentine",
    key_players: [
      { name: "Lionel Messi", position: "RW/CF", rating: 93 },
      { name: "Julián Álvarez", position: "CF", rating: 86 },
      { name: "Enzo Fernández", position: "CM", rating: 85 },
      { name: "Emiliano Martínez", position: "GK", rating: 88 },
      { name: "Cristian Romero", position: "CB", rating: 86 },
    ],
    squad_avg_age: 27.5, rotation_depth: 75,
    performance_4y: { win_rate: 72, draw_rate: 18, loss_rate: 10, gf_pg: 2.1, ga_pg: 0.7, cs_rate: 45, btts_rate: 48, home_win: 75, away_win: 50 },
    press_intensity: 72, possession_bias: 50, transition_speed: 85,
  },
  t4: {
    id: "t4", coach_name: "Didier Deschamps", coach_nationality: "French",
    key_players: [
      { name: "Kylian Mbappé", position: "CF", rating: 92 },
      { name: "Antoine Griezmann", position: "AM", rating: 86 },
      { name: "Aurélien Tchouaméni", position: "CDM", rating: 85 },
      { name: "Mike Maignan", position: "GK", rating: 87 },
      { name: "William Saliba", position: "CB", rating: 86 },
    ],
    squad_avg_age: 26.2, rotation_depth: 90,
    performance_4y: { win_rate: 65, draw_rate: 20, loss_rate: 15, gf_pg: 1.9, ga_pg: 0.8, cs_rate: 40, btts_rate: 50, home_win: 70, away_win: 58 },
    press_intensity: 80, possession_bias: 48, transition_speed: 88,
  },
};

export const playerProfiles: Record<string, PlayerProfile> = {
  p1: {
    id: "p1", age: 25, preferred_foot: "Right", height: "176cm",
    goals_total: 98, assists_total: 72, goals_per_game_recent: 0.58, minutes_per_match: 84, shots_per_90: 3.8, xg_proxy: 0.52,
    injury_status: "Fit", last_injury: "Dec 2025 — ankle (minor)", card_rate: 0.18,
    last5: [
      { match: "vs Bolivia", rating: 8.2, contribution: "⚽" },
      { match: "vs Paraguay", rating: 7.8, contribution: "⚽" },
      { match: "vs Chile", rating: 7.1, contribution: "🅰️" },
      { match: "vs Colombia", rating: 6.5, contribution: "-" },
      { match: "vs Peru", rating: 8.5, contribution: "⚽" },
    ],
    role_tags: ["Inverted Winger", "Ball Carrier", "1v1 Specialist"],
    best_used_in: ["4-3-3 LW", "4-2-3-1 LW"],
  },
  p2: {
    id: "p2", age: 23, preferred_foot: "Right", height: "183cm",
    goals_total: 52, assists_total: 38, goals_per_game_recent: 0.45, minutes_per_match: 76, shots_per_90: 2.9, xg_proxy: 0.41,
    injury_status: "Fit", last_injury: "Oct 2025 — muscle (minor)", card_rate: 0.12,
    last5: [
      { match: "vs Japan", rating: 8.0, contribution: "⚽" },
      { match: "vs Scotland", rating: 7.5, contribution: "🅰️" },
      { match: "vs Austria", rating: 7.8, contribution: "🅰️" },
      { match: "vs Denmark", rating: 8.3, contribution: "⚽" },
      { match: "vs Netherlands", rating: 6.8, contribution: "-" },
    ],
    role_tags: ["Playmaker", "Half-Space Runner", "Press-Resistant"],
    best_used_in: ["4-2-3-1 CAM", "4-3-3 CM"],
  },
  p3: {
    id: "p3", age: 38, preferred_foot: "Left", height: "170cm",
    goals_total: 835, assists_total: 378, goals_per_game_recent: 0.62, minutes_per_match: 70, shots_per_90: 4.1, xg_proxy: 0.55,
    injury_status: "Doubtful", last_injury: "Feb 2026 — precautionary rest", card_rate: 0.08,
    last5: [
      { match: "vs Uruguay", rating: 9.1, contribution: "⚽" },
      { match: "vs Brazil", rating: 7.8, contribution: "🅰️" },
      { match: "vs Ecuador", rating: 8.5, contribution: "⚽" },
      { match: "vs Chile", rating: 8.8, contribution: "⚽" },
      { match: "vs Colombia", rating: 7.5, contribution: "🅰️" },
    ],
    role_tags: ["False 9", "Playmaker", "Free Role"],
    best_used_in: ["4-3-3 RW", "3-5-2 SS"],
  },
  p4: {
    id: "p4", age: 27, preferred_foot: "Right", height: "178cm",
    goals_total: 256, assists_total: 108, goals_per_game_recent: 0.72, minutes_per_match: 82, shots_per_90: 4.5, xg_proxy: 0.65,
    injury_status: "Fit", last_injury: "Jan 2026 — thigh (minor)", card_rate: 0.15,
    last5: [
      { match: "vs Italy", rating: 8.5, contribution: "⚽" },
      { match: "vs Belgium", rating: 6.8, contribution: "-" },
      { match: "vs Spain", rating: 8.0, contribution: "⚽" },
      { match: "vs Portugal", rating: 8.8, contribution: "⚽" },
      { match: "vs England", rating: 7.2, contribution: "🅰️" },
    ],
    role_tags: ["Target Man", "Pace Abuser", "Channel Runner"],
    best_used_in: ["4-3-3 CF", "4-2-3-1 ST"],
  },
};

export const coachProfiles: Record<string, CoachProfile> = {
  c1: {
    id: "c1", age: 62, tenure_start: "Jan 2024",
    formations_usage: [{ formation: "4-2-3-1", pct: 55 }, { formation: "4-3-3", pct: 35 }, { formation: "4-4-2", pct: 10 }],
    possession_score: 55, directness_score: 60, press_intensity: 65, rotation_rate: 45,
    when_leading: "Shifts to 4-4-2 defensive block", when_trailing: "Adds striker, moves to 4-3-3 attack",
    sub_timing: "Early (55-65')", sub_aggressiveness: 65,
    performance_4y: { win_rate: 58, ppg: 1.85, big_match_pct: 50 },
    risk_flags: ["Moderate rotation risk", "Untested at major tournament level"],
  },
  c2: {
    id: "c2", age: 38, tenure_start: "Sep 2023",
    formations_usage: [{ formation: "4-2-3-1", pct: 60 }, { formation: "3-4-2-1", pct: 25 }, { formation: "4-3-3", pct: 15 }],
    possession_score: 65, directness_score: 50, press_intensity: 82, rotation_rate: 60,
    when_leading: "Maintains shape, controls tempo", when_trailing: "Switches to 3-4-3 with overlapping wingbacks",
    sub_timing: "Strategic (60-70')", sub_aggressiveness: 72,
    performance_4y: { win_rate: 68, ppg: 2.15, big_match_pct: 65 },
    risk_flags: ["High rotation can disrupt cohesion"],
  },
  c3: {
    id: "c3", age: 47, tenure_start: "Aug 2018",
    formations_usage: [{ formation: "4-3-3", pct: 70 }, { formation: "4-4-2", pct: 20 }, { formation: "3-5-2", pct: 10 }],
    possession_score: 50, directness_score: 55, press_intensity: 60, rotation_rate: 35,
    when_leading: "Drops into 5-4-1 low block", when_trailing: "Pushes fullbacks forward, switches to 3-4-3",
    sub_timing: "Late (70'+)", sub_aggressiveness: 55,
    performance_4y: { win_rate: 78, ppg: 2.45, big_match_pct: 80 },
    risk_flags: ["Late-game conservative", "Over-reliance on core XI"],
  },
  c4: {
    id: "c4", age: 57, tenure_start: "Jul 2012",
    formations_usage: [{ formation: "4-3-3", pct: 45 }, { formation: "4-2-3-1", pct: 40 }, { formation: "3-4-3", pct: 15 }],
    possession_score: 48, directness_score: 62, press_intensity: 70, rotation_rate: 50,
    when_leading: "Compact 4-5-1 defensive shape", when_trailing: "Aggressive 3-4-3 with Mbappé central",
    sub_timing: "Conservative — late (75'+)", sub_aggressiveness: 45,
    performance_4y: { win_rate: 65, ppg: 2.05, big_match_pct: 60 },
    risk_flags: ["Discipline prone squads", "Reported tension with star forward"],
  },
};
