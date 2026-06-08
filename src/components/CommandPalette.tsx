import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useUiStore } from "../stores/ui";
import { useMaterialsStore } from "../stores/materials";
import { useModalStore } from "../stores/modal";
import { Icon } from "./Icon";

interface Command {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  group: string;
}

export function CommandPalette() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const setActiveTab = useUiStore((s) => s.setActiveTab);
  const toggleSearch = useUiStore((s) => s.toggleSearch);
  const setTheme = useUiStore((s) => s.setTheme);
  const theme = useUiStore((s) => s.theme);
  const materials = useMaterialsStore((s) => s.materials);
  const openModal = useModalStore((s) => s.openModal);

  // Commands
  const commands = useMemo<Command[]>(() => [
    { id: "dashboard", label: t("tab_dashboard", "Dashboard"), icon: "layout-dashboard", action: () => setActiveTab("dashboard"), group: t("navigation", "Navigation") },
    { id: "materials", label: t("tab_materials", "Materials"), icon: "folder", action: () => setActiveTab("materials"), group: t("navigation", "Navigation") },
    { id: "guidelines", label: t("tab_guidelines", "Guidelines"), icon: "book-open", action: () => setActiveTab("guidelines"), group: t("navigation", "Navigation") },
    { id: "search", label: t("search_title", "Search"), icon: "search", action: () => { toggleSearch(); }, group: t("actions", "Actions") },
    { id: "toggle-theme", label: theme === "dark" ? t("theme_light", "Light theme") : t("theme_dark", "Dark theme"), icon: theme === "dark" ? "sun" : "moon", action: () => setTheme(theme === "dark" ? "light" : "dark"), group: t("actions", "Actions") },
  ], [t, setActiveTab, toggleSearch, setTheme, theme]);

  // Material commands (top 10 by name match)
  const materialCommands = useMemo<Command[]>(() => {
    if (!query.trim() || query.length < 2) return [];
    const q = query.toLowerCase();
    return materials
      .filter((m) => m.title.toLowerCase().includes(q))
      .slice(0, 8)
      .map((m) => ({
        id: `mat-${m.document_id}`,
        label: m.title,
        icon: "file-text",
        action: () => openModal(m),
        group: t("materials_label", "Materials"),
      }));
  }, [query, materials, openModal, t]);

  const allCommands = useMemo(() => {
    const q = query.toLowerCase().trim();
    const filtered = q
      ? commands.filter((c) => c.label.toLowerCase().includes(q))
      : commands;
    return [...filtered, ...materialCommands];
  }, [commands, materialCommands, query]);

  // Keyboard shortcut: ⌘K / Ctrl+K
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Focus input when opening
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Reset selection on query change
  useEffect(() => { setSelectedIdx(0); }, [query]);

  const close = useCallback(() => setOpen(false), []);

  const runCommand = useCallback((cmd: Command) => {
    cmd.action();
    close();
  }, [close]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx((i) => Math.min(i + 1, allCommands.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && allCommands[selectedIdx]) { e.preventDefault(); runCommand(allCommands[selectedIdx]); }
    else if (e.key === "Escape") { close(); }
  }, [allCommands, selectedIdx, runCommand, close]);

  if (!open) return null;

  // Group commands
  const groups = new Map<string, Command[]>();
  for (const cmd of allCommands) {
    const list = groups.get(cmd.group) || [];
    list.push(cmd);
    groups.set(cmd.group, list);
  }

  return (
    <div className="command-palette-backdrop" onClick={close}>
      <div className="command-palette" onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <div className="command-palette-input-wrap">
          <Icon name="search" size={16} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("command_placeholder", "Type a command or search...")}
            className="command-palette-input"
          />
          <kbd className="command-palette-kbd">Esc</kbd>
        </div>

        <div className="command-palette-list">
          {allCommands.length === 0 && (
            <div className="command-palette-empty">{t("no_commands", "No results")}</div>
          )}
          {Array.from(groups.entries()).map(([group, cmds]) => (
            <div key={group}>
              <div className="command-palette-group">{group}</div>
              {cmds.map((cmd) => {
                const idx = allCommands.indexOf(cmd);
                return (
                  <button
                    key={cmd.id}
                    type="button"
                    className={`command-palette-item${idx === selectedIdx ? " selected" : ""}`}
                    onClick={() => runCommand(cmd)}
                    onMouseEnter={() => setSelectedIdx(idx)}
                  >
                    <Icon name={cmd.icon} size={16} />
                    <span>{cmd.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
