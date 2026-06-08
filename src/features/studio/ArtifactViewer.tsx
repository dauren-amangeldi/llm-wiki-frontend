import { create } from "zustand";
import { Modal } from "../../components/Modal";
import { useTranslation } from "react-i18next";
import { TestRenderer } from "./TestRenderer";
import { PresentationRenderer } from "./PresentationRenderer";
import { ReportRenderer } from "./ReportRenderer";
import { CardsRenderer } from "./CardsRenderer";
import { PodcastRenderer } from "./PodcastRenderer";
import { InfographicRenderer } from "./InfographicRenderer";
import { ExportButtons } from "./ExportButtons";
import { Icon } from "../../components/Icon";

/* ── Zustand store ── */

interface ArtifactState {
  open: boolean;
  artifactId: string | null;
  kind: string | null;
  content: unknown;
  openArtifact: (id: string, kind: string, content: unknown) => void;
  closeArtifact: () => void;
}

export const useArtifactStore = create<ArtifactState>((set) => ({
  open: false,
  artifactId: null,
  kind: null,
  content: null,
  openArtifact: (id, kind, content) => set({ open: true, artifactId: id, kind, content }),
  closeArtifact: () => set({ open: false, artifactId: null, kind: null, content: null }),
}));

/* ── Renderer map ── */

const RENDERERS: Record<string, React.FC<{ content: unknown }>> = {
  test: TestRenderer,
  presentation: PresentationRenderer,
  report: ReportRenderer,
  card: CardsRenderer,
  cards: CardsRenderer,
  podcast: PodcastRenderer,
  infographic: InfographicRenderer,
};

/* ── Component ── */

export function ArtifactViewer() {
  const { t } = useTranslation();
  const { open, artifactId, kind, content, closeArtifact } = useArtifactStore();

  if (!open || !kind) return null;

  const Renderer = RENDERERS[kind];

  return (
    <Modal open={open} onClose={closeArtifact} className={kind === "presentation" || kind === "infographic" ? "modal-presentation" : ""}>
      <div className="artifact-viewer" data-kind={kind}>
        <header className="artifact-header">
          <h2>{t(`studio_${kind === "card" ? "cards" : kind}`, kind)}</h2>
          <button type="button" className="icon-button artifact-close" onClick={closeArtifact} aria-label={t("close")}>
            <Icon name="x" size={20} />
          </button>
        </header>

        <div className="artifact-body">
          {Renderer ? (
            <Renderer content={content} />
          ) : (
            <p className="prose-muted">{t("unsupported_artifact")}</p>
          )}
        </div>

        {artifactId && (
          <footer className="artifact-footer">
            <ExportButtons artifactId={artifactId} kind={kind} audioUrl={(content as { audio_url?: string })?.audio_url} />
          </footer>
        )}
      </div>
    </Modal>
  );
}
