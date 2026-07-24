import type { AggregatedStats, PlayerCardFactor, PlayerCardProjection, PlayerCardV2, PlayerFeatureSnapshot, PlayerInsight, PlayerProfile, RatingVersion } from "./domain.js";

export const CURRENT_RATING_VERSION: RatingVersion = "v1";
export const CURRENT_RATING_VERSION_V2: RatingVersion = "v2";

export interface PlayerCardRatings {
  ratingVersion: RatingVersion;
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
    ratingVersion: CURRENT_RATING_VERSION,
    overall,
    attack,
    pass,
    presence,
    regularity,
    winning,
    form
  };
};

const normalizePercent = (value: number): number => Math.max(0, Math.min(100, value));

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

export const buildPlayerRatingExplanation = (stats: AggregatedStats): string => {
  if (stats.matchesPlayed === 0) {
    return "Sem partidas suficientes para leitura competitiva.";
  }

  if (stats.goals + stats.assists >= stats.matchesPlayed) {
    return "Alta participacao ofensiva por jogo.";
  }

  if (stats.winRate >= 65) {
    return "Aproveitamento forte nas partidas recentes.";
  }

  if (recentFormScore(stats.form) >= 75) {
    return "Forma recente acima da media.";
  }

  return "Score equilibrado por presenca, forma e resultados.";
};

export const buildPlayerFeatureSnapshot = (
  playerId: string,
  stats: AggregatedStats,
  presenceRate = 0,
  checkInRate = 0,
  impactScore = 0,
  createdAt = new Date().toISOString()
): PlayerFeatureSnapshot => {
  const matches = Math.max(stats.matchesPlayed, 1);

  return {
    playerId,
    ratingVersion: CURRENT_RATING_VERSION,
    matchesPlayed: stats.matchesPlayed,
    goalsPerMatch: stats.goalsPerMatch,
    assistsPerMatch: Number((stats.assists / matches).toFixed(2)),
    presenceRate,
    checkInRate,
    winRate: stats.winRate,
    recentFormScore: recentFormScore(stats.form),
    impactScore,
    createdAt
  };
};

export const buildPlayerFeatureSnapshotV2 = (
  playerId: string,
  stats: AggregatedStats,
  options: {
    presenceRate?: number;
    checkInRate?: number;
    impactScore?: number;
    teamId?: string;
    tournamentId?: string;
    createdAt?: string;
  } = {}
): PlayerFeatureSnapshot => {
  const matches = Math.max(stats.matchesPlayed, 1);

  return {
    playerId,
    ratingVersion: CURRENT_RATING_VERSION_V2,
    ...(options.teamId ? { teamId: options.teamId } : {}),
    ...(options.tournamentId ? { tournamentId: options.tournamentId } : {}),
    matchesPlayed: stats.matchesPlayed,
    goalsPerMatch: stats.goalsPerMatch,
    assistsPerMatch: Number((stats.assists / matches).toFixed(2)),
    presenceRate: normalizePercent(options.presenceRate ?? 0),
    checkInRate: normalizePercent(options.checkInRate ?? 0),
    winRate: normalizePercent(stats.winRate),
    recentFormScore: recentFormScore(stats.form),
    impactScore: options.impactScore ?? 0,
    createdAt: options.createdAt ?? new Date().toISOString()
  };
};

export const buildPlayerCardV2 = (snapshot: PlayerFeatureSnapshot): PlayerCardV2 => {
  const volumeScore = normalizePercent(Math.min(snapshot.matchesPlayed, 20) * 5);
  const goalsScore = normalizePercent(Math.min(snapshot.goalsPerMatch, 2.5) * 40);
  const assistsScore = normalizePercent(Math.min(snapshot.assistsPerMatch, 2) * 50);
  const checkInScore = normalizePercent(snapshot.checkInRate ?? snapshot.presenceRate);
  const impactScore = normalizePercent(50 + (snapshot.impactScore ?? 0) * 8);
  const factors = [
    { key: "volume", label: "Volume minimo de jogos", value: volumeScore, weight: 0.12 },
    { key: "presence", label: "Presenca e check-in", value: (snapshot.presenceRate + checkInScore) / 2, weight: 0.16 },
    { key: "goals", label: "Gols por jogo", value: goalsScore, weight: 0.16 },
    { key: "assists", label: "Assistencias por jogo", value: assistsScore, weight: 0.12 },
    { key: "winning", label: "Aproveitamento", value: snapshot.winRate, weight: 0.16 },
    { key: "form", label: "Forma recente", value: snapshot.recentFormScore, weight: 0.14 },
    { key: "impact", label: "Impacto em jogos equilibrados", value: impactScore, weight: 0.14 }
  ];
  const weighted = factors.reduce((total, factor) => total + factor.value * factor.weight, 0);
  const score = clampRating(35 + weighted * 0.64);
  const topFactor = [...factors].sort((left, right) => right.value * right.weight - left.value * left.weight)[0];
  const explanation =
    snapshot.matchesPlayed < 3
      ? "Score v2 com baixa amostra: precisa de mais jogos para estabilizar."
      : `Score v2 puxado principalmente por ${topFactor?.label.toLowerCase() ?? "regularidade"}.`;

  return {
    playerId: snapshot.playerId,
    ratingVersion: "v2",
    score,
    factors,
    explanation,
    snapshot
  };
};

