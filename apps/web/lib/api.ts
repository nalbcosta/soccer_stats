import type {
  Invite,
  Match,
  MatchComment,
  MatchJoinRequest,
  Notification,
  PlayerCardProjection,
  PlayerInsight,
  PlayerProfile,
  PlayerRankingEntry,
  PublicUser,
  Team,
  TeamJoinRequest,
  TeamMessage,
  Tournament,
  Venue,
  AthleteSkillProfile,
  TeamAthlete,
  VenueChangeRequest,
  VenueReview,
  VenueChangeSet
} from "@soccer-stats/shared";

export interface UpdateProfileInput {
  displayName: string;
  shirtNumber?: number | null;
  photoUrl?: string | null;
  primaryTeamId?: string | null;
  preferredFoot: PlayerProfile["preferredFoot"];
  preferredPosition: PlayerProfile["preferredPosition"];
  bio?: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/v1";
const API_BASE_URL = API_URL.replace(/\/v1$/, "");
const mutatingMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const csrfExemptPaths = new Set(["/auth/signup", "/auth/signin", "/auth/google", "/auth/csrf"]);

let csrfTokenCache: string | null = null;

async function getCsrfToken(): Promise<string> {
  if (csrfTokenCache) {
    return csrfTokenCache;
  }

  const response = await fetch(`${API_URL}/auth/csrf`, {
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel preparar a seguranca da requisicao.");
  }

  const body = (await response.json()) as { csrfToken: string };
  csrfTokenCache = body.csrfToken;
  return body.csrfToken;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const hasJsonBody = init?.body !== undefined && !(init.body instanceof FormData);
  const method = (init?.method ?? "GET").toUpperCase();
  const csrfHeaders = mutatingMethods.has(method) && !csrfExemptPaths.has(path)
    ? { "x-csrf-token": await getCsrfToken() }
    : {};

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...(hasJsonBody ? { "Content-Type": "application/json" } : {}),
      ...csrfHeaders,
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({ message: "Erro inesperado." }))) as { message?: string };
    throw new Error(body.message ?? "Erro inesperado.");
  }

  return response.json() as Promise<T>;
}

export interface DashboardResponse {
  profile: PlayerProfile | null;
  teams: Team[];
  matches: Match[];
  tournaments: Tournament[];
  invites: Invite[];
  notifications: Notification[];
}

export interface PlayerRankingFilters {
  teamId?: string;
  tournamentId?: string;
  period?: "all" | "last-5" | "last-10";
  metric?: "overall" | "goals" | "assists" | "presence" | "winning" | "form";
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface MatchListFilters {
  scope?: "mine" | "nearby";
  q?: string;
  status?: Match["status"];
  teamId?: string;
  tournamentId?: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  page?: number;
  pageSize?: number;
}

export interface TeamListFilters {
  scope?: "mine" | "discover";
  q?: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  page?: number;
  pageSize?: number;
}

export interface VenueListFilters {
  q?: string;
  city?: string;
  state?: string;
  surface?: Venue["surface"];
  status?: Venue["status"];
  page?: number;
  pageSize?: number;
}

export interface LocationResult {
  latitude: number;
  longitude: number;
  displayName: string;
  city?: string;
  state?: string;
  country?: string;
}

function toQueryString(filters: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });

  const query = params.toString();
  return query ? `?${query}` : "";
}

