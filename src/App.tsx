import { useAuthStore } from "./stores/auth";
import { LoginPage } from "./features/auth/LoginPage";
import { WorkspaceLayout } from "./features/workspace/WorkspaceLayout";
import { MaterialModal } from "./features/modal/MaterialModal";
import { ArtifactViewer } from "./features/studio/ArtifactViewer";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { CommandPalette } from "./components/CommandPalette";

export function App() {
  const session = useAuthStore((s) => s.session);
  return (
    <ErrorBoundary>
      {session ? <WorkspaceLayout /> : <LoginPage />}
      <MaterialModal />
      <ArtifactViewer />
      {session && <CommandPalette />}
    </ErrorBoundary>
  );
}