export const buildPlayerInsightsV2 = (card: PlayerCardV2): PlayerInsight[] => {
  const sortedFactors = [...card.factors].sort((left, right) => right.value - left.value);
  const strongest = sortedFactors[0];
  const weakest = sortedFactors[sortedFactors.length - 1];
  const insights: PlayerInsight[] = [];

  if (strongest) {
    insights.push({
      type: "strength",
      title: strongest.label,
      message: `Principal ponto forte no NaBola Card v2, com leitura ${Math.round(strongest.value)}.`,
      scoreImpact: Number((strongest.value * strongest.weight).toFixed(1))
    });
  }

  if (weakest) {
    insights.push({
      type: "opportunity",
      title: weakest.label,
      message: `Maior oportunidade de evolucao para subir o overall.`,
      scoreImpact: Number((weakest.value * weakest.weight).toFixed(1))
    });
  }

  insights.push({
    type: "trend",
    title: "Confianca da amostra",
    message: card.snapshot.matchesPlayed < 3 ? "Ainda ha poucos jogos para leitura estavel." : "A amostra ja permite comparacao mais confiavel.",
    scoreImpact: card.snapshot.matchesPlayed
  });

  return insights;
};

export function buildPlayerCardProjection(
  playerId: string,
  position: PlayerProfile["preferredPosition"],
  stats: AggregatedStats,
  context: { attendanceRate: number; checkInRate: number; impactScore: number; sourceSignature: string; updatedAt: string }
): PlayerCardProjection {
  const isGoalkeeper = position === "goalkeeper";
  const matches = Math.max(stats.matchesPlayed, 1);
  const factorValues = {
    matches: normalizePercent(Math.min(stats.matchesPlayed, 20) * 5),
    goalsPerMatch: normalizePercent(Math.min(stats.goalsPerMatch, 2.5) * 40),
    assistsPerMatch: normalizePercent(Math.min(stats.assists / matches, 2) * 50),
    saves: normalizePercent(Math.min(stats.saves / matches, 6) * (100 / 6)),
    cleanSheets: normalizePercent((stats.cleanSheets / matches) * 100),
    attendance: normalizePercent(context.attendanceRate),
    checkIn: normalizePercent(context.checkInRate),
    winRate: normalizePercent(stats.winRate),
    form: recentFormScore(stats.form),
    impact: normalizePercent(50 + context.impactScore * 8)
  };
  const weightRules: Record<"line" | "goalkeeper", Array<[PlayerCardFactor["key"], number]>> = {
    line: [["matches", 0.12], ["goalsPerMatch", 0.18], ["assistsPerMatch", 0.14], ["attendance", 0.14], ["checkIn", 0.08], ["winRate", 0.14], ["form", 0.1], ["impact", 0.1]],
    goalkeeper: [["matches", 0.14], ["saves", 0.2], ["cleanSheets", 0.16], ["attendance", 0.14], ["checkIn", 0.08], ["winRate", 0.12], ["form", 0.08], ["impact", 0.08]]
  };
  const factors = weightRules[isGoalkeeper ? "goalkeeper" : "line"].map(([key, weight]) => ({ key, weight, value: factorValues[key] }));
  const score = clampRating(35 + factors.reduce((total, factor) => total + factor.value * factor.weight, 0) * 0.64);

  return {
    playerId,
    ratingVersion: "v3",
    score,
    confidence: stats.matchesPlayed < 5 ? "forming" : "established",
    stats,
    factors,
    sourceSignature: context.sourceSignature,
    updatedAt: context.updatedAt
  };
}
