import { auth as authEn } from "./en/auth";
import { common as commonEn } from "./en/common";
import { dashboard as dashboardEn } from "./en/dashboard";
import { landing as landingEn } from "./en/landing";
import { legal as legalEn } from "./en/legal";
import { matches as matchesEn } from "./en/matches";
import { navigation as navigationEn } from "./en/navigation";
import { teams as teamsEn } from "./en/teams";
import { invites as invitesEn } from "./en/invites";
import { tournaments as tournamentsEn } from "./en/tournaments";
import { profile as profileEn } from "./en/profile";
import { settings as settingsEn } from "./en/settings";
import { stats as statsEn } from "./en/stats";
import { feedback as feedbackEn } from "./en/feedback";
import { auth as authPtBr } from "./pt-BR/auth";
import { common as commonPtBr } from "./pt-BR/common";
import { dashboard as dashboardPtBr } from "./pt-BR/dashboard";
import { landing as landingPtBr } from "./pt-BR/landing";
import { legal as legalPtBr } from "./pt-BR/legal";
import { matches as matchesPtBr } from "./pt-BR/matches";
import { navigation as navigationPtBr } from "./pt-BR/navigation";
import { teams as teamsPtBr } from "./pt-BR/teams";
import { invites as invitesPtBr } from "./pt-BR/invites";
import { tournaments as tournamentsPtBr } from "./pt-BR/tournaments";
import { profile as profilePtBr } from "./pt-BR/profile";
import { settings as settingsPtBr } from "./pt-BR/settings";
import { stats as statsPtBr } from "./pt-BR/stats";
import { feedback as feedbackPtBr } from "./pt-BR/feedback";

export const messages = {
  "pt-BR": {
    common: commonPtBr,
    auth: authPtBr,
    navigation: navigationPtBr,
    match: matchesPtBr,
    teams: teamsPtBr,
    dashboard: dashboardPtBr,
    legal: legalPtBr,
    landing: landingPtBr,
    invites: invitesPtBr,
    tournaments: tournamentsPtBr,
    profile: profilePtBr,
    settings: settingsPtBr,
    stats: statsPtBr,
    feedback: feedbackPtBr
  },
  en: {
    common: commonEn,
    auth: authEn,
    navigation: navigationEn,
    match: matchesEn,
    teams: teamsEn,
    dashboard: dashboardEn,
    legal: legalEn,
    landing: landingEn,
    invites: invitesEn,
    tournaments: tournamentsEn,
    profile: profileEn,
    settings: settingsEn,
    stats: statsEn,
    feedback: feedbackEn
  }
} as const;

export type MessageNamespace = Exclude<keyof (typeof messages)["pt-BR"], "landing">;
