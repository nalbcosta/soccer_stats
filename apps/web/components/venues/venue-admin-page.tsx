"use client";

import { useCallback, useEffect, useState } from "react";
import { Banknote, Ban, ExternalLink, MapPin, Pencil, Phone, PlusCircle, RotateCcw, Star } from "lucide-react";
import type { Venue, VenueChangeRequest, VenueChangeSet, VenueReview } from "@soccer-stats/shared";
import { api } from "../../lib/api";
import { PageHeading } from "../app/page-heading";
import { useSession } from "../app/session-provider";
import { LoadingState } from "../feedback/loading-state";
import { NotFoundPanel } from "../feedback/not-found-panel";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

type ProposedVenue = VenueChangeSet;

const kindCopy: Record<VenueChangeRequest["kind"], { label: string; description: string }> = {
  create: { label: "Novo campo", description: "O campo ficará visível no catálogo após a aprovação." },
  update: { label: "Edição de campo", description: "Os dados atuais só serão substituídos após a aprovação." },
  close: { label: "Solicitação de fechamento", description: "O campo continuará no catálogo como Fechado e não poderá ser usado em novos jogos." },
  reopen: { label: "Solicitação de reabertura", description: "O campo voltará a ficar ativo e disponível para novos jogos." }
};

const kindIcon = {
  create: PlusCircle,
  update: Pencil,
  close: Ban,
  reopen: RotateCcw
} satisfies Record<VenueChangeRequest["kind"], typeof PlusCircle>;

const surfaceLabel: Record<Venue["surface"], string> = {
  grass: "Grama",
  synthetic: "Sintético",
  court: "Quadra",
  sand: "Areia",
  other: "Outro"
};

