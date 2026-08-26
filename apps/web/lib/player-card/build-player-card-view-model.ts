import type { PlayerCardProjection, PlayerProfile, PublicUser } from "@soccer-stats/shared";
import { resolveApiAssetUrl } from "../api";

type Translate = (key: string, values?: Record<string, string | number>) => string;

const fallbackMessages: Record<string, string> = {
  positionGoalkeeper: "Goleiro", positionRightBack: "Lateral direito", positionCenterBack: "Zagueiro", positionLeftBack: "Lateral esquerdo", positionDefensiveMidfielder: "Volante", positionCentralMidfielder: "Meio-campista", positionAttackingMidfielder: "Meia ofensivo", positionRightWinger: "Ponta direita", positionLeftWinger: "Ponta esquerda", positionStriker: "Centroavante",
  cardName: "NaBola Card", cardOverall: "Overall", cardRealData: "Dados reais", cardPerformance: "Leitura de desempenho", cardMoment: "Momento", cardPhotoAlt: "Foto de {name}", cardForming: "Em formação", cardEstablished: "Histórico consolidado", cardFormingDescription: "O overall é provisório até completar cinco partidas.", cardEstablishedDescription: "Overall calculado com todo o histórico registrado.", cardMatches: "Jogos", cardWins: "Vitórias", cardGoals: "Gols", cardAssists: "Assistências", cardCleanSheets: "Clean sheets", cardNoMatches: "Ainda sem partidas registradas.", cardFactorMatches: "Volume", cardFactorGoalsPerMatch: "Gols/jogo", cardFactorAssistsPerMatch: "Assist./jogo", cardFactorSaves: "Defesas", cardFactorCleanSheets: "Clean sheets", cardFactorAttendance: "Presença", cardFactorCheckIn: "Check-in", cardFactorWinRate: "Aproveitamento", cardFactorForm: "Forma", cardFactorImpact: "Impacto"
};

export interface PlayerCardViewModel {
  identity: { name: string; username: string; teamName?: string; shirtNumber: string; position: string; positionCode: string; photoUrl?: string; photoAlt: string };
  labels: { cardName: string; position: string; realData: string; performance: string; moment: string };
  realMetrics: Array<{ key: string; label: string; value: number }>;
  attributes: Array<{ key: string; label: string; value: number }>;
  moment: { label: string; form: PlayerCardProjection["stats"]["form"] };
  factorSummary: Array<{ key: string; label: string; value: number }>;
}

const positionKeys: Record<PlayerProfile["preferredPosition"], { label: string; code: string }> = {
  goalkeeper: { label: "positionGoalkeeper", code: "GOL" }, "right-back": { label: "positionRightBack", code: "LD" },
  "center-back": { label: "positionCenterBack", code: "ZAG" }, "left-back": { label: "positionLeftBack", code: "LE" },
  "defensive-midfielder": { label: "positionDefensiveMidfielder", code: "VOL" }, "central-midfielder": { label: "positionCentralMidfielder", code: "MC" },
  "attacking-midfielder": { label: "positionAttackingMidfielder", code: "MEI" }, "right-winger": { label: "positionRightWinger", code: "PD" },
  "left-winger": { label: "positionLeftWinger", code: "PE" }, striker: { label: "positionStriker", code: "ATA" }
};

export function buildPlayerCardViewModel(profile: PlayerProfile | null, user: PublicUser, card: PlayerCardProjection | null, t: Translate = (key) => fallbackMessages[key] ?? key): PlayerCardViewModel {
  const position = positionKeys[profile?.preferredPosition ?? "striker"];
  const stats = card?.stats ?? profile?.stats;
  const isGoalkeeper = profile?.preferredPosition === "goalkeeper";
  const factorLabels: Record<PlayerCardProjection["factors"][number]["key"], string> = {
    matches: t("cardFactorMatches"), goalsPerMatch: t("cardFactorGoalsPerMatch"), assistsPerMatch: t("cardFactorAssistsPerMatch"), saves: t("cardFactorSaves"),
    cleanSheets: t("cardFactorCleanSheets"), attendance: t("cardFactorAttendance"), checkIn: t("cardFactorCheckIn"), winRate: t("cardFactorWinRate"), form: t("cardFactorForm"), impact: t("cardFactorImpact")
  };
  const factors = card?.factors ?? [];

  return {
    identity: {
      name: profile?.displayName ?? user.username,
      username: user.username,
      ...(profile?.teamName ? { teamName: profile.teamName } : {}),
      shirtNumber: profile?.shirtNumber ? `#${String(profile.shirtNumber).padStart(2, "0")}` : "#--",
      position: t(position.label),
      positionCode: position.code,
      ...(profile?.photoUrl ? { photoUrl: resolveApiAssetUrl(profile.photoUrl) } : {}),
      photoAlt: t("cardPhotoAlt", { name: profile?.displayName ?? user.username })
    },
    labels: { cardName: t("cardName"), position: t("preferredPosition"), realData: t("cardRealData"), performance: t("cardPerformance"), moment: t("cardMoment") },
    realMetrics: stats ? [
      { key: "matches", label: t("cardMatches"), value: stats.matchesPlayed }, { key: "wins", label: t("cardWins"), value: stats.wins },
      { key: "goals", label: t("cardGoals"), value: stats.goals }, { key: isGoalkeeper ? "clean-sheets" : "assists", label: isGoalkeeper ? t("cardCleanSheets") : t("cardAssists"), value: isGoalkeeper ? stats.cleanSheets : stats.assists }
    ] : [],
    attributes: [...factors].sort((left, right) => right.value * right.weight - left.value * left.weight).slice(0, 4).map((factor) => ({ key: factor.key, label: factorLabels[factor.key], value: Math.round(factor.value) })),
    moment: { label: stats?.recentHighlight ?? t("cardNoMatches"), form: stats?.form ?? [] },
    factorSummary: [...factors].sort((left, right) => right.value * right.weight - left.value * left.weight).slice(0, 2).map((factor) => ({ key: factor.key, label: factorLabels[factor.key], value: Math.round(factor.value) }))
  };
}
