import { useTranslation } from "react-i18next";
import { Icon } from "../../components/Icon";

interface TranscriptSegment { speaker: string; text: string; }

export function PodcastRenderer({ content }: { content: unknown }) {
  const { t } = useTranslation();
  const data = content as {
    audio_url?: string;
    transcript?: string | TranscriptSegment[];
  } | null;

  const segments: TranscriptSegment[] = (() => {
    if (!data?.transcript) return [];
    if (typeof data.transcript === "string") {
      return data.transcript.split("\n\n").filter(Boolean).map((line) => {
        const colonIdx = line.indexOf(":");
        if (colonIdx > 0 && colonIdx < 30) {
          return { speaker: line.slice(0, colonIdx).trim(), text: line.slice(colonIdx + 1).trim() };
        }
        return { speaker: "", text: line };
      });
    }
    return data.transcript;
  })();

  return (
    <div className="podcast-player">
      {data?.audio_url ? (
        <div className="podcast-audio-row">
          <audio controls style={{ flex: 1 }} src={data.audio_url} />
          <a href={data.audio_url} download className="btn btn-ghost podcast-download" title={t("download_mp3", "Скачать MP3")}>
            <Icon name="download" size={18} />
          </a>
        </div>
      ) : (
        <p className="prose-muted">{t("no_audio", "Нет аудио")}</p>
      )}
      {segments.length > 0 && (
        <div className="podcast-transcript">
          <h4 className="podcast-transcript-title">{t("transcript", "Транскрипт")}</h4>
          {segments.map((seg, i) => {
            const speakerNum = seg.speaker.includes("1") || seg.speaker.includes("A") ? 1 : 2;
            return (
              <div key={i} className={`podcast-segment speaker-${speakerNum}`}>
                {seg.speaker && <span className="podcast-speaker">{seg.speaker}</span>}
                <p className="podcast-text">{seg.text}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