const formatMoney = (cents: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
const mapLink = (venue: ProposedVenue) => {
  const query = [venue.name, venue.address, venue.city && venue.state ? `${venue.city} - ${venue.state}` : venue.city].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};

export function VenueAdminPage() {
  const { setFeedback, user } = useSession();
  const [requests, setRequests] = useState<VenueChangeRequest[]>([]);
  const [reviews, setReviews] = useState<VenueReview[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.listVenueModeration();
      setRequests(result.requests);
      setReviews(result.reviews);
      setVenues(result.venues);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { if (user?.platformRole === "admin") void load(); }, [load, user?.platformRole]);
  if (user?.platformRole !== "admin") return <NotFoundPanel title="Área exclusiva para administradores" backHref="/app/venues" />;
  if (loading) return <LoadingState />;

  const moderateChange = async (id: string, decision: "approve" | "reject") => {
    try {
      await api.moderateVenueChange(id, decision);
      setFeedback(decision === "approve" ? "Solicitação aprovada." : "Solicitação recusada.");
      await load();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Falha na moderação.", "error");
    }
  };
  const moderateReview = async (id: string, decision: "approve" | "reject") => {
    try {
      await api.moderateVenueReview(id, decision);
      setFeedback(decision === "approve" ? "Avaliação aprovada." : "Avaliação recusada.");
      await load();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Falha na moderação.", "error");
    }
  };

  return (
    <>
      <PageHeading eyebrow="Administração" title="Moderação de campos" />
      <div className="grid gap-5 lg:grid-cols-2">
        <Queue title="Cadastros, edições e status" empty="Nenhuma alteração pendente.">
          {requests.map((request) => {
            const currentVenue = venues.find((venue) => venue.id === request.venueId);
            return <VenueRequestCard {...(currentVenue ? { currentVenue } : {})} key={request.id} request={request} onApprove={() => void moderateChange(request.id, "approve")} onReject={() => void moderateChange(request.id, "reject")} />;
          })}
        </Queue>
        <Queue title="Avaliações" empty="Nenhuma avaliação pendente.">
          {reviews.map((review) => { const venue = venues.find((item) => item.id === review.venueId); return <ReviewCard key={review.id} review={review} {...(venue ? { venue } : {})} onApprove={() => void moderateReview(review.id, "approve")} onReject={() => void moderateReview(review.id, "reject")} />; })}
        </Queue>
      </div>
    </>
  );
}

function Queue({ title, empty, children }: { title: string; empty: string; children: React.ReactNode }) {
  const count = Array.isArray(children) ? children.length : 1;
  return <section><h2 className="mb-3 text-lg font-black">{title}</h2><div className="grid gap-3">{count ? children : <Card className="p-4 text-muted">{empty}</Card>}</div></section>;
}

function VenueRequestCard({ request, currentVenue, onApprove, onReject }: { request: VenueChangeRequest; currentVenue?: Venue; onApprove: () => void; onReject: () => void }) {
  const proposed = { ...(currentVenue ?? {}), ...request.changes } as ProposedVenue;
  const copy = kindCopy[request.kind];
  const Icon = kindIcon[request.kind];
  const isStatusChange = request.kind === "close" || request.kind === "reopen";
  return (
    <Card className="overflow-hidden">
      <div className="flex items-start gap-3 border-b border-border p-4">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${request.kind === "close" ? "bg-error-soft text-error" : "bg-primary-soft text-primary-strong"}`}><Icon size={19} /></span>
        <div className="min-w-0 flex-1"><p className="text-xs font-black uppercase text-muted">{copy.label}</p><h3 className="truncate text-lg font-black">{proposed.name ?? "Campo"}</h3><p className="mt-1 text-sm text-muted">{copy.description}</p></div>
        <span className="rounded-full bg-warning-soft px-2 py-1 text-xs font-black text-warning-strong">Pendente</span>
      </div>
      <div className="grid gap-3 p-4">
        {proposed.address ? <a className="flex items-start gap-2 rounded-lg border border-border bg-canvas p-3 text-sm font-bold text-primary-strong hover:border-primary" href={mapLink(proposed)} rel="noreferrer" target="_blank"><MapPin className="mt-0.5 shrink-0" size={17} /><span className="min-w-0 flex-1"><span className="block text-xs uppercase text-muted">{isStatusChange ? "Campo afetado" : "Endereço proposto"}</span>{proposed.address}</span><ExternalLink className="shrink-0" size={15} /></a> : null}
        {!isStatusChange ? <VenueProposalDetails venue={proposed} /> : null}
        <div className="flex gap-2 pt-1"><Button onClick={onApprove}>Aprovar</Button><Button variant="secondary" onClick={onReject}>Recusar</Button></div>
      </div>
    </Card>
  );
}

function VenueProposalDetails({ venue }: { venue: ProposedVenue }) {
  return (
    <div className="grid gap-2 text-sm">
      <div className="grid grid-cols-2 gap-2">
        <Info label="Cidade/UF" value={venue.city && venue.state ? `${venue.city}/${venue.state}` : "Não informado"} />
        <Info label="Superfície" value={venue.surface ? surfaceLabel[venue.surface] : "Não informada"} />
      </div>
      {venue.contactPhone ? <a className="flex items-center gap-2 rounded-lg bg-canvas p-3 font-bold hover:text-primary-strong" href={`tel:${venue.contactPhone}`}><Phone size={17} />{venue.contactPhone}</a> : null}
      {venue.prices ? <div className="rounded-lg bg-canvas p-3"><p className="mb-2 inline-flex items-center gap-2 text-xs font-black uppercase text-muted"><Banknote size={15} />Preços médios</p><div className="grid grid-cols-3 gap-2 text-center"><Price label="60 min" cents={venue.prices.minutes60} /><Price label="90 min" cents={venue.prices.minutes90} /><Price label="120 min" cents={venue.prices.minutes120} /></div></div> : null}
    </div>
  );
}

function ReviewCard({ review, venue, onApprove, onReject }: { review: VenueReview; venue?: Venue; onApprove: () => void; onReject: () => void }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase text-muted">Avaliação de {venue?.name ?? "campo"}</p><p className="mt-1 flex gap-0.5 text-warning">{[1, 2, 3, 4, 5].map((value) => <Star fill={value <= review.rating ? "currentColor" : "none"} key={value} size={18} />)}</p></div><span className="rounded-full bg-warning-soft px-2 py-1 text-xs font-black text-warning-strong">Pendente</span></div>
      {venue?.address ? <a className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-primary-strong" href={mapLink(venue)} rel="noreferrer" target="_blank"><MapPin size={16} />Ver campo no mapa <ExternalLink size={14} /></a> : null}
      <p className="mt-3 rounded-lg bg-canvas p-3 text-sm">{review.comment ?? "Sem comentário."}</p>
      <div className="mt-3 flex gap-2"><Button onClick={onApprove}>Aprovar</Button><Button variant="secondary" onClick={onReject}>Recusar</Button></div>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-canvas p-3"><span className="block text-xs font-black uppercase text-muted">{label}</span><strong>{value}</strong></div>; }
function Price({ label, cents }: { label: string; cents: number }) { return <div><span className="block text-xs text-muted">{label}</span><strong>{formatMoney(cents)}</strong></div>; }
