import { CheckCircle2, CircleHelp, Clock3, XCircle } from "lucide-react";
import type { MatchParticipant } from "../../lib/matches/match-view-model";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { useTranslations } from "../../i18n/provider";

const presenceLabel = { confirmed: "presenceConfirmed", declined: "presenceDeclined", maybe: "maybe", pending: "presencePending" } as const;

export function MatchPresencePanel({
  canCheckIn,
  isPending,
  onCheckIn,
  onPresence,
  participants
}: {
  canCheckIn: boolean;
  isPending: boolean;
  onCheckIn: () => void;
  onPresence: (status: "confirmed" | "declined" | "maybe") => void;
  participants: MatchParticipant[];
}) {
  const t = useTranslations("match");
  const confirmed = participants.filter((participant) => participant.presence?.status === "confirmed").length;
  const checkedIn = participants.filter((participant) => participant.checkedIn).length;

  return (
    <div className="grid gap-4">
      <Card className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-muted">{t("presence")}</p>
            <p className="mt-1 text-xl font-black">{t("confirmedCount", { count: confirmed })}</p>
            <p className="mt-1 text-sm font-semibold text-muted">{t("checkedInCount", { count: checkedIn })}</p>
          </div>
          {canCheckIn ? (
            <Button disabled={isPending} onClick={onCheckIn} type="button" variant="secondary">
              <CheckCircle2 size={16} />
              {t("checkIn")}
            </Button>
          ) : null}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Button disabled={isPending} onClick={() => onPresence("confirmed")} type="button">
            {t("going")}
          </Button>
          <Button disabled={isPending} onClick={() => onPresence("maybe")} type="button" variant="secondary">
            {t("maybe")}
          </Button>
          <Button disabled={isPending} onClick={() => onPresence("declined")} type="button" variant="secondary">
            {t("notGoing")}
          </Button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {participants.map((participant) => (
          <div className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0" key={`${participant.side}-${participant.userId}`}>
            <PresenceIcon status={participant.presence?.status ?? "pending"} />
            <div className="min-w-0 flex-1">
              <p className="font-black">{participant.label}</p>
              <p className="text-sm font-semibold text-muted">{participant.side === "home" ? t("home") : t("away")}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-black uppercase text-muted">{t(presenceLabel[participant.presence?.status ?? "pending"])}</p>
              {participant.checkedIn ? <p className="text-xs font-black text-primary-strong">{t("checkIn")}</p> : null}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function PresenceIcon({ status }: { status: keyof typeof presenceLabel }) {
  const iconClass = status === "confirmed" ? "bg-success-soft text-success" : status === "declined" ? "bg-error-soft text-error" : "bg-canvas text-muted";
  const Icon = status === "confirmed" ? CheckCircle2 : status === "declined" ? XCircle : status === "maybe" ? CircleHelp : Clock3;

  return (
    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${iconClass}`}>
      <Icon size={18} />
    </span>
  );
}
