"use client";

import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useSession } from "../app/session-provider";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function AccountSettingsPanel() {
  const { user, refresh, setFeedback } = useSession();
  const [username, setUsername] = useState(user?.username ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { setUsername(user?.username ?? ""); }, [user?.username]);

  if (!user) return null;

  const save = async () => {
    const nextUsername = username.trim();
    const changingPassword = Boolean(newPassword || currentPassword || confirmPassword);
    if (nextUsername.length < 3 || nextUsername.length > 20 || !/^[A-Za-z0-9_]+$/.test(nextUsername)) {
      setFeedback("Use de 3 a 20 caracteres: letras, números e _.", "error");
      return;
    }
    if (changingPassword && (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword))) {
      setFeedback("A nova senha precisa ter ao menos 8 caracteres, uma letra e um número.", "error");
      return;
    }
    if (changingPassword && newPassword !== confirmPassword) {
      setFeedback("A confirmação da nova senha não confere.", "error");
      return;
    }
    if (nextUsername === user.username && !changingPassword) return;

    setSaving(true);
    try {
      await api.updateAccount({
        ...(nextUsername !== user.username ? { username: nextUsername } : {}),
        ...(changingPassword ? { currentPassword, newPassword } : {})
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      await refresh();
      setFeedback("Dados da conta atualizados.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível atualizar a conta.", "error");
    } finally { setSaving(false); }
  };

  return <section className="rounded-lg border border-border bg-surface p-4">
    <p className="font-bold">Conta</p>
    <p className="mt-1 text-sm text-muted">Altere seu apelido e, se usar login por senha, atualize sua senha.</p>
    <div className="mt-4 grid gap-4">
      <label className="grid gap-2"><span className="text-xs font-bold uppercase text-muted">Apelido</span><Input autoComplete="nickname" maxLength={20} minLength={3} value={username} onChange={(event) => setUsername(event.target.value)} /></label>
      {user.providers.includes("credentials") ? <fieldset className="grid gap-3 border-t border-border pt-4"><legend className="font-bold">Alterar senha</legend><label className="grid gap-2"><span className="text-sm font-semibold">Senha atual</span><Input autoComplete="current-password" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} /></label><label className="grid gap-2"><span className="text-sm font-semibold">Nova senha</span><Input autoComplete="new-password" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></label><label className="grid gap-2"><span className="text-sm font-semibold">Confirmar nova senha</span><Input autoComplete="new-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></label></fieldset> : <p className="rounded-lg bg-canvas p-3 text-sm text-muted">Sua conta usa Google; a senha é gerenciada pelo Google.</p>}
      <Button className="w-full sm:w-auto sm:justify-self-end" disabled={saving} type="button" onClick={() => void save()}><Save size={17} />{saving ? "Salvando..." : "Salvar dados da conta"}</Button>
    </div>
  </section>;
}
