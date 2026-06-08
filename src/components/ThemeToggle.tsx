import { useUiStore } from "../stores/ui";
import { Icon } from "./Icon";

export function ThemeToggle() {
  const { theme, setTheme } = useUiStore();
  const isDark = theme === "dark";

  const toggle = () => setTheme(isDark ? "light" : "dark");

  return (
    <div
      className="theme-toggle"
      data-active={isDark}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      }}
      role="switch"
      tabIndex={0}
      aria-checked={isDark}
      aria-label="Toggle dark mode"
    >
      {/* Track icon: moon on right (light mode) / sun on left (dark mode) */}
      <span className="theme-toggle-track-icon">
        <Icon name={isDark ? "sun" : "moon"} size={12} />
      </span>
      {/* Knob with active icon inside */}
      <div className="theme-toggle-knob">
        <Icon name={isDark ? "moon" : "sun"} size={13} />
      </div>
    </div>
  );
}
