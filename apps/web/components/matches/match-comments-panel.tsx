"use client";

import { useState } from "react";
import { Send, Trash2 } from "lucide-react";
import { useMatchComments } from "../../composables/use-match-comments";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";

export function MatchCommentsPanel({ matchId, userId, canModerate }: { matchId: string; userId: string; canModerate: boolean }) {
  const { comments, error, send, remove } = useMatchComments(matchId);
  const [text, setText] = useState("");
  return <Card className="p-4"><p className="font-black">Comentários</p><form className="mt-3 flex gap-2" onSubmit={(event) => { event.preventDefault(); const value = text.trim(); if (!value) return; void send(value).then(() => setText("")); }}><Input maxLength={1000} onChange={(event) => setText(event.target.value)} placeholder="Comente a partida" value={text} /><Button type="submit"><Send size={16} /></Button></form>{error && <p className="mt-2 text-sm text-danger">{error}</p>}<div className="mt-4 space-y-2">{comments.length ? comments.map((comment) => <div className="flex gap-2 rounded-lg bg-canvas p-3" key={comment.id}><div className="min-w-0 flex-1"><p className="text-xs font-bold text-muted">{comment.authorId}</p><p className="mt-1 text-sm">{comment.text}</p></div>{(comment.authorId === userId || canModerate) && <Button aria-label="Excluir comentário" onClick={() => void remove(comment.id)} variant="ghost"><Trash2 size={16} /></Button>}</div>) : <p className="text-sm text-muted">Ainda não há comentários.</p>}</div></Card>;
}
