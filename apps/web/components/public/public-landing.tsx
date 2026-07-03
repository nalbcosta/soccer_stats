import Link from "next/link";
import type { AggregatedStats, PlayerProfile, PublicUser } from "@soccer-stats/shared";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  MailPlus,
  Medal,
  Shield,
  Trophy,
  Users
} from "lucide-react";
import { ComparisonBar } from "../sports/comparison-bar";
import { PlayerCard } from "../sports/player-card";
import { ScoreboardCard } from "../sports/scoreboard-card";
import { StatTile } from "../sports/stat-tile";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";

const demoStats: AggregatedStats = {
  matchesPlayed: 24,
  wins: 15,
  draws: 4,
  losses: 5,
  goals: 31,
  assists: 12,
  cleanSheets: 0,
  goalDifference: 18,
  points: 49,
  winRate: 62.5,
  goalsPerMatch: 1.29,
  form: ["W", "W", "D", "W", "L"],
  recentHighlight: "Fase consistente e acima da media."
};

const demoUser: PublicUser = {
  id: "demo-user",
  email: "camisa10@nabola.app",
  username: "camisa10",
  locale: "pt-BR",
  theme: "system",
  providers: ["credentials"]
};

const demoProfile: PlayerProfile = {
  userId: demoUser.id,
  displayName: "Camisa 10",
  preferredFoot: "right",
  preferredPosition: "midfielder",
  bio: "Meia da resenha",
  stats: demoStats
};

const featureBlocks = [
  {
    title: "Marque a rodada",
    description: "Escolha times, data e contexto sem depender de mensagem perdida.",
    icon: CalendarDays
  },
  {
    title: "Monte o elenco",
    description: "Organize times, membros e convites com uma estrutura simples.",
    icon: Users
  },
  {
    title: "Feche o placar",
    description: "Registre resultado e transforme cada jogo em historico da turma.",
    icon: CheckCircle2
  },
  {
    title: "Suba no ranking",
    description: "Pontos, gols, forma recente e aproveitamento ganham leitura rapida.",
    icon: Medal
  }
];

const faq = [
  {
    question: "Serve para pelada sem campeonato?",
    answer: "Sim. Voce pode marcar jogo avulso, fechar placar e acompanhar os numeros da turma."
  },
  {
    question: "Da para organizar times?",
    answer: "Da. O NaBola ja trabalha com times, membros, convites e estatisticas agregadas."
  },
  {
    question: "O app funciona bem no celular?",
    answer: "Essa e a base do produto. A experiencia e mobile-first, com tab bar inferior e leitura rapida."
  },
  {
    question: "O card do jogador e so visual?",
    answer: "Nao. Ele usa dados reais do perfil e das estatisticas para gerar rating, atributos e fase."
  }
];

