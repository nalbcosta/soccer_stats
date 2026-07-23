import { CalendarDays, CheckCircle2, MailPlus, Medal, Trophy, Users } from "lucide-react";
import type { LandingDictionary } from "../landing-types";

export const landing: LandingDictionary = {
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
  };
