import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  CalendarDays,
  Check,
  Clock3,
  Coffee,
  Database,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Save,
  Settings2,
  Target,
  Timer,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TimerMode = "FOCUS" | "SHORT_BREAK" | "LONG_BREAK";
type RangePreset = "7" | "30" | "90" | "custom";
type ApiState = "loading" | "connected" | "offline";

interface StudySession {
  id: number;
  subject: string;
  durationMinutes: number;
  studiedOn: string;
  completedAt: string;
  source: "POMODORO" | "MANUAL";
}

interface TimerPreferences {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsUntilLongBreak: number;
}

const DEFAULT_PREFERENCES: TimerPreferences = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsUntilLongBreak: 4,
};

const OWNER_STORAGE_KEY = "moeen-study-owner";
const API_BASE = ((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "/api").replace(/\/$/, "");

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(value: string, amount: number) {
  const date = parseLocalDate(value);
  date.setDate(date.getDate() + amount);
  return localDateKey(date);
}

function daysBetween(from: string, to: string) {
  return Math.max(1, Math.round((parseLocalDate(to).getTime() - parseLocalDate(from).getTime()) / 86_400_000) + 1);
}

function startOfWeek(value: string) {
  const date = parseLocalDate(value);
  const day = date.getDay();
  date.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
  return localDateKey(date);
}

function getOwnerKey() {
  const existing = window.localStorage.getItem(OWNER_STORAGE_KEY);
  if (existing) return existing;
  const created = window.crypto?.randomUUID?.() ?? `browser-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(OWNER_STORAGE_KEY, created);
  return created;
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const hours = minutes / 60;
  return `${hours.toFixed(Number.isInteger(hours) ? 0 : 1)}h`;
}

function formatTimer(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function minutesForMode(mode: TimerMode, preferences: TimerPreferences) {
  if (mode === "SHORT_BREAK") return preferences.shortBreakMinutes;
  if (mode === "LONG_BREAK") return preferences.longBreakMinutes;
  return preferences.focusMinutes;
}

function modeLabel(mode: TimerMode) {
  if (mode === "SHORT_BREAK") return "Short break";
  if (mode === "LONG_BREAK") return "Long break";
  return "Focus session";
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ElementType;
  tone: "indigo" | "sky" | "amber" | "emerald";
}) {
  const styles = {
    indigo: "bg-indigo-400/10 text-indigo-400",
    sky: "bg-sky-400/10 text-sky-400",
    amber: "bg-amber-400/10 text-amber-400",
    emerald: "bg-emerald-400/10 text-emerald-400",
  }[tone];

  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-3 min-w-0">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${styles}`}>
        <Icon size={17} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-1 text-xl font-bold text-foreground leading-none" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{value}</p>
        <p className="mt-1.5 text-[11px] text-muted-foreground truncate">{detail}</p>
      </div>
    </div>
  );
}

function SettingField({ label, value, min, max, onChange }: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-1.5 h-9 flex items-center rounded-lg border border-border bg-background overflow-hidden">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="w-8 h-full grid place-items-center text-muted-foreground hover:bg-muted" aria-label={`Decrease ${label}`}>
          <Minus size={12} />
        </button>
        <input
          aria-label={label}
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(event) => onChange(Math.min(max, Math.max(min, Number(event.target.value) || min)))}
          className="w-full min-w-0 text-center text-xs font-semibold bg-transparent outline-none"
        />
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} className="w-8 h-full grid place-items-center text-muted-foreground hover:bg-muted" aria-label={`Increase ${label}`}>
          <Plus size={12} />
        </button>
      </div>
    </label>
  );
}

function StudyChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length || !label) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      <p className="text-[10px] text-muted-foreground">{parseLocalDate(label).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</p>
      <p className="mt-0.5 text-sm font-semibold text-foreground">{payload[0].value.toFixed(1)} hours</p>
    </div>
  );
}