export function PublicLanding() {
  return (
    <main className="min-h-screen bg-canvas text-text">
      <section className="field-grid relative overflow-hidden border-b border-border bg-field text-white">
        <div className="mx-auto grid min-h-[92vh] max-w-6xl content-center gap-8 px-4 py-10 md:px-6">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-black">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/15 text-sm shadow-line">NB</span>
              <span>NaBola</span>
            </Link>
            <Link className="inline-flex min-h-10 items-center rounded-lg bg-white px-4 text-sm font-black text-field" href="/login">
              Login
            </Link>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div>
              <Badge tone="primary" className="bg-white/15 text-white">
                Futebol entre amigos
              </Badge>
              <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
                A pelada sai do grupo e entra no jogo.
              </h1>
              <p className="mt-5 max-w-xl text-base font-semibold leading-7 text-white/80">
                Marque partidas, organize times, feche placares e transforme a resenha em ranking, card e estatistica.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-black text-white shadow-glow"
                  href="/login"
                >
                  Entrar em campo
                  <ArrowRight size={18} />
                </Link>
                <Link
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/10 px-5 text-sm font-black text-white"
                  href="#demo"
                >
                  Ver o produto
                  <ChevronRight size={18} />
                </Link>
              </div>
            </div>

            <div className="grid gap-3 rounded-[20px] border border-white/20 bg-white/10 p-3 shadow-panel backdrop-blur">
              <ScoreboardCard
                awayName="Coletes"
                awayScore={2}
                eyebrow="Quarta da quadra"
                homeName="Azuis"
                homeScore={3}
                meta="Hoje - 20:30"
                status="completed"
              />
              <div className="grid grid-cols-3 gap-2">
                <MiniSignal label="Forma" value="3V" />
                <MiniSignal label="Gols" value="5" />
                <MiniSignal label="Convites" value="2" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:px-6" id="demo">
        <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr] md:items-end">
          <div>
            <p className="text-xs font-black uppercase text-field">Produto real antes do login</p>
            <h2 className="mt-2 text-3xl font-black md:text-4xl">O que a turma ve quando a bola rola.</h2>
          </div>
          <p className="text-sm font-semibold leading-6 text-muted">
            A landing mostra as pecas que ja existem no app: placar, card de jogador, ranking, estatisticas, convites e campeonatos.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <PlayerCard profile={demoProfile} size="full" user={demoUser} />
          <div className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <StatTile icon={Trophy} label="Aproveit." value="62.5%" helper="Fase da turma" tone="primary" />
              <StatTile icon={BarChart3} label="Gols/jogo" value="1.29" helper="Media do card" tone="field" />
              <StatTile icon={Shield} label="Jogos" value="24" helper="Historico vivo" tone="marker" />
            </div>
            <Card className="p-4">
              <p className="text-xs font-black uppercase text-muted">Comparacao da rodada</p>
              <div className="mt-4 grid gap-4">
                <ComparisonBar helper="Ataque em fase boa" label="Azuis" max={18} tone="field" value={18} />
                <ComparisonBar helper="Boa sequencia recente" label="Coletes" max={18} tone="primary" value={13} />
                <ComparisonBar helper="Ainda buscando regularidade" label="Pretos" max={18} tone="marker" value={9} />
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-12 md:grid-cols-4 md:px-6">
          {featureBlocks.map((item) => {
            const Icon = item.icon;

            return (
              <div className="rounded-lg border border-border bg-canvas p-4" key={item.title}>
                <Icon className="text-primary-strong" size={22} />
                <p className="mt-4 font-black">{item.title}</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-muted">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:px-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-xs font-black uppercase text-field">Do convite ao ranking</p>
          <h2 className="mt-2 text-3xl font-black">Organizacao sem matar a resenha.</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-muted">
            O NaBola nao quer parecer planilha. A interface usa linguagem de jogo: elenco, rodada, placar fechado, fase e disputa.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <FlowCard icon={Users} title="Times" description="Elenco, membros e campanha em um so lugar." />
          <FlowCard icon={CalendarDays} title="Partidas" description="Jogo marcado, status claro e placar final." />
          <FlowCard icon={MailPlus} title="Convites" description="Chame jogador para o elenco sem perder contexto." />
          <FlowCard icon={Trophy} title="Copas" description="Tabela simples para campeonato da turma." />
        </div>
      </section>

      <section className="bg-text text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:px-6 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <p className="text-xs font-black uppercase text-marker">Prova de produto</p>
            <h2 className="mt-2 text-3xl font-black">Parece app de jogo porque usa dados de jogo.</h2>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/72">
              Cada tela deve responder rapido: qual e o proximo jogo, quem esta bem, quem lidera, qual placar fechou e o que falta fazer.
            </p>
          </div>
          <div className="grid gap-3">
            <Quote text="Menos grupo perdido. Mais jogo resolvido." />
            <Quote text="Do apito ao ranking, tudo fica no historico." />
            <Quote text="Seu futebol, seus numeros, sua turma." />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:px-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-xs font-black uppercase text-field">FAQ</p>
          <h2 className="mt-2 text-3xl font-black">Perguntas antes de entrar em campo.</h2>
        </div>
        <div className="grid gap-3">
          {faq.map((item) => (
            <Card className="p-4" key={item.question}>
              <p className="font-black">{item.question}</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-muted">{item.answer}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto px-4 pb-12 md:px-6">
        <div className="mx-auto grid max-w-6xl gap-4 rounded-lg border border-border bg-surface p-5 shadow-line md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-xs font-black uppercase text-field">Pronto para a rodada?</p>
            <h2 className="mt-1 text-2xl font-black">Monte sua turma e marque o primeiro jogo.</h2>
          </div>
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-black text-white shadow-glow"
            href="/login"
          >
            Criar conta
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}

function MiniSignal({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/20 bg-white/10 p-3 text-center text-white">
      <p className="text-xl font-black tabular-nums">{value}</p>
      <p className="text-[11px] font-black uppercase opacity-75">{label}</p>
    </div>
  );
}

function FlowCard({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-md bg-primary-soft text-primary-strong">
          <Icon size={20} />
        </div>
        <div>
          <p className="font-black">{title}</p>
          <p className="mt-1 text-sm font-semibold leading-6 text-muted">{description}</p>
        </div>
      </div>
    </Card>
  );
}

function Quote({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/10 p-4">
      <p className="text-sm font-black leading-6">{text}</p>
    </div>
  );
}
