"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ExternalLink, MapPin, Pencil, Phone, Star } from "lucide-react";
import type { Venue, VenueReview } from "@soccer-stats/shared";
import { api } from "../../lib/api";
import { PageHeading } from "../app/page-heading";
import { useSession } from "../app/session-provider";
import { LoadingState } from "../feedback/loading-state";
import { NotFoundPanel } from "../feedback/not-found-panel";
import { BottomSheet } from "../overlays/bottom-sheet";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { canSubmitVenueForm, VenueForm, venueFormToChanges, venueToForm, type VenueFormState } from "./venues-page-content";

export function VenueDetailPage() {
  const params = useParams<{ venueId: string }>();
  const { setFeedback } = useSession();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [reviews, setReviews] = useState<VenueReview[]>([]);
  const [myReview, setMyReview] = useState<VenueReview | undefined>();
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<VenueFormState | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const load = async () => { setLoading(true); try { const value = await api.getVenue(params.venueId); setVenue(value.venue); setReviews(value.reviews); setMyReview(value.myReview); if (value.myReview) { setRating(value.myReview.rating); setComment(value.myReview.comment ?? ""); } } finally { setLoading(false); } };
  useEffect(() => { void load(); }, [params.venueId]);
  const map = useMemo(() => venue ? buildMap(venue) : null, [venue]);
  if (loading) return <LoadingState />;
  if (!venue) return <NotFoundPanel title="Campo não encontrado" backHref="/app/venues" />;
  const submitReview = async () => { try { await api.submitVenueReview(venue.id, { rating, ...(comment.trim() ? { comment: comment.trim() } : {}) }); setFeedback("Avaliação enviada para aprovação."); await load(); } catch (error) { setFeedback(error instanceof Error ? error.message : "Não foi possível avaliar.", "error"); } };
  const submitEdit = async () => { if (!editForm || !canSubmitVenueForm(editForm)) { setFeedback("Informe um CEP válido, o número e os demais dados do campo.", "error"); return; } try { await api.submitVenueChange({ venueId: venue.id, kind: "update", changes: venueFormToChanges(editForm) }); setFeedback("Correção enviada para aprovação."); setEditOpen(false); } catch (error) { setFeedback(error instanceof Error ? error.message : "Não foi possível enviar a correção.", "error"); } };
  const toggleClosed = async () => { await api.submitVenueChange({ venueId: venue.id, kind: venue.status === "closed" ? "reopen" : "close", changes: {} }); setFeedback(`Solicitação para ${venue.status === "closed" ? "reabrir" : "fechar"} enviada.`); };
  return <><PageHeading eyebrow={`${venue.city}/${venue.state}`} title={venue.name} action={<Button variant="secondary" type="button" onClick={() => { setEditForm(venueToForm(venue)); setEditOpen(true); }}><Pencil size={17} />Sugerir correção</Button>} /><div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_21rem]"><div className="grid gap-4"><Card className="overflow-hidden">{map?.embedUrl ? <iframe className="h-72 w-full border-0" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" src={map.embedUrl} title={`Mapa de ${venue.name}`} /> : <div className="grid h-48 place-items-center bg-canvas text-muted"><MapPin />Localização disponível pelo endereço</div>}<div className="flex flex-wrap items-center justify-between gap-3 p-4"><p className="font-bold">{venue.address ?? "Endereço não informado"}</p><a className="inline-flex items-center gap-2 text-sm font-black text-primary-strong" href={map?.externalUrl} rel="noreferrer" target="_blank">Abrir rotas <ExternalLink size={15} /></a></div></Card><section><h2 className="mb-3 text-lg font-black">Avaliações aprovadas</h2><div className="grid gap-2">{reviews.map((review) => <Card className="p-3" key={review.id}><p className="font-black">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p>{review.comment ? <p className="mt-1 text-sm">{review.comment}</p> : null}</Card>)}{reviews.length === 0 ? <Card className="p-4 text-muted">Ainda não há avaliações publicadas.</Card> : null}</div></section></div><aside className="grid content-start gap-3"><Card className="p-4"><div className="flex items-center justify-between"><span className="inline-flex items-center gap-1 text-2xl font-black"><Star fill="currentColor" className="text-warning" />{venue.ratingCount ? venue.ratingAverage.toFixed(1) : "—"}</span>{venue.status === "closed" ? <span className="rounded bg-error-soft px-2 py-1 text-xs font-black text-error">Fechado</span> : <span className="rounded bg-primary-soft px-2 py-1 text-xs font-black text-primary-strong">Ativo</span>}</div><p className="mt-3 inline-flex items-center gap-2 text-sm"><Phone size={16} />{venue.contactPhone ?? "Telefone não informado"}</p><div className="mt-4 grid gap-1 text-sm">{venue.prices ? <><Price label="1 hora" cents={venue.prices.minutes60} /><Price label="1h30" cents={venue.prices.minutes90} /><Price label="2 horas" cents={venue.prices.minutes120} /></> : <p className="text-muted">Preços não informados.</p>}</div><Button className="mt-4 w-full" variant="ghost" onClick={() => void toggleClosed()}>Sugerir {venue.status === "closed" ? "reabertura" : "fechamento"}</Button></Card><Card className="p-4"><p className="font-black">Sua avaliação</p><div className="mt-3 flex gap-1">{[1,2,3,4,5].map((value) => <button className="p-1 text-warning" key={value} type="button" onClick={() => setRating(value)}><Star fill={value <= rating ? "currentColor" : "none"} /></button>)}</div><Input className="mt-3" placeholder="Comentário opcional" value={comment} onChange={(event) => setComment(event.target.value)} /><Button className="mt-3 w-full" onClick={() => void submitReview()}>{myReview ? "Atualizar avaliação" : "Enviar avaliação"}</Button>{myReview ? <p className="mt-2 text-xs text-muted">Status: {myReview.status}</p> : null}</Card></aside></div><BottomSheet open={editOpen} title="Sugerir correção" description="Os dados atuais só mudarão após aprovação." onClose={() => setEditOpen(false)}>{editForm ? <VenueForm value={editForm} onChange={setEditForm} /> : null}<Button className="mt-5 w-full" disabled={!editForm || !canSubmitVenueForm(editForm)} onClick={() => void submitEdit()}>Enviar correção</Button></BottomSheet></>;
}

function Price({ label, cents }: { label: string; cents: number }) { return <div className="flex justify-between"><span className="text-muted">{label}</span><strong>{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100)}</strong></div>; }
function buildMap(venue: Venue) { const query = venue.latitude !== undefined && venue.longitude !== undefined ? `${venue.latitude},${venue.longitude}` : `${venue.name}, ${venue.address ?? ""}, ${venue.city}-${venue.state}`; const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY; const externalUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`; if (key) return { embedUrl: `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(key)}&q=${encodeURIComponent(query)}`, externalUrl }; if (venue.latitude === undefined || venue.longitude === undefined) return { externalUrl }; const delta = 0.01; return { embedUrl: `https://www.openstreetmap.org/export/embed.html?bbox=${venue.longitude-delta}%2C${venue.latitude-delta}%2C${venue.longitude+delta}%2C${venue.latitude+delta}&layer=mapnik&marker=${venue.latitude}%2C${venue.longitude}`, externalUrl }; }
