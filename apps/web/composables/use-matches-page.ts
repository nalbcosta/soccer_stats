"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Match } from "@soccer-stats/shared";
import { useSession } from "../components/app/session-provider";
import { api, type LocationResult, type MatchListFilters, type PaginationMeta } from "../lib/api";
import { useLocale } from "../i18n/provider";
import {
  buildMatchListItemsFromMatches,
  getUserRegion,
  type MatchListItem,
  type MatchPageTab
} from "../lib/matches/match-view-model";

export type MatchStatusFilter = "all" | Match["status"];

const defaultPagination: PaginationMeta = {
  page: 1,
  pageSize: 8,
  total: 0,
  totalPages: 1
};

export function useMatchesPage() {
  const { dashboard } = useSession();
  const { locale } = useLocale();
  const [tab, setRawTab] = useState<MatchPageTab>("mine");
  const [search, setRawSearch] = useState("");
  const [status, setRawStatus] = useState<MatchStatusFilter>("all");
  const [page, setPage] = useState(1);
  const [matches, setMatches] = useState<Match[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(defaultPagination);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationResult | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const fallbackRegion = useMemo(() => (dashboard ? getUserRegion(dashboard) : {}), [dashboard]);

  const fetchMatches = useCallback(async () => {
    if (!dashboard) {
      return;
    }

    setLoadingMatches(true);
    setError(null);

    try {
      const filters: MatchListFilters = {
        scope: tab,
        page,
        pageSize: defaultPagination.pageSize
      };
      const cleanSearch = search.trim();

      if (cleanSearch) {
        filters.q = cleanSearch;
      }

      if (status !== "all") {
        filters.status = status;
      }

      if (tab === "nearby" && location) {
        filters.latitude = location.latitude;
        filters.longitude = location.longitude;
        filters.radiusKm = 25;

        if (location.city) {
          filters.city = location.city;
        }

        if (location.state) {
          filters.state = location.state;
        }
      }

      if (tab === "nearby" && !location) {
        if (fallbackRegion.city) {
          filters.city = fallbackRegion.city;
        }

        if (fallbackRegion.state) {
          filters.state = fallbackRegion.state;
        }
      }

      const response = await api.listMatches(filters);

      setMatches(response.matches);
      setPagination(response.pagination ?? { ...defaultPagination, total: response.matches.length });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Nao foi possivel carregar os jogos.");
      setMatches([]);
      setPagination(defaultPagination);
    } finally {
      setLoadingMatches(false);
    }
  }, [dashboard, fallbackRegion.city, fallbackRegion.state, location, page, search, status, tab]);

  useEffect(() => {
    void fetchMatches();
  }, [fetchMatches]);

  const setTab = (nextTab: MatchPageTab) => {
    setRawTab(nextTab);
    setPage(1);
  };

  const setSearch = (nextSearch: string) => {
    setRawSearch(nextSearch);
    setPage(1);
  };

  const setStatus = (nextStatus: MatchStatusFilter) => {
    setRawStatus(nextStatus);
    setPage(1);
  };

  const requestLocation = () => {
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
          setLocation(response.location);
          setPage(1);
        } catch (caught) {
          setLocationError(caught instanceof Error ? caught.message : "Nao foi possivel resolver sua regiao.");
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

  const items = useMemo(() => (dashboard ? buildMatchListItemsFromMatches(matches, dashboard, locale) : []), [dashboard, locale, matches]);

  return {
    dashboard,
    tab,
    setTab,
    items,
    allItems: items,
    nearbyItems: tab === "nearby" ? items : [],
    search,
    setSearch,
    status,
    setStatus,
    pagination,
    setPage,
    loading: !dashboard,
    loadingMatches,
    error,
    retry: fetchMatches,
    location,
    locationLoading,
    locationError,
    requestLocation
  };
}

export type { MatchListItem, MatchPageTab };
