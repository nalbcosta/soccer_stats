import type { LucideIcon } from "lucide-react";
import { CalendarDays, CheckCircle2, MailPlus, Medal, Trophy, Users } from "lucide-react";

type LandingLocale = "pt-BR" | "en";

type LandingFeature = {
  title: string;
  description: string;
  icon: LucideIcon;
};

type LandingFlow = {
  title: string;
  description: string;
  icon: LucideIcon;
};

type LandingFaq = {
  question: string;
  answer: string;
};

type LandingQuote = {
  text: string;
};

export type LandingDictionary = {
  nav: {
    login: string;
    themeLabel: string;
    localeLabel: string;
  };
  hero: {
    badge: string;
    title: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    stats: Array<{ label: string; value: string }>;
    liveCard: {
      eyebrow: string;
      meta: string;
    };
  };
  preview: {
    eyebrow: string;
    title: string;
    description: string;
    statTiles: Array<{ label: string; value: string; helper: string }>;
    comparisonTitle: string;
    comparison: Array<{ label: string; helper: string; value: number }>;
  };
  features: {
    title: string;
    items: LandingFeature[];
  };
  flow: {
    eyebrow: string;
    title: string;
    description: string;
    items: LandingFlow[];
  };
  proof: {
    eyebrow: string;
    title: string;
    description: string;
    quotes: LandingQuote[];
  };
  faq: {
    eyebrow: string;
    title: string;
    items: LandingFaq[];
  };
  cta: {
    eyebrow: string;
    title: string;
    description: string;
    button: string;
  };
  footer: {
    description: string;
    product: string;
    productLinks: string[];
    actions: {
      login: string;
      top: string;
    };
    copyright: string;
  };
  topModal: {
    title: string;
    description: string;
    confirm: string;
    cancel: string;
  };
};