function ManualLogModal({ onClose, onSave, saving }: {
  onClose: () => void;
  onSave: (subject: string, durationMinutes: number, studiedOn: string) => Promise<void>;
  saving: boolean;
}) {
  const [subject, setSubject] = useState("General study");
  const [duration, setDuration] = useState(60);
  const [studiedOn, setStudiedOn] = useState(localDateKey());

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSave(subject, duration, studiedOn);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button aria-label="Close" className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" onClick={onClose} />
      <form onSubmit={submit} className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-start justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Log study time</h2>
            <p className="text-xs text-muted-foreground mt-1">Add a session you completed away from the timer.</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 grid place-items-center rounded-lg text-muted-foreground hover:bg-muted"><X size={15} /></button>
        </div>
        <div className="p-5 space-y-4">
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">What did you study?</span>
            <input autoFocus required maxLength={120} value={subject} onChange={(event) => setSubject(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/40" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Minutes</span>
              <input required type="number" min={1} max={1440} value={duration} onChange={(event) => setDuration(Number(event.target.value))} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/40" />
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Date</span>
              <input required type="date" max={localDateKey()} value={studiedOn} onChange={(event) => setStudiedOn(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/40" />
            </label>
          </div>
        </div>
        <div className="flex gap-2 px-5 py-4 border-t border-border bg-white/[0.025] rounded-b-2xl">
          <button type="button" onClick={onClose} className="flex-1 h-9 rounded-lg border border-border bg-card text-sm font-medium text-muted-foreground hover:bg-muted">Cancel</button>
          <button disabled={saving} type="submit" className="flex-1 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-60">
            <Save size={14} />{saving ? "Saving..." : "Save session"}
          </button>
        </div>
      </form>
    </div>
  );
}

export function StudyPage() {
  const ownerKey = useMemo(getOwnerKey, []);
  const today = localDateKey();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [preferences, setPreferences] = useState<TimerPreferences>(DEFAULT_PREFERENCES);
  const [draftPreferences, setDraftPreferences] = useState<TimerPreferences>(DEFAULT_PREFERENCES);
  const [apiState, setApiState] = useState<ApiState>("loading");
  const [notice, setNotice] = useState("");
  const [mode, setMode] = useState<TimerMode>("FOCUS");
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_PREFERENCES.focusMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedFocusSessions, setCompletedFocusSessions] = useState(0);
  const [subject, setSubject] = useState("Deep work");
  const [showSettings, setShowSettings] = useState(false);
  const [showManualLog, setShowManualLog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rangePreset, setRangePreset] = useState<RangePreset>("7");
  const [customFrom, setCustomFrom] = useState(addDays(today, -29));
  const [customTo, setCustomTo] = useState(today);
  const completionHandled = useRef(false);

  const apiFetch = useCallback((path: string, init?: RequestInit) => fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Moeen-Owner": ownerKey,
      ...init?.headers,
    },
  }), [ownerKey]);

  const loadData = useCallback(async () => {
    setApiState("loading");
    try {
      const from = addDays(today, -(365 * 5 - 1));
      const [sessionsResponse, preferencesResponse] = await Promise.all([
        apiFetch(`/study/sessions?from=${from}&to=${today}`),
        apiFetch("/study/preferences"),
      ]);
      if (!sessionsResponse.ok || !preferencesResponse.ok) throw new Error("Study API unavailable");
      const [loadedSessions, loadedPreferences] = await Promise.all([
        sessionsResponse.json() as Promise<StudySession[]>,
        preferencesResponse.json() as Promise<TimerPreferences>,
      ]);
      setSessions(loadedSessions);
      setPreferences(loadedPreferences);
      setDraftPreferences(loadedPreferences);
      setSecondsLeft(loadedPreferences.focusMinutes * 60);
      setApiState("connected");
    } catch {
      setApiState("offline");
    }
  }, [apiFetch, today]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = window.setInterval(() => {
      setSecondsLeft((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isRunning]);

  const changeMode = useCallback((nextMode: TimerMode) => {
    setIsRunning(false);
    setMode(nextMode);
    setSecondsLeft(minutesForMode(nextMode, preferences) * 60);
    completionHandled.current = false;
  }, [preferences]);

  const createSession = useCallback(async (sessionSubject: string, durationMinutes: number, studiedOn: string, source: StudySession["source"]) => {
    setSaving(true);
    try {
      const response = await apiFetch("/study/sessions", {
        method: "POST",
        body: JSON.stringify({ subject: sessionSubject, durationMinutes, studiedOn, source }),
      });
      if (!response.ok) throw new Error("Could not save session");
      const created = await response.json() as StudySession;
      setSessions((current) => [created, ...current]);
      setApiState("connected");
      setNotice(`${formatDuration(durationMinutes)} saved to your study history`);
      window.setTimeout(() => setNotice(""), 3500);
      return true;
    } catch {
      setApiState("offline");
      setNotice("Session was not saved. Start the backend and try again.");
      return false;
    } finally {
      setSaving(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    if (!isRunning || secondsLeft !== 0 || completionHandled.current) return;
    completionHandled.current = true;
    setIsRunning(false);
    if (mode === "FOCUS") {
      const newCount = completedFocusSessions + 1;
      setCompletedFocusSessions(newCount);
      void createSession(subject || "Focus session", preferences.focusMinutes, today, "POMODORO");
      const nextMode: TimerMode = newCount % preferences.sessionsUntilLongBreak === 0 ? "LONG_BREAK" : "SHORT_BREAK";
      setMode(nextMode);
      setSecondsLeft(minutesForMode(nextMode, preferences) * 60);
    } else {
      setMode("FOCUS");
      setSecondsLeft(preferences.focusMinutes * 60);
      setNotice("Break complete — ready for another focus session");
      window.setTimeout(() => setNotice(""), 3500);
    }
  }, [completedFocusSessions, createSession, isRunning, mode, preferences, secondsLeft, subject, today]);

  const savePreferences = async () => {
    setSaving(true);
    try {
      const response = await apiFetch("/study/preferences", {
        method: "PUT",
        body: JSON.stringify(draftPreferences),
      });
      if (!response.ok) throw new Error("Could not save preferences");
      const saved = await response.json() as TimerPreferences;
      setPreferences(saved);
      setDraftPreferences(saved);
      setSecondsLeft(minutesForMode(mode, saved) * 60);
      setIsRunning(false);
      setShowSettings(false);
      setApiState("connected");
      setNotice("Pomodoro settings updated");
      window.setTimeout(() => setNotice(""), 3500);
    } catch {
      setApiState("offline");
      setNotice("Timer settings could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const saveElapsedFocus = async () => {
    const totalSeconds = preferences.focusMinutes * 60;
    const elapsedMinutes = Math.floor((totalSeconds - secondsLeft) / 60);
    if (elapsedMinutes < 1) {
      setNotice("Study for at least one minute before saving progress.");
      window.setTimeout(() => setNotice(""), 3500);
      return;
    }
    const saved = await createSession(subject || "Focus session", elapsedMinutes, today, "POMODORO");
    if (saved) {
      setIsRunning(false);
      setSecondsLeft(totalSeconds);
      completionHandled.current = false;
    }
  };

  const deleteSession = async (sessionId: number) => {
    try {
      const response = await apiFetch(`/study/sessions/${sessionId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Could not delete session");
      setSessions((current) => current.filter((session) => session.id !== sessionId));
    } catch {
      setNotice("That session could not be deleted.");
      window.setTimeout(() => setNotice(""), 3500);
    }
  };

  const handleManualSave = async (manualSubject: string, durationMinutes: number, studiedOn: string) => {
    const saved = await createSession(manualSubject, durationMinutes, studiedOn, "MANUAL");
    if (saved) setShowManualLog(false);
  };

  const activeRange = useMemo(() => {
    if (rangePreset === "custom") {
      const from = customFrom <= customTo ? customFrom : customTo;
      const to = customFrom <= customTo ? customTo : customFrom;
      return { from, to, days: daysBetween(from, to) };
    }
    const days = Number(rangePreset);
    return { from: addDays(today, -(days - 1)), to: today, days };
  }, [customFrom, customTo, rangePreset, today]);

  const summary = useMemo(() => {
    const selected = sessions.filter((session) => session.studiedOn >= activeRange.from && session.studiedOn <= activeRange.to);
    const previousTo = addDays(activeRange.from, -1);
    const previousFrom = addDays(previousTo, -(activeRange.days - 1));
    const currentMinutes = selected.reduce((sum, session) => sum + session.durationMinutes, 0);
    const previousMinutes = sessions
      .filter((session) => session.studiedOn >= previousFrom && session.studiedOn <= previousTo)
      .reduce((sum, session) => sum + session.durationMinutes, 0);
    const todayMinutes = sessions.filter((session) => session.studiedOn === today).reduce((sum, session) => sum + session.durationMinutes, 0);
    const weekStart = startOfWeek(today);
    const weekMinutes = sessions.filter((session) => session.studiedOn >= weekStart && session.studiedOn <= today).reduce((sum, session) => sum + session.durationMinutes, 0);
    const trend = previousMinutes === 0 ? (currentMinutes > 0 ? 100 : 0) : Math.round(((currentMinutes - previousMinutes) / previousMinutes) * 100);
    const chartData = Array.from({ length: activeRange.days }, (_, index) => {
      const date = addDays(activeRange.from, index);
      const minutes = selected.filter((session) => session.studiedOn === date).reduce((sum, session) => sum + session.durationMinutes, 0);
      return { date, hours: Number((minutes / 60).toFixed(2)) };
    });
    return { selected, currentMinutes, todayMinutes, weekMinutes, trend, chartData };
  }, [activeRange, sessions, today]);

  const totalTimerSeconds = minutesForMode(mode, preferences) * 60;
  const progress = totalTimerSeconds === 0 ? 0 : (totalTimerSeconds - secondsLeft) / totalTimerSeconds;
  const circleRadius = 92;
  const circumference = 2 * Math.PI * circleRadius;
  const elapsedMinutes = mode === "FOCUS" ? Math.floor((totalTimerSeconds - secondsLeft) / 60) : 0;
  const TrendIcon = summary.trend > 0 ? TrendingUp : summary.trend < 0 ? TrendingDown : Minus;

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="mx-auto max-w-[1480px] p-5 lg:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground">Study command center</h1>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${apiState === "connected" ? "bg-emerald-400/10 border-emerald-400/20 text-emerald-300" : apiState === "offline" ? "bg-red-400/10 border-red-400/20 text-red-400" : "bg-white/[0.03] border-white/10 text-slate-400"}`}>
                <Database size={10} />{apiState === "connected" ? "Database synced" : apiState === "offline" ? "Database offline" : "Syncing"}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Focus with intention, then use the data to improve your rhythm.</p>
          </div>
          <button onClick={() => setShowManualLog(true)} className="h-9 px-3.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2 hover:bg-primary/90">
            <Plus size={15} />Log study time
          </button>
        </div>

        {notice && (
          <div className={`rounded-lg border px-3 py-2.5 text-xs flex items-center gap-2 ${notice.includes("not") || notice.includes("could not") ? "bg-red-400/10 border-red-400/20 text-red-300" : "bg-indigo-400/10 border-indigo-400/20 text-indigo-300"}`}>
            {notice.includes("not") || notice.includes("could not") ? <AlertCircle size={14} /> : <Check size={14} />}{notice}
          </div>
        )}

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          <StatCard label="Today" value={formatDuration(summary.todayMinutes)} detail={`${sessions.filter((session) => session.studiedOn === today).length} sessions completed`} icon={Clock3} tone="indigo" />
          <StatCard label="This week" value={formatDuration(summary.weekMinutes)} detail={`Since ${parseLocalDate(startOfWeek(today)).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`} icon={CalendarDays} tone="sky" />
          <StatCard label="Selected period" value={formatDuration(summary.currentMinutes)} detail={`${activeRange.days} calendar days`} icon={Target} tone="amber" />
          <StatCard label="Daily average" value={formatDuration(Math.round(summary.currentMinutes / activeRange.days))} detail={`${summary.selected.length} sessions in range`} icon={BarChart3} tone="emerald" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[380px_minmax(0,1fr)] gap-5 items-start">
          <section className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 pt-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-400/10 text-primary grid place-items-center"><Timer size={16} /></div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Pomodoro timer</h2>
                  <p className="text-[11px] text-muted-foreground">Session {completedFocusSessions % preferences.sessionsUntilLongBreak + 1} of {preferences.sessionsUntilLongBreak}</p>
                </div>
              </div>
              <button onClick={() => setShowSettings((show) => !show)} className={`w-8 h-8 rounded-lg grid place-items-center transition-colors ${showSettings ? "bg-accent text-primary" : "text-muted-foreground hover:bg-muted"}`} aria-label="Timer settings"><Settings2 size={15} /></button>
            </div>

            <div className="px-5 pt-4">
              <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1">
                {(["FOCUS", "SHORT_BREAK", "LONG_BREAK"] as TimerMode[]).map((timerMode) => (
                  <button key={timerMode} onClick={() => changeMode(timerMode)} className={`h-8 rounded-md text-[10px] font-semibold transition-all ${mode === timerMode ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                    {timerMode === "FOCUS" ? "Focus" : timerMode === "SHORT_BREAK" ? "Short break" : "Long break"}
                  </button>
                ))}
              </div>
              <label className="block mt-4">
                <span className="sr-only">Study subject</span>
                <div className="relative">
                  <BookOpen size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input disabled={mode !== "FOCUS"} value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={120} placeholder="What are you studying?" className="w-full h-9 rounded-lg border border-border bg-background pl-9 pr-3 text-xs outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 disabled:opacity-50" />
                </div>
              </label>
            </div>

            <div className="relative mx-auto my-5 w-[226px] h-[226px]">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 226 226" aria-hidden="true">
                <circle cx="113" cy="113" r={circleRadius} fill="none" stroke="#202B3C" strokeWidth="10" />
                <circle cx="113" cy="113" r={circleRadius} fill="none" stroke={mode === "FOCUS" ? "#8B7CF6" : "#35C9C1"} strokeWidth="10" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)} className="transition-all duration-500" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-[10px] font-bold uppercase tracking-[0.18em] ${mode === "FOCUS" ? "text-primary" : "text-teal-400"}`}>{modeLabel(mode)}</span>
                <span className="mt-2 text-[42px] leading-none font-bold tracking-[-0.06em] text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{formatTimer(secondsLeft)}</span>
                <span className="mt-2 text-[11px] text-muted-foreground">{isRunning ? "Stay in the zone" : "Ready when you are"}</span>
              </div>
            </div>

            <div className="px-5 pb-5">
              <div className="flex items-center justify-center gap-2">
                <button onClick={() => { setIsRunning(false); setSecondsLeft(totalTimerSeconds); completionHandled.current = false; }} className="w-10 h-10 rounded-lg border border-border grid place-items-center text-muted-foreground hover:bg-muted" aria-label="Reset timer"><RotateCcw size={15} /></button>
                <button onClick={() => { completionHandled.current = false; setIsRunning((running) => !running); }} className="h-11 min-w-[132px] px-5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_6px_18px_rgba(79,70,229,0.2)] hover:bg-primary/90">
                  {isRunning ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}{isRunning ? "Pause" : secondsLeft === totalTimerSeconds ? "Start focus" : "Resume"}
                </button>
                <button disabled={mode !== "FOCUS" || elapsedMinutes < 1 || saving} onClick={() => void saveElapsedFocus()} className="w-10 h-10 rounded-lg border border-border grid place-items-center text-muted-foreground hover:bg-muted disabled:opacity-35" aria-label="Save elapsed study time"><Save size={15} /></button>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2">
                {Array.from({ length: preferences.sessionsUntilLongBreak }, (_, index) => (
                  <span key={index} className={`w-2 h-2 rounded-full ${index < completedFocusSessions % preferences.sessionsUntilLongBreak ? "bg-primary" : "bg-slate-700"}`} />
                ))}
                <span className="ml-1 text-[10px] text-muted-foreground">until long break</span>
              </div>
            </div>

            {showSettings && (
              <div className="border-t border-border bg-white/[0.03] p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs font-semibold text-foreground">Timer intervals</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Changing these resets the current timer.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <SettingField label="Focus minutes" min={1} max={180} value={draftPreferences.focusMinutes} onChange={(value) => setDraftPreferences((current) => ({ ...current, focusMinutes: value }))} />
                  <SettingField label="Short break" min={1} max={60} value={draftPreferences.shortBreakMinutes} onChange={(value) => setDraftPreferences((current) => ({ ...current, shortBreakMinutes: value }))} />
                  <SettingField label="Long break" min={1} max={90} value={draftPreferences.longBreakMinutes} onChange={(value) => setDraftPreferences((current) => ({ ...current, longBreakMinutes: value }))} />
                  <SettingField label="Focus sessions" min={1} max={12} value={draftPreferences.sessionsUntilLongBreak} onChange={(value) => setDraftPreferences((current) => ({ ...current, sessionsUntilLongBreak: value }))} />
                </div>
                <button disabled={saving} onClick={() => void savePreferences()} className="mt-4 w-full h-9 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-60"><Save size={13} />Save timer settings</button>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-border bg-card min-w-0">
            <div className="p-5 border-b border-border flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-foreground">Study trend</h2>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${summary.trend > 0 ? "bg-emerald-400/10 text-emerald-300" : summary.trend < 0 ? "bg-red-400/10 text-red-400" : "bg-white/[0.05] text-slate-300"}`}>
                    <TrendIcon size={11} />{summary.trend > 0 ? "+" : ""}{summary.trend}%
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">Compared with the previous {activeRange.days}-day period</p>
              </div>
              <div className="flex rounded-lg bg-muted p-1">
                {(["7", "30", "90", "custom"] as RangePreset[]).map((preset) => (
                  <button key={preset} onClick={() => setRangePreset(preset)} className={`h-7 px-2.5 rounded-md text-[10px] font-semibold transition-all ${rangePreset === preset ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                    {preset === "custom" ? "Custom" : `${preset}D`}
                  </button>
                ))}
              </div>
              {rangePreset === "custom" && (
                <div className="w-full flex items-center justify-end gap-2 pt-1">
                  <input type="date" min={addDays(today, -(365 * 5 - 1))} max={today} value={customFrom} onChange={(event) => setCustomFrom(event.target.value)} className="h-8 rounded-lg border border-border bg-background px-2 text-[11px] outline-none focus:border-primary/40" />
                  <span className="text-[10px] text-muted-foreground">to</span>
                  <input type="date" min={addDays(today, -(365 * 5 - 1))} max={today} value={customTo} onChange={(event) => setCustomTo(event.target.value)} className="h-8 rounded-lg border border-border bg-background px-2 text-[11px] outline-none focus:border-primary/40" />
                </div>
              )}
            </div>

            <div className="p-5">
              <div className="flex items-end gap-2 mb-5">
                <span className="text-3xl font-bold text-foreground tracking-tight" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{(summary.currentMinutes / 60).toFixed(1)}</span>
                <span className="text-xs text-muted-foreground pb-1">hours studied</span>
              </div>
              <div className="h-[285px] min-w-0">
                {summary.currentMinutes === 0 ? (
                  <div className="h-full rounded-xl border border-dashed border-white/10 bg-white/[0.025] flex flex-col items-center justify-center text-center px-6">
                    <div className="w-10 h-10 rounded-full bg-indigo-400/10 text-primary grid place-items-center"><BarChart3 size={18} /></div>
                    <p className="mt-3 text-sm font-semibold text-foreground">Your trend starts here</p>
                    <p className="mt-1 text-xs text-muted-foreground max-w-xs">Complete a Pomodoro or log study time to see your hours rise across this chart.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={summary.chartData} margin={{ top: 6, right: 6, left: -22, bottom: 0 }}>
                      <defs>
                        <linearGradient id="studyHoursGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8B7CF6" stopOpacity={0.32} />
                          <stop offset="100%" stopColor="#8B7CF6" stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.12)" strokeDasharray="3 3" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} minTickGap={28} tick={{ fill: "#718096", fontSize: 10 }} tickFormatter={(date) => parseLocalDate(date).toLocaleDateString(undefined, { month: "short", day: "numeric" })} />
                      <YAxis axisLine={false} tickLine={false} width={38} tick={{ fill: "#718096", fontSize: 10 }} tickFormatter={(hours) => `${hours}h`} />
                      <Tooltip content={<StudyChartTooltip />} />
                      <Area type="monotone" dataKey="hours" stroke="#8B7CF6" strokeWidth={2.5} fill="url(#studyHoursGradient)" activeDot={{ r: 4, strokeWidth: 2, fill: "#101722", stroke: "#B9B0FF" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </section>
        </div>

        <section className="rounded-xl border border-border bg-card">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Recent study sessions</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">Every saved session is stored in PostgreSQL.</p>
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground bg-muted rounded-full px-2.5 py-1">{sessions.length} total</span>
          </div>
          {sessions.length === 0 ? (
            <div className="p-8 flex flex-col items-center text-center">
              <Coffee size={20} className="text-slate-300" />
              <p className="mt-2 text-xs font-medium text-foreground">No sessions recorded yet</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Start the timer or add your first study block manually.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {sessions.slice(0, 8).map((session) => (
                <div key={session.id} className="px-5 py-3 flex items-center gap-3 group">
                  <div className={`w-8 h-8 rounded-lg grid place-items-center shrink-0 ${session.source === "POMODORO" ? "bg-indigo-400/10 text-primary" : "bg-sky-400/10 text-sky-400"}`}>
                    {session.source === "POMODORO" ? <Timer size={14} /> : <BookOpen size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{session.subject}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{parseLocalDate(session.studiedOn).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} · {session.source === "POMODORO" ? "Pomodoro" : "Manual entry"}</p>
                  </div>
                  <span className="text-xs font-bold text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{formatDuration(session.durationMinutes)}</span>
                  <button onClick={() => void deleteSession(session.id)} className="w-8 h-8 rounded-lg grid place-items-center text-slate-300 opacity-0 group-hover:opacity-100 hover:bg-red-400/10 hover:text-red-400 transition-all" aria-label={`Delete ${session.subject}`}><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {showManualLog && <ManualLogModal onClose={() => setShowManualLog(false)} onSave={handleManualSave} saving={saving} />}
    </div>
  );
}
