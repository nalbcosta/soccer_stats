import type {
  Invite,
  Match,
  PlayerProfile,
  PublicUser,
  Team,
  Tournament
} from "@soccer-stats/shared";

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
}

export const api = {
  signUp: (input: { email: string; username: string; password: string; locale: "pt-BR" | "en" }) =>
    request<{ user: PublicUser }>("/auth/signup", { method: "POST", body: JSON.stringify(input) }),
  signIn: (input: { email: string; password: string; rememberMe?: boolean }) =>
    request<{ user: PublicUser }>("/auth/signin", { method: "POST", body: JSON.stringify(input) }),
  checkUsernameAvailability: (username: string) =>
    request<{ available: boolean; message: string }>(`/auth/username-availability?username=${encodeURIComponent(username)}`),
  signInWithGoogle: (input: { credential: string; locale: "pt-BR" | "en"; rememberMe?: boolean }) =>
    request<{ user: PublicUser }>("/auth/google", { method: "POST", body: JSON.stringify(input) }),
  signOut: () => request<{ ok: true }>("/auth/signout", { method: "POST" }),
  me: () => request<{ user: PublicUser }>("/auth/me"),
  dashboard: () => request<DashboardResponse>("/dashboard"),
  updateProfile: (input: Partial<Pick<PlayerProfile, "displayName" | "shirtNumber" | "photoUrl" | "teamName" | "preferredFoot" | "preferredPosition" | "bio">>) =>
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
  createTeam: (input: { name: string }) => request<{ team: Team }>("/teams", { method: "POST", body: JSON.stringify(input) }),
  createInvite: (input: { resourceType: "team" | "tournament"; resourceId: string; email: string; role: "admin" | "member" }) =>
    request<{ invite: Invite }>("/teams/invites", { method: "POST", body: JSON.stringify(input) }),
  createTournament: (input: { name: string; teamIds: string[] }) =>
    request<{ tournament: Tournament }>("/tournaments", { method: "POST", body: JSON.stringify(input) }),
  createMatch: (input: {
    type: "casual" | "tournament";
    home: { teamId: string; score: number; playerIds: string[] };
    away: { teamId: string; score: number; playerIds: string[] };
    tournamentId?: string;
    durationMinutes?: number;
    venue?: Match["venue"];
    playedAt: string;
  }) => request<{ match: Match }>("/matches", { method: "POST", body: JSON.stringify(input) }),
  completeMatch: (input: { id: string; homeScore: number; awayScore: number; durationMinutes?: number; venue?: Match["venue"]; eventLog: Match["eventLog"] }) =>
    request<{ match: Match }>("/matches/complete", { method: "POST", body: JSON.stringify(input) })
};

export function resolveApiAssetUrl(path: string) {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
