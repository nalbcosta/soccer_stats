"use client";

import { useRef, useState } from "react";
import { ImagePlus, Link2, Send, Share2, Trash2 } from "lucide-react";
import type { Team } from "@soccer-stats/shared";
import { useTeamDetail } from "../../composables/use-team-detail";
import { api, resolveApiAssetUrl } from "../../lib/api";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";

export function TeamSocialPanel({ team, userId, canManage, onTeamChange }: { team: Team; userId: string; canManage: boolean; onTeamChange: () => Promise<void> }) {
  const { messages, requests, error, sendMessage, deleteMessage, reviewRequest } = useTeamDetail(team, canManage);
  const fileInput = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const share = async () => {
    const url = `${window.location.origin}/app/teams/${team.id}`;
    if (navigator.share) { await navigator.share({ title: team.name, text: team.description ?? team.name, url }); return; }
    await navigator.clipboard.writeText(url);
  };
  const uploadLogo = async (file: File) => { setBusy(true); try { await api.uploadTeamLogo(team.id, file); await onTeamChange(); } finally { setBusy(false); } };
  const removeLogo = async () => { setBusy(true); try { await api.removeTeamLogo(team.id); await onTeamChange(); } finally { setBusy(false); } };
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
    <Card className="lg:col-span-2 p-4"><p className="font-black">Chat do time</p><form className="mt-3 flex gap-2" onSubmit={(event) => { event.preventDefault(); const value = text.trim(); if (!value) return; void sendMessage(value).then(() => setText("")); }}><Input maxLength={1000} onChange={(event) => setText(event.target.value)} placeholder="Escreva uma mensagem" value={text} /><Button type="submit"><Send size={16} /></Button></form>{error && <p className="mt-2 text-sm text-danger">{error}</p>}<div className="mt-4 space-y-2">{messages.length ? messages.map((message) => <div className="flex gap-2 rounded-lg bg-canvas p-3" key={message.id}><div className="min-w-0 flex-1"><p className="text-xs font-bold text-muted">{message.authorId}</p><p className="mt-1 text-sm">{message.text}</p></div>{(message.authorId === userId || canManage) && <Button aria-label="Excluir mensagem" onClick={() => void deleteMessage(message.id)} variant="ghost"><Trash2 size={16} /></Button>}</div>) : <p className="text-sm text-muted">O chat ainda está quieto. Puxe a primeira conversa.</p>}</div></Card>
  </div>;
}
