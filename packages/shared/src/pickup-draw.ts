import type { GoalkeeperAttributes, OutfieldAttributes } from "./domain.js";

export interface PickupParticipant {
  id: string;
  name: string;
  source: "member" | "guest";
  outfield: OutfieldAttributes;
  isGoalkeeper: boolean;
  goalkeeper?: GoalkeeperAttributes;
}

export interface PickupDrawInput {
  participants: PickupParticipant[];
  teamCount: number;
  squadSize: 5 | 6;
  seed: string | number;
}

export interface PickupDrawTeam {
  index: number;
  participants: PickupParticipant[];
  lineOverall: number;
  goalkeeperOverall: number | null;
  estimatedStrength: number;
  hasNaturalGoalkeeper: boolean;
}

export interface PickupDrawResult {
  teams: PickupDrawTeam[];
  excluded: PickupParticipant[];
  strengthDifference: number;
  seed: string;
}

const outfieldKeys: Array<keyof OutfieldAttributes> = ["pac", "sho", "pas", "dri", "def", "phy"];
const goalkeeperKeys: Array<keyof GoalkeeperAttributes> = ["div", "han", "kic", "ref", "spd", "pos"];

const average = (values: number[]) => values.length ? values.reduce((total, value) => total + value, 0) / values.length : 0;
export const calculateLineOverall = (attributes: OutfieldAttributes) => average(outfieldKeys.map((key) => attributes[key]));
export const calculateGoalkeeperOverall = (attributes?: GoalkeeperAttributes) => attributes ? average(goalkeeperKeys.map((key) => attributes[key])) : 0;

function hashSeed(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function randomFactory(seed: string) {
  let state = hashSeed(seed) || 1;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(values: T[], random: () => number): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target]!, result[index]!];
  }
  return result;
}

function summarize(participants: PickupParticipant[], index: number): PickupDrawTeam {
  const lineOverall = average(participants.map((participant) => calculateLineOverall(participant.outfield)));
  const goalkeeperOverall = participants
    .filter((participant) => participant.isGoalkeeper && participant.goalkeeper)
    .map((participant) => calculateGoalkeeperOverall(participant.goalkeeper))
    .sort((left, right) => right - left)[0] ?? null;
  const estimatedStrength = lineOverall + (goalkeeperOverall === null ? 0 : goalkeeperOverall / Math.max(1, participants.length));
  return {
    index,
    participants,
    lineOverall,
    goalkeeperOverall,
    estimatedStrength,
    hasNaturalGoalkeeper: goalkeeperOverall !== null
  };
}

function scoreTeams(teams: PickupDrawTeam[]): number {
  const goalkeepers = teams.map((team) => team.participants.filter((participant) => participant.isGoalkeeper).length);
  const goalkeeperCoveragePenalty = teams.filter((team) => !team.hasNaturalGoalkeeper).length;
  const goalkeeperSpread = Math.max(...goalkeepers) - Math.min(...goalkeepers);
  const strengths = teams.map((team) => team.estimatedStrength);
  const strengthSpread = Math.max(...strengths) - Math.min(...strengths);
  const attributeSpread = outfieldKeys.reduce((total, key) => {
    const means = teams.map((team) => average(team.participants.map((participant) => participant.outfield[key])));
    return total + Math.max(...means) - Math.min(...means);
  }, 0);
  return goalkeeperCoveragePenalty * 100_000 + goalkeeperSpread * 10_000 + strengthSpread * 100 + attributeSpread;
}

export function balancePickupTeams(input: PickupDrawInput): PickupDrawResult {
  if (!Number.isInteger(input.teamCount) || input.teamCount < 2) throw new Error("Informe ao menos dois times.");
  const capacity = input.teamCount * input.squadSize;
  const eligible = input.participants.slice(0, capacity);
  const excluded = input.participants.slice(capacity);
  if (eligible.length < input.teamCount) throw new Error("Nao ha participantes suficientes para formar os times.");

  const seed = String(input.seed);
  const random = randomFactory(seed);
  const baseSize = Math.floor(eligible.length / input.teamCount);
  const remainder = eligible.length % input.teamCount;
  const targetSizes = Array.from({ length: input.teamCount }, (_, index) => baseSize + (index < remainder ? 1 : 0));
  let best: PickupDrawTeam[] | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (let attempt = 0; attempt < Math.max(120, eligible.length * 20); attempt += 1) {
    const buckets = Array.from({ length: input.teamCount }, () => [] as PickupParticipant[]);
    const goalkeepers = shuffled(eligible.filter((participant) => participant.isGoalkeeper && participant.goalkeeper), random);
    const others = shuffled(eligible.filter((participant) => !goalkeepers.some((goalkeeper) => goalkeeper.id === participant.id)), random);

    goalkeepers.forEach((participant) => {
      const candidates = buckets
        .map((bucket, index) => ({ index, keeperCount: bucket.filter((item) => item.isGoalkeeper).length, remaining: targetSizes[index]! - bucket.length, tie: random() }))
        .filter((candidate) => candidate.remaining > 0)
        .sort((left, right) => left.keeperCount - right.keeperCount || right.remaining - left.remaining || left.tie - right.tie);
      const destination = candidates[0];
      if (destination) buckets[destination.index]!.push(participant);
    });

    others.forEach((participant) => {
      const candidates = buckets
        .map((bucket, index) => ({ index, remaining: targetSizes[index]! - bucket.length, tie: random() }))
        .filter((candidate) => candidate.remaining > 0)
        .map((candidate) => {
          const trial = buckets.map((bucket, index) => summarize(index === candidate.index ? [...bucket, participant] : bucket, index));
          return { ...candidate, score: scoreTeams(trial) };
        })
        .sort((left, right) => left.score - right.score || right.remaining - left.remaining || left.tie - right.tie);
      const destination = candidates[0];
      if (destination) buckets[destination.index]!.push(participant);
    });

    const summarized = buckets.map((bucket, index) => summarize(bucket, index));
    const candidateScore = scoreTeams(summarized);
    if (candidateScore < bestScore) {
      best = summarized;
      bestScore = candidateScore;
    }
  }

  const teams = best ?? [];
  const strengths = teams.map((team) => team.estimatedStrength);
  return {
    teams,
    excluded,
    strengthDifference: strengths.length ? Math.max(...strengths) - Math.min(...strengths) : 0,
    seed
  };
}
