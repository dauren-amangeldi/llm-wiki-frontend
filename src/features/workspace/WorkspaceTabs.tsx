import { useUiStore } from "../../stores/ui";
import { useAuthStore } from "../../stores/auth";
import { useMaterialsStore } from "../../stores/materials";
import { useTranslation } from "react-i18next";
import { Icon } from "../../components/Icon";

const TABS = [
  { key: "dashboard" as const, label: "tab_dashboard", icon: "home" },
  { key: "materials" as const, label: "tab_materials", icon: "file-text" },
  { key: "wiki" as const, label: "tab_wiki", icon: "book-open" },
  { key: "skills" as const, label: "tab_skills", icon: "brain", adminOnly: true },
  { key: "guidelines" as const, label: "tab_guidelines", icon: "book-open" },
];

export function WorkspaceTabs() {
  const { t } = useTranslation();
  const activeTab = useUiStore((s) => s.activeTab);
  const setActiveTab = useUiStore((s) => s.setActiveTab);
  const role = useAuthStore((s) => s.session?.role);
  const materialsCount = useMaterialsStore((s) => s.materials.length);

  const counts: Record<string, number | undefined> = {
    materials: materialsCount || undefined,
  };

  return (
    <div className="workspace-tabs" role="tablist">
      {TABS.filter((tab) => !tab.adminOnly || role === "admin").map((tab) => (
        <button
          key={tab.key}
          role="tab"
          aria-selected={activeTab === tab.key}
          className={`workspace-tab${activeTab === tab.key ? " active" : ""}`}
          data-tab={tab.key}
          onClick={() => {
            setActiveTab(tab.key);
            window.history.pushState({}, "", `?tab=${tab.key}`);
          }}
        >
          <Icon name={tab.icon} size={16} />
          {t(tab.label)}
          {counts[tab.key] != null && (
            <span className="tab-count">{counts[tab.key]}</span>
          )}
        </button>
      ))}
    </div>
  );
}
