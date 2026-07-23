import type { AppConfig } from "../../types.js";

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state?: string;
  "ISO3166-2-lvl4"?: string;
  country?: string;
  country_code?: string;
}

interface NominatimPlace {
  lat: string;
  lon: string;
  display_name: string;
  address?: NominatimAddress;
}

export interface LocationResult {
  latitude: number;
  longitude: number;
  displayName: string;
  city?: string;
  state?: string;
  country?: string;
}

const stateCodeFromAddress = (address?: NominatimAddress): string | undefined => {
  const isoState = address?.["ISO3166-2-lvl4"]?.split("-").pop();

  if (isoState && isoState.length === 2) {
    return isoState.toUpperCase();
  }

  return address?.state?.length === 2 ? address.state.toUpperCase() : undefined;
};

const cityFromAddress = (address?: NominatimAddress): string | undefined =>
  address?.city ?? address?.town ?? address?.village ?? address?.municipality ?? address?.county;

const toLocationResult = (place: NominatimPlace): LocationResult => {
  const city = cityFromAddress(place.address);
  const state = stateCodeFromAddress(place.address);

  return {
    latitude: Number(place.lat),
    longitude: Number(place.lon),
    displayName: place.display_name,
    ...(city ? { city } : {}),
    ...(state ? { state } : {}),
    ...(place.address?.country ? { country: place.address.country } : {})
  };
};

export class LocationService {
  constructor(private readonly config: AppConfig) {}

  async reverse(latitude: number, longitude: number): Promise<LocationResult | null> {
    const url = this.buildUrl("/reverse", {
      lat: String(latitude),
      lon: String(longitude),
      format: "jsonv2",
      addressdetails: "1"
    });
    const place = await this.fetchNominatim<NominatimPlace>(url);
    return place.display_name ? toLocationResult(place) : null;
  }

  async search(query: string, limit: number): Promise<LocationResult[]> {
    const url = this.buildUrl("/search", {
      q: query,
      limit: String(limit),
      format: "jsonv2",
      addressdetails: "1",
      countrycodes: "br"
    });
    const places = await this.fetchNominatim<NominatimPlace[]>(url);
    return places.map(toLocationResult);
  }

  private buildUrl(pathname: string, params: Record<string, string>): URL {
    const url = new URL(pathname, this.config.nominatimBaseUrl);

    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

    if (this.config.nominatimEmail) {
      url.searchParams.set("email", this.config.nominatimEmail);
    }

    return url;
  }

  private async fetchNominatim<T>(url: URL): Promise<T> {
    const response = await fetch(url, {
      headers: {
        "User-Agent": this.config.nominatimUserAgent,
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Nao foi possivel consultar a localizacao agora.");
    }

    return response.json() as Promise<T>;
  }
}
