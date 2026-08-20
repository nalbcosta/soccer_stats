"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, LoaderCircle, MapPin, Plus, ShieldCheck, Star } from "lucide-react";
import type { Venue, VenueChangeSet } from "@soccer-stats/shared";
import { api, type PaginationMeta } from "../../lib/api";
import { PageHeading } from "../app/page-heading";
import { useSession } from "../app/session-provider";
import { BottomSheet } from "../overlays/bottom-sheet";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Select } from "../ui/select";

export interface VenueFormState {
  name: string;
  postalCode: string;
  addressNumber: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  surface: Venue["surface"];
  latitude: string;
  longitude: string;
  contactPhone: string;
  price60: string;
  price90: string;
  price120: string;
}

interface ViaCepResponse {
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

const blankForm: VenueFormState = {
  name: "",
  postalCode: "",
  addressNumber: "",
  street: "",
  neighborhood: "",
  city: "",
  state: "",
  surface: "synthetic",
  latitude: "",
  longitude: "",
  contactPhone: "",
  price60: "",
  price90: "",
  price120: ""
};

const cepDigits = (value: string) => value.replace(/\D/g, "").slice(0, 8);
const formatCep = (value: string) => {
  const digits = cepDigits(value);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
};
const moneyToCents = (value: string) => Math.round(Number(value.replace(",", ".")) * 100);

export const buildVenueAddress = (form: VenueFormState) => {
  if (!form.street || !form.addressNumber || !form.city || !form.state || cepDigits(form.postalCode).length !== 8) return "";
  const neighborhood = form.neighborhood ? ` - ${form.neighborhood}` : "";
  return `${form.street}, ${form.addressNumber}${neighborhood}, ${form.city} - ${form.state}, ${formatCep(form.postalCode)}`;
};

export const canSubmitVenueForm = (form: VenueFormState) => Boolean(
  form.name.trim().length >= 2
  && buildVenueAddress(form)
  && form.contactPhone.trim().length >= 8
  && [form.price60, form.price90, form.price120].every((value) => value !== "" && Number(value.replace(",", ".")) >= 0)
);

export const venueToForm = (venue: Venue): VenueFormState => {
  const address = venue.address ?? "";
  const street = address.split(",")[0]?.trim() ?? "";
  const neighborhood = address.match(/\s-\s([^,]+),\s*[^,]+\s-\s[A-Za-z]{2}/)?.[1]?.trim() ?? "";
  const inferredNumber = address.match(/^[^,]+,\s*([^,\-]+)/)?.[1]?.trim() ?? "";
  const inferredCep = address.match(/\b\d{5}-?\d{3}\b/)?.[0] ?? "";
  return {
    name: venue.name,
    postalCode: venue.postalCode ?? inferredCep,
    addressNumber: venue.addressNumber ?? inferredNumber,
    street,
    neighborhood,
    city: venue.city,
    state: venue.state,
    surface: venue.surface,
    latitude: venue.latitude === undefined ? "" : String(venue.latitude),
    longitude: venue.longitude === undefined ? "" : String(venue.longitude),
    contactPhone: venue.contactPhone ?? "",
    price60: venue.prices ? String(venue.prices.minutes60 / 100) : "",
    price90: venue.prices ? String(venue.prices.minutes90 / 100) : "",
    price120: venue.prices ? String(venue.prices.minutes120 / 100) : ""
  };
};

export const venueFormToChanges = (form: VenueFormState): VenueChangeSet => ({
  name: form.name.trim(),
  address: buildVenueAddress(form),
  postalCode: formatCep(form.postalCode),
  addressNumber: form.addressNumber.trim(),
  city: form.city.trim(),
  state: form.state.trim().toUpperCase(),
  surface: form.surface,
  ...(form.latitude ? { latitude: Number(form.latitude) } : {}),
  ...(form.longitude ? { longitude: Number(form.longitude) } : {}),
  contactPhone: form.contactPhone.trim(),
  prices: {
    minutes60: moneyToCents(form.price60),
    minutes90: moneyToCents(form.price90),
    minutes120: moneyToCents(form.price120)
  }
});

export function VenueForm({ value, onChange }: { value: VenueFormState; onChange: (value: VenueFormState) => void }) {
  const [lookingUpCep, setLookingUpCep] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const set = <K extends keyof VenueFormState>(key: K, next: VenueFormState[K]) => onChange({ ...value, [key]: next });
  const fullAddress = buildVenueAddress(value);

  const lookupCep = async () => {
    const digits = cepDigits(value.postalCode);
    if (digits.length !== 8) {
      setCepError("Informe um CEP com 8 números.");
      return;
    }
    setLookingUpCep(true);
    setCepError(null);
    try {
      const baseUrl = (process.env.NEXT_PUBLIC_VIACEP_API_URL ?? "https://viacep.com.br/ws").replace(/\/$/, "");
      const response = await fetch(`${baseUrl}/${digits}/json/`);
      if (!response.ok) throw new Error("Não foi possível consultar o CEP.");
      const address = await response.json() as ViaCepResponse;
      if (address.erro || !address.logradouro || !address.localidade || !address.uf) throw new Error("CEP não encontrado.");
      let next: VenueFormState = {
        ...value,
        postalCode: formatCep(address.cep ?? digits),
        street: address.logradouro,
        neighborhood: address.bairro ?? "",
        city: address.localidade,
        state: address.uf.toUpperCase(),
        latitude: "",
        longitude: ""
      };
      try {
        const query = `${address.logradouro}, ${value.addressNumber || "s/n"}, ${address.localidade} - ${address.uf}, Brasil`;
        const { locations } = await api.searchLocations({ q: query, limit: 1 });
        const location = locations[0];
        if (location) next = { ...next, latitude: String(location.latitude), longitude: String(location.longitude) };
      } catch {
        // O endereço continua válido mesmo quando a geocodificação opcional falha.
      }
      onChange(next);
    } catch (error) {
      setCepError(error instanceof Error ? error.message : "Não foi possível consultar o CEP.");
    } finally {
      setLookingUpCep(false);
    }
  };

  return (
    <div className="grid gap-4">
      <label className="grid gap-1.5 text-sm font-bold">Nome do campo<Input required placeholder="Ex.: Arena Camisa 10" value={value.name} onChange={(event) => set("name", event.target.value)} /></label>
      <div className="grid grid-cols-[minmax(0,1fr)_8rem] gap-2">
        <label className="grid gap-1.5 text-sm font-bold">CEP<Input inputMode="numeric" maxLength={9} placeholder="00000-000" value={value.postalCode} onBlur={() => void lookupCep()} onChange={(event) => set("postalCode", formatCep(event.target.value))} /></label>
        <label className="grid gap-1.5 text-sm font-bold">Número<Input maxLength={20} placeholder="55" value={value.addressNumber} onChange={(event) => set("addressNumber", event.target.value)} /></label>
      </div>
      {lookingUpCep ? <p className="inline-flex items-center gap-2 text-sm text-muted"><LoaderCircle className="animate-spin" size={16} />Consultando o ViaCEP...</p> : null}
      {cepError ? <p className="text-sm font-bold text-error">{cepError}</p> : null}
      {fullAddress ? <a className="flex items-start gap-2 rounded-lg border border-border bg-canvas p-3 text-sm font-bold text-primary-strong hover:border-primary" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`} rel="noreferrer" target="_blank"><MapPin className="mt-0.5 shrink-0" size={17} /><span className="min-w-0 flex-1"><span className="block text-xs uppercase text-muted">Endereço encontrado</span>{fullAddress}</span><ExternalLink className="shrink-0" size={15} /></a> : null}
      <label className="grid gap-1.5 text-sm font-bold">Tipo de superfície<Select value={value.surface} onChange={(event) => set("surface", event.target.value as Venue["surface"])}><option value="grass">Grama</option><option value="synthetic">Sintético</option><option value="court">Quadra</option><option value="sand">Areia</option><option value="other">Outro</option></Select></label>
      <label className="grid gap-1.5 text-sm font-bold">Telefone para contato<Input required placeholder="(79) 99998-2198" value={value.contactPhone} onChange={(event) => set("contactPhone", event.target.value)} /></label>
      <fieldset><legend className="mb-2 text-sm font-bold">Preços médios</legend><div className="grid gap-2 sm:grid-cols-3"><label className="grid gap-1 text-xs font-bold text-muted">60 minutos<Input required min={0} step="0.01" type="number" placeholder="R$ 0,00" value={value.price60} onChange={(event) => set("price60", event.target.value)} /></label><label className="grid gap-1 text-xs font-bold text-muted">90 minutos<Input required min={0} step="0.01" type="number" placeholder="R$ 0,00" value={value.price90} onChange={(event) => set("price90", event.target.value)} /></label><label className="grid gap-1 text-xs font-bold text-muted">120 minutos<Input required min={0} step="0.01" type="number" placeholder="R$ 0,00" value={value.price120} onChange={(event) => set("price120", event.target.value)} /></label></div></fieldset>
    </div>
  );
}

export function VenuesPageContent() {
  const { setFeedback, user } = useSession();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, pageSize: 10, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState({ q: "", city: "", state: "", status: "" });
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blankForm);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { setLoading(true); try { const result = await api.listVenues({ ...filters, status: filters.status as Venue["status"] || undefined, page, pageSize: 10 }); setVenues(result.venues); setPagination(result.pagination); } finally { setLoading(false); } }, [filters, page]);
  useEffect(() => { void load(); }, [load]);
  const submit = async () => { if (!canSubmitVenueForm(form)) { setFeedback("Preencha o CEP, número, telefone e os três preços.", "error"); return; } try { await api.submitVenue({ ...venueFormToChanges(form), visibility: "public" } as Parameters<typeof api.submitVenue>[0]); setFeedback("Campo enviado para aprovação."); setOpen(false); setForm(blankForm); } catch (error) { setFeedback(error instanceof Error ? error.message : "Não foi possível enviar.", "error"); } };
  return <><PageHeading eyebrow="Jogo" title="Campos" action={<div className="flex gap-2">{user?.platformRole === "admin" ? <Link className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm font-black" href="/app/admin/venues"><ShieldCheck size={17} />Moderar</Link> : null}<Button type="button" onClick={() => setOpen(true)}><Plus size={18} />Sugerir campo</Button></div>} /><Card className="mb-4 p-3"><div className="grid gap-2 sm:grid-cols-[1fr_12rem_5rem_10rem]"><Input placeholder="Buscar nome ou endereço" value={filters.q} onChange={(event) => { setPage(1); setFilters({ ...filters, q: event.target.value }); }} /><Input placeholder="Cidade" value={filters.city} onChange={(event) => { setPage(1); setFilters({ ...filters, city: event.target.value }); }} /><Input maxLength={2} placeholder="UF" value={filters.state} onChange={(event) => { setPage(1); setFilters({ ...filters, state: event.target.value.toUpperCase() }); }} /><Select value={filters.status} onChange={(event) => { setPage(1); setFilters({ ...filters, status: event.target.value }); }}><option value="">Todos</option><option value="active">Ativos</option><option value="closed">Fechados</option></Select></div></Card>{loading ? <Card className="p-4">Carregando campos...</Card> : <div className="grid gap-3">{venues.map((venue) => <Link href={`/app/venues/${venue.slug}`} key={venue.id}><Card className="flex items-center gap-3 p-4 transition hover:border-primary"><span className="grid h-11 w-11 place-items-center rounded-lg bg-field-soft text-field"><MapPin size={20} /></span><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate font-black">{venue.name}</p>{venue.status === "closed" ? <span className="rounded bg-error-soft px-2 py-0.5 text-xs font-black text-error">Fechado</span> : null}</div><p className="truncate text-sm text-muted">{venue.city}/{venue.state} • {venue.surface}</p></div><span className="inline-flex items-center gap-1 text-sm font-black"><Star fill="currentColor" size={15} />{venue.ratingCount ? venue.ratingAverage.toFixed(1) : "—"}</span></Card></Link>)}{venues.length === 0 ? <Card className="p-6 text-center text-muted">Nenhum campo encontrado.</Card> : null}</div>}<div className="mt-4 flex items-center justify-between"><Button disabled={page <= 1} variant="secondary" onClick={() => setPage((current) => current - 1)}>Anterior</Button><span className="text-sm font-bold">Página {pagination.page} de {pagination.totalPages}</span><Button disabled={page >= pagination.totalPages} variant="secondary" onClick={() => setPage((current) => current + 1)}>Próxima</Button></div><BottomSheet open={open} title="Sugerir campo" description="O cadastro ficará pendente até um administrador aprovar." onClose={() => setOpen(false)}><VenueForm value={form} onChange={setForm} /><Button className="mt-5 w-full" disabled={!canSubmitVenueForm(form)} type="button" onClick={() => void submit()}>Enviar para aprovação</Button></BottomSheet></>;
}
