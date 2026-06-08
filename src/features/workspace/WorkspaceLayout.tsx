import { lazy, Suspense, useEffect, useRef } from "react";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { WorkspaceTabs } from "./WorkspaceTabs";
import { ConfidentialFooter } from "./ConfidentialFooter";
import { useUiStore } from "../../stores/ui";
import { useAuthStore } from "../../stores/auth";
import { Toast } from "../../components/Toast";
import { ShortcutsPanel } from "../../components/ShortcutsPanel";
import { CardSkeleton } from "../../components/Skeleton";
import { BulkActionBar } from "../materials/BulkActionBar";
import { Onboarding } from "../../components/Onboarding";
import { ErrorBoundary } from "../../components/ErrorBoundary";

const DashboardPanel = lazy(() => import("../dashboard/DashboardPanel").then(m => ({ default: m.DashboardPanel })));
const MaterialsPanel = lazy(() => import("../materials/MaterialsPanel").then(m => ({ default: m.MaterialsPanel })));
const SkillsPanel = lazy(() => import("../skills/SkillsPanel").then(m => ({ default: m.SkillsPanel })));
const GuidelinesPanel = lazy(() => import("../guidelines/GuidelinesPanel").then(m => ({ default: m.GuidelinesPanel })));

function TabFallback() {
  return (
    <div className="workspace-panel" style={{ padding: 24 }}>
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}

export function WorkspaceLayout() {
  const activeTab = useUiStore((s) => s.activeTab);
  const setActiveTab = useUiStore((s) => s.setActiveTab);
  const role = useAuthStore((s) => s.session?.role);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  useEffect(() => {
    const VALID_TABS = ["dashboard", "materials", "skills", "guidelines"] as const;
    type ValidTab = typeof VALID_TABS[number];

    function getTabFromURL(): ValidTab {
      const raw = new URLSearchParams(window.location.search).get("tab");
      if (!raw || !(VALID_TABS as readonly string[]).includes(raw)) return "dashboard";
      if (raw === "skills" && role !== "admin") return "dashboard";
      return raw as ValidTab;
    }

    setActiveTab(getTabFromURL());

    function onPopState() {
      setActiveTab(getTabFromURL());
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [role, setActiveTab]);

  return (
    <div className="workspace-screen">
      <a href="#main-content" className="skip-link">Перейти к содержимому</a>
      <WorkspaceHeader />
      <div id="main-content" className="workspace-main" ref={mainRef}>
        <WorkspaceTabs />
        <Suspense fallback={<TabFallback />}>
          <div className="tab-content" key={activeTab} data-tab={activeTab}>
            {activeTab === "dashboard" && <ErrorBoundary><DashboardPanel /></ErrorBoundary>}
            {activeTab === "materials" && <ErrorBoundary><MaterialsPanel /></ErrorBoundary>}
            {activeTab === "skills" && <ErrorBoundary><SkillsPanel /></ErrorBoundary>}
            {activeTab === "guidelines" && <ErrorBoundary><GuidelinesPanel /></ErrorBoundary>}
          </div>
        </Suspense>
        <ConfidentialFooter />
      </div>
      <Toast />
      <ShortcutsPanel />
      <BulkActionBar />
      <Onboarding />
    </div>
  );
}
