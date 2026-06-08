import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useKeyboard } from "../../hooks/useKeyboard";
import { useUiStore } from "../../stores/ui";
import { Modal } from "../../components/Modal";
import { Icon } from "../../components/Icon";
import { SearchPanel } from "./SearchPanel";
import { AdvisorPanel } from "./AdvisorPanel";

type Tab = "search" | "advisor";

export function SearchOverlay() {
  const { t } = useTranslation();
  const open = useUiStore((s) => s.searchOpen);
  const toggleSearch = useUiStore((s) => s.toggleSearch);
  const closeSearch = useUiStore((s) => s.closeSearch);
  const [tab, setTab] = useState<Tab>("search");

  const toggle = useCallback(() => {
    toggleSearch();
  }, [toggleSearch]);

  const close = useCallback(() => {
    closeSearch();
  }, [closeSearch]);

  useKeyboard("k", toggle, true);

  const tabs: { value: Tab; label: string; icon: string }[] = [
    { value: "search", label: t("search.tabSearch", "Search"), icon: "search" },
    { value: "advisor", label: t("search.tabAdvisor", "Advisor"), icon: "message-circle" },
  ];

  return (
    <Modal open={open} onClose={close}>
      <div className="search-overlay-backdrop">
        <div className="search-overlay-panel">
          {/* Tab bar */}
          <div className="search-overlay-tabs">
            {tabs.map((tb) => (
              <button
                key={tb.value}
                type="button"
                onClick={() => setTab(tb.value)}
                className={`search-overlay-tab${tab === tb.value ? " active" : ""}`}
              >
                <Icon name={tb.icon} size={14} />
                {tb.label}
              </button>
            ))}
            <span className="search-overlay-hint">
              <kbd className="search-kbd">Esc</kbd>
            </span>
          </div>

          {/* Active panel */}
          <div className="search-overlay-body">
            {tab === "search" ? <SearchPanel onClose={close} /> : <AdvisorPanel />}
          </div>
        </div>
      </div>
    </Modal>
  );
}
