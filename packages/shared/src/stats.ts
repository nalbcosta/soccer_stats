import type { AggregatedStats } from "./domain";

export interface PlayerCardRatings {
  overall: number;
  attack: number;
  pass: number;
  presence: number;
  regularity: number;
  winning: number;
  form: number;
}

export interface PerformanceMetrics {
  offensiveContribution: number;
  consistency: number;
  pointsPerMatch: number;
  resultBalance: number;
}

export const createEmptyStats = (): AggregatedStats => ({
  matchesPlayed: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  goals: 0,
  assists: 0,
  saves: 0,
  cleanSheets: 0,
  goalDifference: 0,
  points: 0,
  winRate: 0,
  goalsPerMatch: 0,
  form: [],
  recentHighlight: "Ainda sem partidas registradas."
});

export const withDerivedStats = (stats: AggregatedStats): AggregatedStats => {
  const winRate = stats.matchesPlayed === 0 ? 0 : Number(((stats.wins / stats.matchesPlayed) * 100).toFixed(1));
  const goalsPerMatch = stats.matchesPlayed === 0 ? 0 : Number((stats.goals / stats.matchesPlayed).toFixed(2));

  return {
    ...stats,
    winRate,
    goalsPerMatch
  };
};

export const buildRecentHighlight = (stats: AggregatedStats): string => {
  if (stats.matchesPlayed === 0) {
    return "Ainda sem partidas registradas.";
  }

  if (stats.form.slice(-3).every((result) => result === "W") && stats.form.length >= 3) {
    return "Vem de 3 vitorias seguidas.";
  }

  if (stats.goalsPerMatch >= 2) {
    return "Ataque em grande fase.";
  }

  if (stats.winRate >= 60) {
    return "Fase consistente e acima da media.";
  }

  return "Em busca de regularidade.";
};

const clampRating = (value: number): number => Math.max(35, Math.min(99, Math.round(value)));

const recentFormScore = (form: AggregatedStats["form"]): number => {
  const recent = form.slice(-5);

  if (recent.length === 0) {
    return 45;
  }

  const points = recent.reduce((total, result) => {
    if (result === "W") {
      return total + 3;
    }

    if (result === "D") {
      return total + 1;
    }

    return total;
  }, 0);

  return clampRating(40 + (points / (recent.length * 3)) * 55);
};

export const buildPlayerCardRatings = (stats: AggregatedStats): PlayerCardRatings => {
  const matchExperience = Math.min(stats.matchesPlayed, 30) / 30;
  const assistsPerMatch = stats.assists / Math.max(stats.matchesPlayed, 1);
  const attack = clampRating(42 + Math.min(stats.goalsPerMatch, 2.5) * 17 + matchExperience * 15);
  const pass = clampRating(42 + Math.min(assistsPerMatch, 2) * 20 + matchExperience * 12);
  const presence = clampRating(45 + matchExperience * 50);
  const regularity = clampRating(44 + Math.min(stats.matchesPlayed, 20) * 1.6 + Math.max(0, stats.goalDifference) * 0.8);
  const winning = clampRating(40 + stats.winRate * 0.55);
  const form = recentFormScore(stats.form);
  const overall = clampRating(attack * 0.2 + pass * 0.14 + presence * 0.18 + regularity * 0.16 + winning * 0.18 + form * 0.14);

  return {
    overall,
    attack,
    pass,
    presence,
    regularity,
    winning,
    form
  };
};

export const buildPerformanceMetrics = (stats: AggregatedStats): PerformanceMetrics => {
  const matches = Math.max(stats.matchesPlayed, 1);
  const offensiveContribution = Number(((stats.goals + stats.assists) / matches).toFixed(2));
  const pointsPerMatch = Number((stats.points / matches).toFixed(2));
  const resultBalance = stats.wins - stats.losses;
  const consistency = clampRating(stats.winRate * 0.65 + recentFormScore(stats.form) * 0.35);

  return {
    offensiveContribution,
    consistency,
    pointsPerMatch,
    resultBalance
  };
};
