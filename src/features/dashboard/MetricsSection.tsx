import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { Icon } from "../../components/Icon";
import { MetricsSkeleton } from "../../components/Skeleton";
import { useFetch } from "../../hooks/useFetch";

/* ── Types ── */
interface Stats {
  total_cases: number;
  studied_cases: number;
  artifacts_generated: number;
  questions_asked: number;
}

interface ActivityDay {
  date: string;
  questions: number;
  generations: number;
}

interface TagDist {
  name: string;
  count: number;
}

interface MetricsData {
  stats: Stats;
  activity: ActivityDay[];
  tags_distribution: TagDist[];
}

/* ── Animated counter hook ── */
function useAnimatedCounter(target: number, duration = 1200): number {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    const start = performance.now();
    const from = 0;
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);
  return value;
}

/* ── Stat card ── */
function StatCard({ icon, label, value, accent, progress }: { icon: string; label: string; value: number; accent: string; progress: number }) {
  const animated = useAnimatedCounter(value);
  const pct = Math.min(Math.max(progress, 0), 100);
  return (
    <div className="metrics-stat-card" style={{ "--stat-accent": accent } as React.CSSProperties}>
      <div className="metrics-stat-progress" style={{ width: `${pct}%` }} />
      <div className="metrics-stat-icon">
        <Icon name={icon} size={22} />
      </div>
      <div className="metrics-stat-value">{animated.toLocaleString()}</div>
      <div className="metrics-stat-label">{label}</div>
    </div>
  );
}

/* ── Custom tooltip ── */
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="metrics-tooltip">
      <div className="metrics-tooltip-label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="metrics-tooltip-row">
          <span className="metrics-tooltip-dot" style={{ background: p.color }} />
          <span>{p.name}: <strong>{p.value}</strong></span>
        </div>
      ))}
    </div>
  );
}

/* ── Donut chart colors ── */
const DONUT_COLORS = [
  "var(--brand-cta)", "#6366f1", "#8b5cf6", "#ec4899",
  "#f59e0b", "#10b981", "#06b6d4", "#f97316",
];

/* ── Main component ── */
export function MetricsSection() {
  const { t } = useTranslation();
  const { data, loading } = useFetch<MetricsData>("/api/v1/metrics");

  if (loading) return <MetricsSkeleton />;

  if (!data) return null;

  const { stats, activity, tags_distribution } = data;

  // Format short date for x-axis
  const activityFormatted = activity.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString(undefined, { day: "numeric", month: "short" }),
  }));

  return (
    <div className="metrics-section">
      {/* Stat cards */}
      <div className="metrics-stats-row">
        <StatCard icon="file-text" label={t("metric_total_cases", "Кейсов в базе")} value={stats.total_cases} accent="var(--brand-cta)" progress={100} />
        <StatCard icon="circle-check" label={t("metric_studied", "Изучено")} value={stats.studied_cases} accent="#10b981" progress={stats.total_cases > 0 ? Math.round((stats.studied_cases / stats.total_cases) * 100) : 0} />
        <StatCard icon="sparkles" label={t("metric_artifacts", "Артефактов")} value={stats.artifacts_generated} accent="#8b5cf6" progress={stats.total_cases > 0 ? Math.min(Math.round((stats.artifacts_generated / stats.total_cases) * 100), 100) : 0} />
        <StatCard icon="message-circle" label={t("metric_questions", "Вопросов")} value={stats.questions_asked} accent="#f59e0b" progress={stats.total_cases > 0 ? Math.min(Math.round((stats.questions_asked / stats.total_cases) * 100), 100) : 0} />
      </div>

      {/* Charts row */}
      <div className="metrics-charts-row">
        {/* Activity area chart */}
        <div className="metrics-chart-card metrics-chart-wide">
          <h4 className="metrics-chart-title">{t("metric_activity", "Активность за 7 дней")}</h4>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={activityFormatted} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradQuestions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--brand-cta)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--brand-cta)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradGenerations" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone" dataKey="questions" name={t("metric_questions_short", "Вопросы")}
                stroke="var(--brand-cta)" strokeWidth={2} fill="url(#gradQuestions)"
                dot={false} activeDot={{ r: 4, stroke: "var(--brand-cta)", strokeWidth: 2, fill: "var(--surface)" }}
              />
              <Area
                type="monotone" dataKey="generations" name={t("metric_generations_short", "Генерации")}
                stroke="#8b5cf6" strokeWidth={2} fill="url(#gradGenerations)"
                dot={false} activeDot={{ r: 4, stroke: "#8b5cf6", strokeWidth: 2, fill: "var(--surface)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Tags donut */}
        <div className="metrics-chart-card">
          <h4 className="metrics-chart-title">{t("metric_tags", "Теги")}</h4>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={tags_distribution}
                dataKey="count"
                nameKey="name"
                cx="50%" cy="50%"
                innerRadius={55} outerRadius={85}
                paddingAngle={3}
                stroke="none"
              >
                {tags_distribution.map((_, i) => (
                  <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="metrics-donut-legend">
            {tags_distribution.slice(0, 6).map((tag, i) => (
              <span key={tag.name} className="metrics-legend-item">
                <span className="metrics-legend-dot" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
