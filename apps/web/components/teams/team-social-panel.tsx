"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Link2, MessageCircle, Share2, Trash2 } from "lucide-react";
import type { Team } from "@soccer-stats/shared";
import { useTeamDetail } from "../../composables/use-team-detail";
import { api, resolveApiAssetUrl } from "../../lib/api";
import { useSession } from "../app/session-provider";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";

export function TeamSocialPanel({ team, canManage, onTeamChange }: { team: Team; canManage: boolean; onTeamChange: () => Promise<void> }) {
  const { requests, reviewRequest } = useTeamDetail(team, canManage);
  const { setFeedback } = useSession();
  const fileInput = useRef<HTMLInputElement>(null);
  const [whatsappGroupUrl, setWhatsappGroupUrl] = useState(team.whatsappGroupUrl ?? "");
  const [busy, setBusy] = useState(false);

  useEffect(() => { setWhatsappGroupUrl(team.whatsappGroupUrl ?? ""); }, [team.whatsappGroupUrl]);

  const share = async () => {
    const url = `${window.location.origin}/app/teams/${team.slug}`;
    if (navigator.share) { await navigator.share({ title: team.name, text: team.description ?? team.name, url }); return; }
    await navigator.clipboard.writeText(url);
  };
  const uploadLogo = async (file: File) => { setBusy(true); try { await api.uploadTeamLogo(team.id, file); await onTeamChange(); } finally { setBusy(false); } };
  const removeLogo = async () => { setBusy(true); try { await api.removeTeamLogo(team.id); await onTeamChange(); } finally { setBusy(false); } };
  const saveWhatsAppLink = async () => {
    const value = whatsappGroupUrl.trim();
    if (value) {
      try { new URL(value); } catch { setFeedback("Informe um link válido do grupo do WhatsApp.", "error"); return; }
    }
    setBusy(true);
    try {
      await api.updateTeam(team.id, { whatsappGroupUrl: value || null });
      await onTeamChange();
      setFeedback(value ? "Link do grupo do WhatsApp salvo." : "Link do grupo do WhatsApp removido.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível salvar o link do WhatsApp.", "error");
    } finally { setBusy(false); }
  };

  return <div className="grid gap-4 lg:grid-cols-2">
    <Card className="p-4">
      <div className="flex items-center justify-between gap-3"><p className="font-black">Identidade e compartilhamento</p><Button variant="secondary" onClick={() => void share()}><Share2 size={16} />Compartilhar</Button></div>
      <div className="mt-4 flex items-center gap-4">
        <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-canvas">{team.logoUrl ? <img alt={`Logo ${team.name}`} className="size-full object-cover" src={resolveApiAssetUrl(team.logoUrl)} /> : <ImagePlus className="text-muted" />}</div>
        {canManage && <div className="flex flex-wrap gap-2"><input accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadLogo(file); }} ref={fileInput} type="file" /><Button disabled={busy} onClick={() => fileInput.current?.click()} variant="secondary"><ImagePlus size={16} />{team.logoUrl ? "Trocar logo" : "Enviar logo"}</Button>{team.logoUrl && <Button disabled={busy} onClick={() => void removeLogo()} variant="ghost"><Trash2 size={16} />Remover</Button>}</div>}
      </div>
      <p className="mt-3 flex items-center gap-2 text-xs text-muted"><Link2 size={14} />Link público pronto para WhatsApp, Facebook e Instagram.</p>
    </Card>

    {canManage && <Card className="p-4"><p className="font-black">Solicitações pendentes</p>{requests.length ? <div className="mt-3 space-y-2">{requests.map((request) => <div className="flex items-center justify-between gap-2 rounded-lg bg-canvas p-3" key={request.id}><span className="truncate text-sm">{request.userId}</span><span className="flex gap-2"><Button onClick={() => void reviewRequest(request.id, "approve")} variant="secondary">Aprovar</Button><Button onClick={() => void reviewRequest(request.id, "reject")} variant="ghost">Recusar</Button></span></div>)}</div> : <p className="mt-3 text-sm text-muted">Nenhuma solicitação pendente.</p>}</Card>}

    <Card className="lg:col-span-2 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-black">Grupo do WhatsApp</p><p className="mt-1 text-sm text-muted">As conversas do time acontecem no grupo.</p></div>{team.whatsappGroupUrl ? <a className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-black text-white" href={team.whatsappGroupUrl} rel="noreferrer" target="_blank"><MessageCircle size={17} />Entrar no grupo do WhatsApp do time</a> : null}</div>
      {canManage ? <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]"><Input aria-label="Link do grupo do WhatsApp" placeholder="https://chat.whatsapp.com/..." type="url" value={whatsappGroupUrl} onChange={(event) => setWhatsappGroupUrl(event.target.value)} /><Button disabled={busy} onClick={() => void saveWhatsAppLink()} type="button">Salvar link</Button></div> : !team.whatsappGroupUrl ? <p className="mt-4 text-sm text-muted">O administrador ainda não configurou um grupo do WhatsApp.</p> : null}
    </Card>
  </div>;
}
