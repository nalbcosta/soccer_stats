"use client";

import { useMemo, useState, useTransition } from "react";
import type { Match } from "@soccer-stats/shared";
import { api } from "../lib/api";
import { useSession } from "../components/app/session-provider";
import { useLocale, useTranslations } from "../i18n/provider";
import { formatDateTime } from "../i18n/formatters";

export interface MatchCreateState {
  homeTeamId: string;
  awayTeamId: string;
  tournamentId: string;
  durationMinutes: string;
  venueName: string;
  venueAddress: string;
  venueCity: string;
  venueState: string;
  venueLatitude: string;
  venueLongitude: string;
  venueSurface: string;
  playedAt: string;
}

const initialState = (): MatchCreateState => ({
  homeTeamId: "",
  awayTeamId: "",
  tournamentId: "",
  durationMinutes: "60",
  venueName: "",
  venueAddress: "",
  venueCity: "",
  venueState: "",
  venueLatitude: "",
  venueLongitude: "",
  venueSurface: "",
  playedAt: new Date().toISOString().slice(0, 16)
});

export function useMatchCreate(onCreated?: () => void) {
  const { dashboard, user, refresh, setFeedback } = useSession();
  const { locale } = useLocale();
  const t = useTranslations("match");
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<MatchCreateState>(() => initialState());
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const teams = dashboard?.teams ?? [];
  const tournaments = dashboard?.tournaments ?? [];
  const canSubmit = Boolean(user && form.homeTeamId && form.awayTeamId && form.homeTeamId !== form.awayTeamId);
  const selectedHome = teams.find((team) => team.id === form.homeTeamId);
  const selectedAway = teams.find((team) => team.id === form.awayTeamId);
  const summary = useMemo(
    () => ({
      title: selectedHome && selectedAway ? `${selectedHome.name} x ${selectedAway.name}` : t("chooseTeams"),
      date: form.playedAt ? formatDateTime(form.playedAt, locale, { dateStyle: "medium", timeStyle: "short" }) : t("datePending"),
      venue: form.venueName || form.venueAddress || "Local a definir"
    }),
    [form.playedAt, form.venueAddress, form.venueName, locale, selectedAway, selectedHome, t]
  );

  const update = <Key extends keyof MatchCreateState>(key: Key, value: MatchCreateState[Key]) => {
    setForm((state) => ({ ...state, [key]: value }));
  };

  const useCurrentLocation = () => {
    setLocationError(null);

    if (!("geolocation" in navigator)) {
      setLocationError("Seu navegador nao liberou localizacao.");
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await api.reverseLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });

          setForm((state) => ({
            ...state,
            venueAddress: state.venueAddress || response.location.displayName,
            venueCity: response.location.city ?? state.venueCity,
            venueState: response.location.state ?? state.venueState,
            venueLatitude: String(response.location.latitude),
            venueLongitude: String(response.location.longitude)
          }));
        } catch (caught) {
          setLocationError(caught instanceof Error ? caught.message : "Nao foi possivel resolver sua localizacao.");
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setLocationError("Permissao de localizacao nao concedida.");
        setLocationLoading(false);
      },
      { enableHighAccuracy: false, maximumAge: 5 * 60 * 1000, timeout: 10000 }
    );
  };

  const submit = () => {
    if (!user || !canSubmit) {
      return;
    }

    startTransition(() => {
      const payload = {
        type: form.tournamentId ? ("tournament" as const) : ("casual" as const),
        home: { teamId: form.homeTeamId, score: 0, playerIds: [user.id] },
        away: { teamId: form.awayTeamId, score: 0, playerIds: [user.id] },
        playedAt: new Date(form.playedAt).toISOString(),
        ...(form.durationMinutes ? { durationMinutes: Number(form.durationMinutes) } : {}),
        ...(form.venueName || form.venueAddress || form.venueCity || form.venueState || form.venueSurface
          ? {
              venue: {
                ...(form.venueName ? { name: form.venueName } : {}),
                ...(form.venueAddress ? { address: form.venueAddress } : {}),
                ...(form.venueCity ? { city: form.venueCity } : {}),
                ...(form.venueState ? { state: form.venueState.toUpperCase() } : {}),
                ...(form.venueSurface ? { surface: form.venueSurface as NonNullable<NonNullable<Match["venue"]>["surface"]> } : {}),
                ...(form.venueLatitude ? { latitude: Number(form.venueLatitude) } : {}),
                ...(form.venueLongitude ? { longitude: Number(form.venueLongitude) } : {})
              }
            }
          : {})
      };

      void api.createMatch(form.tournamentId ? { ...payload, tournamentId: form.tournamentId } : payload).then(async () => {
        setFeedback("Jogo marcado.");
        setForm(initialState());
        await refresh();
        onCreated?.();
      });
    });
  };

  return {
    canSubmit,
    form,
    isPending,
    locationError,
    locationLoading,
    submit,
    summary,
    teams,
    tournaments,
    update,
    useCurrentLocation
  };
}
