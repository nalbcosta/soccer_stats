import { CalendarDays, CheckCircle2, MailPlus, Medal, Trophy, Users } from "lucide-react";
import type { LandingDictionary } from "../landing-types";

export const landing: LandingDictionary = {
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
  };
