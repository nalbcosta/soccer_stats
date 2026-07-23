import { ClipboardList, Users, Zap } from "lucide-react";
import type { MatchDetailTab } from "../../composables/use-match-detail";
import { useTranslations } from "../../i18n/provider";

const tabs: Array<{ key: MatchDetailTab; label: string; icon: typeof Zap }> = [
  { key: "overview", label: "overview", icon: Zap },
  { key: "presence", label: "presence", icon: Users },
  { key: "sheet", label: "sheet", icon: ClipboardList }
];

export function MatchDetailTabs({ activeTab, onChange }: { activeTab: MatchDetailTab; onChange: (tab: MatchDetailTab) => void }) {
  const t = useTranslations("match");
  return (
    <div className="grid grid-cols-3 gap-1 rounded-lg border border-border bg-surface p-1 shadow-line">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.key;

        return (
          <button
            className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-black sm:text-sm ${
              active ? "bg-primary-soft text-primary-strong" : "text-muted"
            }`}
            key={tab.key}
            onClick={() => onChange(tab.key)}
            type="button"
          >
            <Icon size={15} />
            {t(tab.label)}
          </button>
        );
      })}
    </div>
  );
}
