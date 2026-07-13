"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { acceptLegalConsent } from "../../../components/legal/cookie-consent-toast";

const sections = [
  { title: "1. Sobre o NaBola", text: "O NaBola ajuda grupos a organizar peladas, times, campeonatos e partidas, além de acompanhar resultados e estatísticas. Para usar os recursos da plataforma, você deve fornecer informações verdadeiras e manter o acesso à sua conta protegido." },
  { title: "2. Uso responsável", text: "Você é responsável pelo conteúdo que cadastra e pelas ações realizadas na sua conta. Não use o NaBola para compartilhar conteúdo ilegal, assediar outras pessoas, tentar acessar contas de terceiros ou comprometer o funcionamento do serviço." },
  { title: "3. Dados e privacidade", text: "Usamos os dados necessários para oferecer o serviço, autenticar sua conta e exibir as funcionalidades que você escolheu usar. Não vendemos seus dados pessoais. Consulte esta página sempre que atualizarmos nossas regras e entre em contato conosco caso tenha dúvidas sobre seus dados." },
  { title: "4. Cookies", text: "Usamos cookies essenciais e armazenamento local para manter preferências, idioma, sessão e consentimento no dispositivo. Esses recursos são necessários para que a experiência funcione corretamente." },
  { title: "5. Atualizações e encerramento", text: "Podemos atualizar estes termos ou alterar funcionalidades para melhorar o serviço. Quando uma mudança for relevante, informaremos na plataforma. O uso continuado após a atualização representa sua concordância com a nova versão." }
];

export default function TermsPage() {
  const [accepted, setAccepted] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const confirm = () => {
    if (!accepted) return;
    acceptLegalConsent();
    setConfirmed(true);
  };

  return (
    <main className="min-h-screen bg-canvas px-4 py-5 text-text sm:px-6 sm:py-8">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 font-black"><span className="field-grid grid h-11 w-11 place-items-center rounded-lg bg-field text-sm text-white shadow-line">NB</span><span>NaBola</span></Link>
          <Link className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-muted transition hover:text-text" href="/"><ArrowLeft size={17} /> Voltar</Link>
        </header>
        <section className="mt-10 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-field"><ShieldCheck size={16} /> Transparência e segurança</div>
          <h1 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">Termos de uso e cookies</h1>
          <p className="mt-4 text-base font-semibold leading-7 text-muted">Última atualização: 13 de julho de 2026</p>
          <p className="mt-5 text-base leading-7 text-muted">Estes termos explicam como você pode usar o NaBola e como tratamos os cookies essenciais para entregar a experiência da plataforma.</p>
        </section>
        <div className="mt-8 grid gap-4">
          {sections.map((section) => <Card className="p-5 sm:p-6" key={section.title}><h2 className="text-lg font-black">{section.title}</h2><p className="mt-2 text-sm font-semibold leading-7 text-muted">{section.text}</p></Card>)}
        </div>
        <Card className="mt-6 border-primary/30 bg-primary-soft/35 p-5 sm:p-6">
          <label className="flex items-start gap-3"><input checked={accepted} className="mt-1 h-4 w-4 accent-[var(--color-primary)]" type="checkbox" onChange={(event) => setAccepted(event.target.checked)} /><span className="text-sm font-bold leading-6">Li e aceito os Termos de uso e o uso de cookies essenciais do NaBola.</span></label>
          <Button className="mt-4 w-full sm:w-auto" disabled={!accepted} type="button" onClick={confirm}>{confirmed ? <CheckCircle2 size={18} /> : null}{confirmed ? "Aceite confirmado" : "Confirmar aceite"}</Button>
          {confirmed ? <p className="mt-3 text-sm font-bold text-success">Termos e cookies aceitos com sucesso neste dispositivo.</p> : null}
        </Card>
      </div>
    </main>
  );
}