export const api = {
  signUp: (input: { email: string; username: string; password: string; locale: "pt-BR" | "en" }) =>
    request<{ user: PublicUser }>("/auth/signup", { method: "POST", body: JSON.stringify(input) }),
  signIn: (input: { email: string; password: string; rememberMe?: boolean }) =>
    request<{ user: PublicUser }>("/auth/signin", { method: "POST", body: JSON.stringify(input) }),
  signInWithGoogle: (input: { credential: string; locale: "pt-BR" | "en"; rememberMe?: boolean }) =>
    request<{ user: PublicUser }>("/auth/google", { method: "POST", body: JSON.stringify(input) }),
  signOut: () => request<{ ok: true }>("/auth/signout", { method: "POST" }),
  me: () => request<{ user: PublicUser }>("/auth/me"),
  dashboard: () => request<DashboardResponse>("/dashboard"),
  getMySkills: () => request<{ skills: AthleteSkillProfile | null }>("/players/me/skills"),
  updateMySkills: (input: Pick<AthleteSkillProfile, "outfield" | "isGoalkeeper" | "goalkeeper">) =>
    request<{ skills: AthleteSkillProfile }>("/players/me/skills", { method: "PATCH", body: JSON.stringify(input) }),
  getPlayerCard: (userId: string) => request<{ card: PlayerCardProjection }>(`/players/${encodeURIComponent(userId)}/card`),
  getPlayerInsights: (userId: string) =>
    request<{ insights: PlayerInsight[] }>(`/players/${encodeURIComponent(userId)}/insights`),
  getPlayerRankings: (filters: PlayerRankingFilters = {}) =>
    request<{ players: PlayerRankingEntry[] }>(
      `/rankings/players${toQueryString({
        teamId: filters.teamId,
        tournamentId: filters.tournamentId,
        period: filters.period ?? "all",
        metric: filters.metric ?? "overall"
      })}`
    ),
  listMatches: (filters: MatchListFilters = {}) =>
    request<{ matches: Match[]; pagination?: PaginationMeta }>(
      `/matches${toQueryString({
        scope: filters.scope,
        q: filters.q,
        status: filters.status,
        teamId: filters.teamId,
        tournamentId: filters.tournamentId,
        city: filters.city,
        state: filters.state,
        latitude: filters.latitude,
        longitude: filters.longitude,
        radiusKm: filters.radiusKm,
        page: filters.page,
        pageSize: filters.pageSize
      })}`
    ),
  listTeams: (filters: TeamListFilters = {}) => request<{ teams: Team[]; pagination?: PaginationMeta }>(`/teams${toQueryString({ scope: filters.scope, q: filters.q, city: filters.city, state: filters.state, latitude: filters.latitude, longitude: filters.longitude, radiusKm: filters.radiusKm, page: filters.page, pageSize: filters.pageSize })}`),
  listTeamAthletes: (teamId: string) => request<{ athletes: TeamAthlete[]; canOrganize: boolean }>(`/teams/${encodeURIComponent(teamId)}/athletes`),
  updateTeamAthleteSkills: (teamId: string, userId: string, input: Pick<AthleteSkillProfile, "outfield" | "isGoalkeeper" | "goalkeeper">) => request(`/teams/${encodeURIComponent(teamId)}/athletes/${encodeURIComponent(userId)}/skill-override`, { method: "PUT", body: JSON.stringify(input) }),
  resetTeamAthleteSkills: (teamId: string, userId: string) => request<{ ok: true }>(`/teams/${encodeURIComponent(teamId)}/athletes/${encodeURIComponent(userId)}/skill-override`, { method: "DELETE" }),
  requestTeamJoin: (teamId: string) => request<{ request: TeamJoinRequest }>(`/teams/${encodeURIComponent(teamId)}/join-requests`, { method: "POST" }),
  listTeamJoinRequests: (teamId: string) => request<{ requests: TeamJoinRequest[] }>(`/teams/${encodeURIComponent(teamId)}/join-requests`),
  reviewTeamJoinRequest: (teamId: string, requestId: string, decision: "approve" | "reject") => request<{ request: TeamJoinRequest }>(`/teams/${encodeURIComponent(teamId)}/join-requests/${encodeURIComponent(requestId)}/${decision}`, { method: "POST" }),
  updateTeamMemberRole: (teamId: string, userId: string, role: "admin" | "captain" | "member") => request<{ team: Team }>(`/teams/${encodeURIComponent(teamId)}/members/${encodeURIComponent(userId)}/role`, { method: "PATCH", body: JSON.stringify({ role }) }),
  uploadTeamLogo: async (teamId: string, logo: File) => {
    const body = new FormData(); body.set("logo", logo);
    const response = await fetch(`${API_URL}/teams/${encodeURIComponent(teamId)}/logo`, { method: "POST", body, credentials: "include", headers: { "x-csrf-token": await getCsrfToken() } });
    if (!response.ok) { const error = await response.json().catch(() => ({ message: "Erro inesperado." })) as { message?: string }; throw new Error(error.message ?? "Erro inesperado."); }
    return response.json() as Promise<{ team: Team }>;
  },
  removeTeamLogo: (teamId: string) => request<{ team: Team }>(`/teams/${encodeURIComponent(teamId)}/logo`, { method: "DELETE" }),
  requestMatchJoin: (matchId: string) => request<{ request: MatchJoinRequest }>(`/matches/${encodeURIComponent(matchId)}/join-requests`, { method: "POST" }),
  listMatchJoinRequests: (matchId: string) => request<{ requests: MatchJoinRequest[] }>(`/matches/${encodeURIComponent(matchId)}/join-requests`),
  reviewMatchJoinRequest: (matchId: string, requestId: string, decision: "approve" | "reject", side?: "home" | "away") => request<{ request: MatchJoinRequest }>(`/matches/${encodeURIComponent(matchId)}/join-requests/${encodeURIComponent(requestId)}/${decision}`, { method: "POST", ...(side ? { body: JSON.stringify({ side }) } : {}) }),
  listTeamMessages: (teamId: string, page = 1) => request<{ messages: TeamMessage[] }>(`/teams/${encodeURIComponent(teamId)}/messages${toQueryString({ page })}`),
  sendTeamMessage: (teamId: string, text: string) => request<{ message: TeamMessage }>(`/teams/${encodeURIComponent(teamId)}/messages`, { method: "POST", body: JSON.stringify({ text }) }),
  deleteTeamMessage: (teamId: string, messageId: string) => request<{ ok: true }>(`/teams/${encodeURIComponent(teamId)}/messages/${encodeURIComponent(messageId)}`, { method: "DELETE" }),
  listMatchComments: (matchId: string, page = 1) => request<{ comments: MatchComment[] }>(`/matches/${encodeURIComponent(matchId)}/comments${toQueryString({ page })}`),
  sendMatchComment: (matchId: string, text: string) => request<{ comment: MatchComment }>(`/matches/${encodeURIComponent(matchId)}/comments`, { method: "POST", body: JSON.stringify({ text }) }),
  deleteMatchComment: (matchId: string, commentId: string) => request<{ ok: true }>(`/matches/${encodeURIComponent(matchId)}/comments/${encodeURIComponent(commentId)}`, { method: "DELETE" }),
  reverseLocation: (input: { latitude: number; longitude: number }) =>
    request<{ location: LocationResult }>(
      `/locations/reverse${toQueryString({ latitude: input.latitude, longitude: input.longitude })}`
    ),
  searchLocations: (input: { q: string; limit?: number }) =>
    request<{ locations: LocationResult[] }>(`/locations/search${toQueryString({ q: input.q, limit: input.limit })}`),
  listVenues: (filters: VenueListFilters = {}) => request<{ venues: Venue[]; pagination: PaginationMeta }>(`/venues${toQueryString({ q: filters.q, city: filters.city, state: filters.state, surface: filters.surface, status: filters.status, page: filters.page, pageSize: filters.pageSize })}`),
  getVenue: (idOrSlug: string) => request<{ venue: Venue; reviews: VenueReview[]; myReview?: VenueReview }>(`/venues/${encodeURIComponent(idOrSlug)}`),
  submitVenue: (input: { name: string; visibility?: Venue["visibility"]; address: string; postalCode: string; addressNumber: string; city: string; state: string; surface: Venue["surface"]; latitude?: number; longitude?: number; contactPhone: string; prices: NonNullable<Venue["prices"]> }) => request<{ request: VenueChangeRequest }>("/venues", { method: "POST", body: JSON.stringify(input) }),
  submitVenueChange: (input: { venueId?: string; kind: VenueChangeRequest["kind"]; changes: VenueChangeSet }) => request<{ request: VenueChangeRequest }>("/venue-change-requests", { method: "POST", body: JSON.stringify(input) }),
  submitVenueReview: (venueId: string, input: { rating: number; comment?: string }) => request<{ review: VenueReview }>(`/venues/${encodeURIComponent(venueId)}/reviews`, { method: "POST", body: JSON.stringify(input) }),
  listVenueModeration: () => request<{ requests: VenueChangeRequest[]; reviews: VenueReview[]; venues: Venue[] }>("/admin/venues/moderation"),
  moderateVenueChange: (requestId: string, decision: "approve" | "reject", reason?: string) => request<{ request: VenueChangeRequest }>(`/admin/venues/change-requests/${encodeURIComponent(requestId)}`, { method: "PATCH", body: JSON.stringify({ decision, ...(reason ? { reason } : {}) }) }),
  moderateVenueReview: (reviewId: string, decision: "approve" | "reject", reason?: string) => request<{ review: VenueReview }>(`/admin/venues/reviews/${encodeURIComponent(reviewId)}`, { method: "PATCH", body: JSON.stringify({ decision, ...(reason ? { reason } : {}) }) }),
  listNotifications: () => request<{ notifications: Notification[] }>("/notifications"),
  markNotificationRead: (notificationId: string) =>
    request<{ notification: Notification }>(`/notifications/${encodeURIComponent(notificationId)}/read`, { method: "PATCH" }),
  markAllNotificationsRead: () => request<{ ok: true }>("/notifications/read-all", { method: "POST" }),
  updateProfile: (input: UpdateProfileInput) =>
    request<{ profile: PlayerProfile }>("/players/me", { method: "PUT", body: JSON.stringify(input) }),
  uploadProfilePhoto: async (photo: File) => {
    const formData = new FormData();
    formData.set("photo", photo);

    const response = await fetch(`${API_URL}/players/me/photo`, {
      method: "POST",
      body: formData,
      credentials: "include",
      headers: {
        "x-csrf-token": await getCsrfToken()
      }
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => ({ message: "Erro inesperado." }))) as { message?: string };
      throw new Error(body.message ?? "Erro inesperado.");
    }

    return response.json() as Promise<{ profile: PlayerProfile }>;
  },
  createTeam: (input: { name: string; visibility?: Team["visibility"]; joinPolicy?: "closed" | "request"; description?: string; city?: string; state?: string; latitude?: number; longitude?: number }) => request<{ team: Team }>("/teams", { method: "POST", body: JSON.stringify(input) }),
  createInvite: (input: { resourceType: "team" | "tournament"; resourceId: string; publicIdentifier: string; role: "admin" | "captain" | "member" }) =>
    request<{ invite: Invite }>("/teams/invites", { method: "POST", body: JSON.stringify(input) }),
  createTournament: (input: { name: string; teamIds: string[] }) =>
    request<{ tournament: Tournament }>("/tournaments", { method: "POST", body: JSON.stringify(input) }),
  createMatch: (input: {
    type: "casual" | "tournament";
    home: { teamId: string; score: number; playerIds: string[] };
    away: { teamId: string; score: number; playerIds: string[] };
    tournamentId?: string;
    durationMinutes?: number;
    venueId?: string;
    venue?: Match["venue"];
    participationPolicy?: "closed" | "request";
    slotsPerSide?: number;
    playedAt: string;
  }) => request<{ match: Match }>("/matches", { method: "POST", body: JSON.stringify(input) }),
  getMatch: (matchId: string) => request<{ match: Match }>(`/matches/${encodeURIComponent(matchId)}`),
  updateMyMatchPresence: (matchId: string, input: { status: "pending" | "confirmed" | "declined" | "maybe" }) =>
    request<{ match: Match }>(`/matches/${encodeURIComponent(matchId)}/presences/me`, { method: "PUT", body: JSON.stringify(input) }),
  checkInMatch: (matchId: string) => request<{ match: Match }>(`/matches/${encodeURIComponent(matchId)}/check-in/me`, { method: "POST" }),
  completeMatch: (input: { id: string; homeScore: number; awayScore: number; durationMinutes?: number; venue?: Match["venue"]; eventLog: Match["eventLog"] }) =>
    request<{ match: Match }>("/matches/complete", { method: "POST", body: JSON.stringify(input) })
};

export function resolveApiAssetUrl(path: string) {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
