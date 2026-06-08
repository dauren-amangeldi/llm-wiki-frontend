/**
 * Prune localStorage entries for deleted documents.
 * Call periodically or on app start.
 */

const MAX_BOOKMARKS = 500;
const MAX_NOTES = 200;

export function pruneLocalStorage(validDocIds?: Set<string>) {
  // Bookmarks — cap size
  try {
    const raw = localStorage.getItem("bookmarks");
    if (raw) {
      let ids: string[] = JSON.parse(raw);
      if (validDocIds) ids = ids.filter((id) => validDocIds.has(id));
      if (ids.length > MAX_BOOKMARKS) ids = ids.slice(-MAX_BOOKMARKS);
      localStorage.setItem("bookmarks", JSON.stringify(ids));
    }
  } catch { /* ignore */ }

  // Notes — cap size, prune deleted docs
  try {
    const raw = localStorage.getItem("material-notes");
    if (raw) {
      const notes: Record<string, string> = JSON.parse(raw);
      const keys = Object.keys(notes);
      if (validDocIds) {
        for (const k of keys) {
          if (!validDocIds.has(k)) delete notes[k];
        }
      }
      // Cap: keep most recent entries
      const remaining = Object.keys(notes);
      if (remaining.length > MAX_NOTES) {
        const toDelete = remaining.slice(0, remaining.length - MAX_NOTES);
        for (const k of toDelete) delete notes[k];
      }
      localStorage.setItem("material-notes", JSON.stringify(notes));
    }
  } catch { /* ignore */ }
}