export const landingContent: Record<LandingLocale, LandingDictionary> = {
  "pt-BR": {
    nav: {
      login: "Entrar",
      themeLabel: "Tema",
      localeLabel: "Idioma"
    },
    hero: {
      badge: "Futebol entre amigos",
      title: "A pelada sai do grupo e entra no jogo.",
      description:
        "Marque a rodada, registre o placar e deixe gols, assistências, local e fase fáceis de achar depois.",
      primaryCta: "Entrar em campo",
      secondaryCta: "Ver como fica",
      stats: [
        { label: "Jogos registrados", value: "24" },
        { label: "Gols no histórico", value: "31" },
        { label: "Assistências", value: "12" }
      ],
      liveCard: {
        eyebrow: "Rodada fechada",
        meta: "Sábado • 18:00"
      }
    },
    preview: {
      eyebrow: "Como a turma acompanha",
      title: "Placar, card e contexto sem caçar mensagem antiga.",
      description:
        "A landing mostra o que já faz sentido para quem usa: resultado da partida, autores dos gols, assistências, local do jogo, campeonato e evolução do jogador.",
      statTiles: [
        { label: "Aproveitamento", value: "62.5%", helper: "Resumo simples da fase" },
        { label: "Gols por jogo", value: "1.29", helper: "Média vinda do histórico" },
        { label: "Partidas", value: "24", helper: "Memória da resenha" }
      ],
      comparisonTitle: "Quem está sobrando",
      comparison: [
        { label: "Azuis", helper: "Mais gols e melhor sequência", value: 18 },
        { label: "Coletes", helper: "Competitivo até o fim", value: 13 },
        { label: "Pretos", helper: "Ainda buscando regularidade", value: 9 }
      ]
    },
    features: {
      title: "O básico da rodada, bem resolvido.",
      items: [
        {
          title: "Marque o jogo",
          description: "Defina data, horário, times e se a partida vale por uma copa ou é só resenha.",
          icon: CalendarDays
        },
        {
          title: "Organize o elenco",
          description: "Times, membros e convites ficam juntos para ninguém se perder no combinado.",
          icon: Users
        },
        {
          title: "Feche o placar",
          description: "Registre gols, assistências, minuto dos lances e o resultado final.",
          icon: CheckCircle2
        },
        {
          title: "Acompanhe a fase",
          description: "O card mostra jogos, gols, assistências, vitórias, rating e momento atual.",
          icon: Medal
        }
      ]
    },
    flow: {
      eyebrow: "Do convite ao histórico",
      title: "Organização de app sério, com clima de vestiário.",
      description:
        "O NaBola não tenta transformar a pelada em planilha. Ele guarda o que importa para a turma jogar, lembrar e provocar com dado na mão.",
      items: [
        { title: "Times", description: "Elenco, campanha e jogadores no mesmo lugar.", icon: Users },
        { title: "Partidas", description: "Data, status, local, duração e placar fechados.", icon: CalendarDays },
        { title: "Convites", description: "Chame a galera sem depender de mensagem solta.", icon: MailPlus },
        { title: "Copas", description: "Dê nome para a disputa quando a resenha ficar séria.", icon: Trophy }
      ]
    },
    proof: {
      eyebrow: "Mobile em primeiro lugar",
      title: "Abriu no campo, entendeu em segundos.",
      description:
        "A hierarquia privilegia o que resolve a vida com uma mão: próximo jogo, placar, quem marcou, onde foi e como ficou a fase.",
      quotes: [
        { text: "Menos print perdido. Mais rodada com memória." },
        { text: "Do apito ao ranking, o jogo continua organizado." },
        { text: "Seu futebol, seus números, sua turma em ordem." }
      ]
    },
    faq: {
      eyebrow: "FAQ",
      title: "Antes de chamar a turma.",
      items: [
        {
          question: "Serve para jogo avulso?",
          answer: "Serve. Você pode registrar uma partida simples, sem campeonato, e manter o histórico da turma."
        },
        {
          question: "Dá para usar em campeonato?",
          answer: "Dá. Quando a partida pertence a uma copa, o card mostra esse contexto junto do placar."
        },
        {
          question: "O que entra no placar?",
          answer: "Resultado, status, tempo de jogo, local, tipo de terreno, gols, assistências e minuto de cada lance."
        },
        {
          question: "O card do jogador usa dados reais?",
          answer: "Sim. Ele parte do perfil e das estatísticas registradas: jogos, gols, assistências, vitórias, forma e rating."
        }
      ]
    },
    cta: {
      eyebrow: "Próxima rodada",
      title: "Monte sua turma e registre o primeiro jogo com contexto de verdade.",
      description: "Comece simples: time, partida, placar. O histórico cresce junto com a resenha.",
      button: "Criar conta"
    },
    footer: {
      description: "Um jeito claro de organizar a resenha, fechar o placar e guardar a fase da turma.",
      product: "Produto",
      productLinks: ["Partidas", "Times", "Copas", "Cards"],
      actions: {
        login: "Acessar plataforma",
        top: "Voltar ao topo"
      },
      copyright: "NaBola. Futebol amador com contexto, memória e ritmo."
    },
    topModal: {
      title: "Quer voltar para o começo?",
      description: "A gente te leva para o topo da página sem perder o ritmo da navegação.",
      confirm: "Subir agora",
      cancel: "Continuar aqui"
    }
  },
  en: {
    nav: {
      login: "Log in",
      themeLabel: "Theme",
      localeLabel: "Language"
    },
    hero: {
      badge: "Football with friends",
      title: "Take the pickup game out of the chat and into play.",
      description:
        "Schedule the round, record the score, and keep goals, assists, venue and form easy to find later.",
      primaryCta: "Step onto the pitch",
      secondaryCta: "See the flow",
      stats: [
        { label: "Recorded matches", value: "24" },
        { label: "Goals saved", value: "31" },
        { label: "Assists", value: "12" }
      ],
      liveCard: {
        eyebrow: "Round closed",
        meta: "Saturday • 6:00 PM"
      }
    },
    preview: {
      eyebrow: "How the group follows it",
      title: "Score, card and context without digging through old messages.",
      description:
        "The landing shows what already matters to real users: match result, goal scorers, assists, venue, tournament context and player progress.",
      statTiles: [
        { label: "Win rate", value: "62.5%", helper: "A quick read on form" },
        { label: "Goals per match", value: "1.29", helper: "Average from match history" },
        { label: "Matches", value: "24", helper: "The crew's memory" }
      ],
      comparisonTitle: "Who's on top",
      comparison: [
        { label: "Blues", helper: "More goals and the better run", value: 18 },
        { label: "Vests", helper: "Competitive until the end", value: 13 },
        { label: "Blacks", helper: "Still chasing consistency", value: 9 }
      ]
    },
    features: {
      title: "The essentials of match day, handled well.",
      items: [
        {
          title: "Schedule the game",
          description: "Set date, time, teams and whether the match counts for a cup or is just for the crew.",
          icon: CalendarDays
        },
        {
          title: "Organize the squad",
          description: "Teams, members and invites stay together so the plan does not get lost.",
          icon: Users
        },
        {
          title: "Close the score",
          description: "Record goals, assists, event minutes and the final result.",
          icon: CheckCircle2
        },
        {
          title: "Track form",
          description: "The player card shows matches, goals, assists, wins, rating and current momentum.",
          icon: Medal
        }
      ]
    },
    flow: {
      eyebrow: "From invite to history",
      title: "Serious app structure with locker-room energy.",
      description:
        "NaBola does not turn pickup football into a spreadsheet. It saves what matters so the group can play, remember and talk with proof.",
      items: [
        { title: "Teams", description: "Squad, campaign and players in one place.", icon: Users },
        { title: "Matches", description: "Date, status, venue, duration and final score.", icon: CalendarDays },
        { title: "Invites", description: "Bring people in without relying on loose messages.", icon: MailPlus },
        { title: "Cups", description: "Give the rivalry a name when the crew gets serious.", icon: Trophy }
      ]
    },
    proof: {
      eyebrow: "Mobile first",
      title: "Open it on the pitch and understand it in seconds.",
      description:
        "The hierarchy prioritizes what solves the moment in one hand: next match, score, scorers, venue and current form.",
      quotes: [
        { text: "Fewer lost screenshots. More match history." },
        { text: "From whistle to leaderboard, the game stays organized." },
        { text: "Your football, your numbers, your crew in sync." }
      ]
    },
    faq: {
      eyebrow: "FAQ",
      title: "Before you invite the crew.",
      items: [
        {
          question: "Does it work for a one-off match?",
          answer: "Yes. You can record a simple match without a tournament and keep the group's history growing."
        },
        {
          question: "Can we use it for a tournament?",
          answer: "Yes. When a match belongs to a cup, the card shows that context next to the score."
        },
        {
          question: "What goes into the scoreboard?",
          answer: "Result, status, match duration, venue, surface, goals, assists and the minute of each event."
        },
        {
          question: "Does the player card use real data?",
          answer: "Yes. It uses profile and recorded stats: matches, goals, assists, wins, form and rating."
        }
      ]
    },
    cta: {
      eyebrow: "Next round",
      title: "Build your crew and record the first match with real context behind it.",
      description: "Start simple: team, match, score. The history grows with every game.",
      button: "Create account"
    },
    footer: {
      description: "A clear way to organize the crew, close the score and keep everyone's form in one place.",
      product: "Product",
      productLinks: ["Matches", "Teams", "Cups", "Cards"],
      actions: {
        login: "Open platform",
        top: "Back to top"
      },
      copyright: "NaBola. Amateur football with context, memory and rhythm."
    },
    topModal: {
      title: "Want to go back to the start?",
      description: "We can take you to the top of the page without breaking the flow.",
      confirm: "Go to top",
      cancel: "Stay here"
    }
  }
};
