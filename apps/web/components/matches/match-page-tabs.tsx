import { Compass, ListChecks } from "lucide-react";
import type { MatchPageTab } from "../../composables/use-matches-page";
import { useTranslations } from "../../i18n/provider";

const tabs: Array<{ key: MatchPageTab; label: string; icon: typeof ListChecks }> = [
  { key: "mine", label: "myMatches", icon: ListChecks },
  { key: "nearby", label: "nearby", icon: Compass }
];

export function MatchPageTabs({ activeTab, onChange }: { activeTab: MatchPageTab; onChange: (tab: MatchPageTab) => void }) {
  const t = useTranslations("match");
  return (
    <div className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-surface p-1 shadow-line">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.key;

        return (
          <button
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-black ${
              active ? "bg-primary-soft text-primary-strong" : "text-muted"
            }`}
            key={tab.key}
            onClick={() => onChange(tab.key)}
            type="button"
          >
            <Icon size={16} />
            {t(tab.label)}
          </button>
        );
      })}
    </div>
  );
}
