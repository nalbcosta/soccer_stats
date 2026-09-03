import type { GoalkeeperAttributes, OutfieldAttributes } from "./domain.js";

export interface PickupParticipant {
  id: string;
  name: string;
  source: "member" | "guest";
  outfield: OutfieldAttributes;
  /** A goalkeeper-only guest is not eligible to fill an outfield slot. */
  canPlayOutfield?: boolean;
  isGoalkeeper: boolean;
  goalkeeper?: GoalkeeperAttributes;
}

export interface PickupDrawInput {
  participants: PickupParticipant[];
  teamCount: number;
  outfieldPlayersPerTeam: number;
  goalkeepersPerTeam: number;
  seed: string | number;
}

export interface PickupDrawTeam {
  index: number;
  participants: PickupParticipant[];
  outfieldPlayers: PickupParticipant[];
  goalkeepers: PickupParticipant[];
  lineOverall: number;
  goalkeeperOverall: number | null;
  estimatedStrength: number;
  hasNaturalGoalkeeper: boolean;
  outfieldVacancies: number;
  goalkeeperVacancies: number;
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

type TeamBuckets = { goalkeepers: PickupParticipant[]; outfieldPlayers: PickupParticipant[] };

function summarize(bucket: TeamBuckets, index: number, input: Pick<PickupDrawInput, "outfieldPlayersPerTeam" | "goalkeepersPerTeam">): PickupDrawTeam {
  const lineScores = bucket.outfieldPlayers.map((participant) => calculateLineOverall(participant.outfield));
  const goalkeeperScores = bucket.goalkeepers.map((participant) => calculateGoalkeeperOverall(participant.goalkeeper));
  const goalkeeperOverall = goalkeeperScores.length ? average(goalkeeperScores) : null;
  return {
    index,
    participants: [...bucket.goalkeepers, ...bucket.outfieldPlayers],
    goalkeepers: bucket.goalkeepers,
    outfieldPlayers: bucket.outfieldPlayers,
    lineOverall: average(lineScores),
    goalkeeperOverall,
    estimatedStrength: average([...lineScores, ...goalkeeperScores]),
    hasNaturalGoalkeeper: bucket.goalkeepers.length > 0,
    outfieldVacancies: input.outfieldPlayersPerTeam - bucket.outfieldPlayers.length,
    goalkeeperVacancies: input.goalkeepersPerTeam - bucket.goalkeepers.length
  };
}

function scoreTeams(teams: PickupDrawTeam[]): number {
  const strengths = teams.map((team) => team.estimatedStrength);
  const strengthSpread = Math.max(...strengths) - Math.min(...strengths);
  const lineSpread = Math.max(...teams.map((team) => team.lineOverall)) - Math.min(...teams.map((team) => team.lineOverall));
  const goalkeeperScores = teams.map((team) => team.goalkeeperOverall ?? 0);
  const goalkeeperSpread = Math.max(...goalkeeperScores) - Math.min(...goalkeeperScores);
  const attributeSpread = outfieldKeys.reduce((total, key) => {
    const means = teams.map((team) => average(team.outfieldPlayers.map((participant) => participant.outfield[key])));
    return total + Math.max(...means) - Math.min(...means);
  }, 0);
  return goalkeeperSpread * 10_000 + strengthSpread * 100 + lineSpread * 10 + attributeSpread;
}

export function balancePickupTeams(input: PickupDrawInput): PickupDrawResult {
  if (!Number.isInteger(input.teamCount) || input.teamCount < 2) throw new Error("Informe ao menos dois times.");
  if (!Number.isInteger(input.outfieldPlayersPerTeam) || input.outfieldPlayersPerTeam < 0) throw new Error("Informe uma quantidade valida de jogadores de linha.");
  if (!Number.isInteger(input.goalkeepersPerTeam) || input.goalkeepersPerTeam < 0) throw new Error("Informe uma quantidade valida de goleiros.");
  if (input.outfieldPlayersPerTeam + input.goalkeepersPerTeam < 1) throw new Error("Cada time precisa ter ao menos um jogador.");

  const goalkeeperSlots = input.teamCount * input.goalkeepersPerTeam;
  const outfieldSlots = input.teamCount * input.outfieldPlayersPerTeam;
  const naturalGoalkeepers = input.participants.filter((participant) => participant.isGoalkeeper && participant.goalkeeper);
  const selectedGoalkeepers = naturalGoalkeepers.slice(0, goalkeeperSlots);
  const selectedGoalkeeperIds = new Set(selectedGoalkeepers.map((participant) => participant.id));
  const selectedOutfield = input.participants
    .filter((participant) => !selectedGoalkeeperIds.has(participant.id) && participant.canPlayOutfield !== false)
    .slice(0, outfieldSlots);
  const selectedIds = new Set([...selectedGoalkeepers, ...selectedOutfield].map((participant) => participant.id));
  const excluded = input.participants.filter((participant) => !selectedIds.has(participant.id));
  const seed = String(input.seed);
  const random = randomFactory(seed);
  let best: PickupDrawTeam[] | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  const selectedParticipants = selectedGoalkeepers.length + selectedOutfield.length;
  if (!selectedParticipants) throw new Error("Selecione ao menos um participante que possa ocupar uma vaga da formação.");

  for (let attempt = 0; attempt < Math.max(120, selectedParticipants * 20); attempt += 1) {
    const buckets = Array.from({ length: input.teamCount }, () => ({ goalkeepers: [], outfieldPlayers: [] } as TeamBuckets));

    for (const participant of shuffled(selectedGoalkeepers, random)) {
      const candidates = buckets
        .map((bucket, index) => ({ index, members: bucket.goalkeepers.length + bucket.outfieldPlayers.length, remaining: input.goalkeepersPerTeam - bucket.goalkeepers.length, tie: random() }))
        .filter((candidate) => candidate.remaining > 0)
        .map((candidate) => {
          const trial = buckets.map((bucket, index) => summarize(index === candidate.index ? { ...bucket, goalkeepers: [...bucket.goalkeepers, participant] } : bucket, index, input));
          return { ...candidate, score: scoreTeams(trial) };
        })
        .sort((left, right) => left.members - right.members || left.score - right.score || right.remaining - left.remaining || left.tie - right.tie);
      buckets[candidates[0]!.index]!.goalkeepers.push(participant);
    }

    for (const participant of shuffled(selectedOutfield, random)) {
      const candidates = buckets
        .map((bucket, index) => ({ index, members: bucket.goalkeepers.length + bucket.outfieldPlayers.length, remaining: input.outfieldPlayersPerTeam - bucket.outfieldPlayers.length, tie: random() }))
        .filter((candidate) => candidate.remaining > 0)
        .map((candidate) => {
          const trial = buckets.map((bucket, index) => summarize(index === candidate.index ? { ...bucket, outfieldPlayers: [...bucket.outfieldPlayers, participant] } : bucket, index, input));
          return { ...candidate, score: scoreTeams(trial) };
        })
        .sort((left, right) => left.members - right.members || left.score - right.score || right.remaining - left.remaining || left.tie - right.tie);
      buckets[candidates[0]!.index]!.outfieldPlayers.push(participant);
    }

    const summarized = buckets.map((bucket, index) => summarize(bucket, index, input));
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
