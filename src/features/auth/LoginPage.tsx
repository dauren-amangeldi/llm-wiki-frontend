import { useState, useEffect, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore, type Session } from "../../stores/auth";
import { useUiStore } from "../../stores/ui";
import { apiFetch } from "../../api/client";
import { Icon } from "../../components/Icon";

const FEATURES = [
  { icon: "brain", titleKey: "feature_one_title", copyKey: "feature_one_copy" },
  { icon: "search", titleKey: "feature_two_title", copyKey: "feature_two_copy" },
  { icon: "shield-check", titleKey: "feature_three_title", copyKey: "feature_three_copy" },
] as const;

const LANGUAGES = [
  { code: "kk" as const, label: "Қазақша" },
  { code: "ru" as const, label: "Русский" },
  { code: "en" as const, label: "English" },
];

export function LoginPage() {
  const { t, i18n } = useTranslation();
  const login = useAuthStore((s) => s.login);
  const { language, setLanguage, theme, setTheme } = useUiStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (i18n.language !== language) i18n.changeLanguage(language);
  }, [i18n, language]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // For demo: allow empty credentials (auto-login as demo user)
      const demoEmail = email.trim() || "demo@bi.group";
      const session = await apiFetch<Session>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: demoEmail, password: password || "demo" }),
      });
      login(session);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      {/* ── Left panel: form ── */}
      <div className="login-panel">
        <div className="login-logo-wrap">
          <img src="/logo.svg" alt="BI AQYL" className="login-logo" />
        </div>

        {/* Center content */}
        <div className="login-content">
        <div className="login-copy-block">
          <h1>{t("login_title")}</h1>
          <p className="lead">{t("login_copy")}</p>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <label className="field-label" htmlFor="login-email">{t("field_email")}</label>
          <div className="email-input-shell input-with-icon">
            <span className="field-icon" aria-hidden="true"><Icon name="mail" size={18} /></span>
            <input
              id="login-email"
              type="text"
              autoComplete="username"
              className="field-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("email_placeholder") || "name"}
              aria-invalid={!!error}
              aria-describedby={error ? "login-error" : undefined}
            />
            <span className="email-suffix">@bi.group</span>
          </div>

          {/* Password */}
          <label className="field-label" htmlFor="login-password">{t("field_password")}</label>
          <div className="input-with-icon" style={{ position: "relative" }}>
            <span className="field-icon" aria-hidden="true"><Icon name="lock" size={18} /></span>
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className="field-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("password_placeholder") || "Введите пароль"}
              aria-invalid={!!error}
              aria-describedby={error ? "login-error" : undefined}
            />
            <button
              type="button"
              className="field-icon-end"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <Icon name={showPassword ? "eye-off" : "eye"} size={18} />
            </button>
          </div>

          {/* Error */}
          {error && (
            <p id="login-error" role="alert" className="login-error">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-login"
          >
            {loading ? <Icon name="loader-circle" size={18} className="animate-spin" /> : <><Icon name="log-in" size={18} /> {t("login_button")}</>}
          </button>
        </form>

        <p className="login-footnote">{t("login_hint")}</p>
        </div>

        {/* Utilities: theme + language at bottom */}
        <div className="login-utilities">
          <div
            className="theme-toggle"
            data-active={theme === "dark"}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setTheme(theme === "dark" ? "light" : "dark");
              }
            }}
            role="switch"
            tabIndex={0}
            aria-checked={theme === "dark"}
            aria-label="Toggle dark mode"
          >
            <span className="theme-toggle-track-icon">
              <Icon name={theme === "dark" ? "sun" : "moon"} size={12} />
            </span>
            <div className="theme-toggle-knob">
              <Icon name={theme === "dark" ? "moon" : "sun"} size={13} />
            </div>
          </div>

          <div className="language-slider compact" role="tablist">
            {LANGUAGES.map(({ code, label }) => (
              <button
                key={code}
                role="tab"
                aria-selected={language === code}
                className={`language-slider-btn${language === code ? " active" : ""}`}
                onClick={() => { setLanguage(code); i18n.changeLanguage(code); }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel: dark stage ── */}
      <aside className="login-stage" aria-label="Краткое описание">
        <div className="stage-gradient stage-gradient-a" />
        <div className="stage-gradient stage-gradient-b" />

        <div className="stage-card">
          <p className="stage-eyebrow">{t("login_stage_eyebrow")}</p>
          <h2>{t("login_stage_title")}</h2>
          <p className="stage-copy">{t("login_stage_copy")}</p>

          <div className="stage-feature-list">
            {FEATURES.map((f) => (
              <article className="stage-feature" key={f.titleKey}>
                <span className="stage-feature-index"><Icon name={f.icon} size={20} /></span>
                <div>
                  <div className="stage-feature-title">{t(f.titleKey)}</div>
                  <p>{t(f.copyKey)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
