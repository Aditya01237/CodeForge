import { useEffect, useMemo, useState } from "react";
import {
  Home,
  Play,
  Send,
  User,
  Clock,
  Sun,
  Moon,
  Lock,
  ArrowLeft,
} from "lucide-react";

import { useNavigate, useSearchParams } from "react-router-dom";
import { getProblemBackPath, routes } from "../utils/navigation";

const MONO = "'JetBrains Mono', 'Fira Code', ui-monospace, monospace";

const formatRemainingTime = (ms) => {
  if (ms <= 0) return "00:00:00";

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
};

export default function TopBar({
  onRun,
  onSubmit,
  running = false,
  theme = "dark",
  setTheme,
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const mode = searchParams.get("mode") || "practice";
  const testId = searchParams.get("testId");

  const [remainingMs, setRemainingMs] = useState(null);

  const isDark = theme === "dark";
  const isTestMode = mode === "test";
  const isExpired = isTestMode && remainingMs !== null && remainingMs <= 0;

  const testAccess = useMemo(() => {
    if (!isTestMode) return null;

    try {
      const raw = localStorage.getItem("cf_test_access");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [isTestMode]);

  const participant = useMemo(() => {
    try {
      const raw = localStorage.getItem("cf_participant");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!isTestMode || !testAccess?.endTime) return undefined;

    const end = new Date(testAccess.endTime).getTime();

    const tick = () => {
      const diff = end - Date.now();
      setRemainingMs(Math.max(diff, 0));
    };

    const timeout = window.setTimeout(tick, 0);
    const interval = setInterval(tick, 1000);

    return () => {
      window.clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [isTestMode, testAccess?.endTime]);

  useEffect(() => {
    if (!isExpired || !testId) return;

    const timeout = setTimeout(() => {
      navigate(`/test/${testId}/problems`);
    }, 800);

    return () => clearTimeout(timeout);
  }, [isExpired, testId, navigate]);

  const goBack = () => {
    navigate(getProblemBackPath({ mode, testId }));
  };

  const goHome = () => {
    navigate(routes.home);
  };

  const safeRun = () => {
    if (isExpired) {
      if (testId) navigate(`/test/${testId}/problems`);
      return;
    }

    onRun?.();
  };

  const safeSubmit = () => {
    if (isExpired) {
      if (testId) navigate(`/test/${testId}/problems`);
      return;
    }

    onSubmit?.();
  };

  const participantLabel =
    participant?.participantType === "STUDENT"
      ? participant.rollNumber
      : participant?.name || "Guest";

  const wrapperClass = isDark
    ? "bg-[#0D1117] border-white/10 text-white"
    : "bg-white border-slate-200 text-slate-950";

  const softButtonClass = isDark
    ? "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] hover:text-white"
    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-950";

  const timerClass = isExpired
    ? isDark
      ? "border-rose-400/30 bg-rose-400/10 text-rose-300"
      : "border-rose-200 bg-rose-50 text-rose-700"
    : remainingMs !== null && remainingMs <= 5 * 60 * 1000
      ? isDark
        ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
        : "border-amber-200 bg-amber-50 text-amber-700"
      : isDark
        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
        : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <div
      className={`h-16 shrink-0 border-b px-5 flex items-center justify-between ${wrapperClass}`}
    >
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <button
          onClick={goBack}
          className={`h-10 w-10 rounded-xl border flex items-center justify-center transition ${softButtonClass}`}
          title={isTestMode ? "Back to test problems" : "Back to dashboard"}
        >
          {isTestMode ? <ArrowLeft size={17} /> : <Home size={17} />}
        </button>

        <button
          onClick={goHome}
          className="text-[21px] font-bold tracking-wide text-[#58A6FF]"
          style={{ fontFamily: MONO }}
          title="Go to dashboard"
        >
          CodeForge
        </button>
      </div>

      {/* CENTER */}
      <div className="flex items-center gap-3">
        <button
          onClick={safeRun}
          disabled={running || isExpired}
          className={`h-10 min-w-[92px] px-5 rounded-xl border flex items-center justify-center gap-2 text-sm font-semibold transition ${
            running || isExpired
              ? "opacity-60 cursor-not-allowed border-white/10 bg-white/[0.03] text-slate-400"
              : isDark
                ? "border-white/10 bg-white/[0.04] text-slate-200 hover:border-[#58A6FF]/60 hover:text-[#58A6FF]"
                : "border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-600"
          }`}
        >
          {running ? (
            <span className="w-4 h-4 border-2 border-white/20 border-t-[#58A6FF] rounded-full animate-spin" />
          ) : (
            <Play size={15} />
          )}

          <span>{running ? "Running" : "Run"}</span>
        </button>

        <button
          onClick={safeSubmit}
          disabled={running || isExpired}
          className={`h-10 min-w-[110px] px-5 rounded-xl border flex items-center justify-center gap-2 text-sm font-semibold transition disabled:opacity-60 ${
            isExpired
              ? "border-slate-300 bg-slate-100 text-slate-500 cursor-not-allowed"
              : isDark
                ? "bg-emerald-500/10 border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/20"
                : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
          }`}
        >
          <Send size={15} />
          <span>Submit</span>
        </button>
      </div>

      {/* RIGHT */}
      <div className="flex items-center justify-end gap-3">
        {isTestMode && (
          <div
            className={`h-10 px-3 rounded-xl border hidden sm:flex items-center gap-2 text-sm font-bold ${timerClass}`}
            style={{ fontFamily: MONO }}
          >
            {isExpired ? <Lock size={15} /> : <Clock size={15} />}
            <span>
              {isExpired ? "ENDED" : formatRemainingTime(remainingMs ?? 0)}
            </span>
          </div>
        )}

        <button
          onClick={() => setTheme?.(isDark ? "light" : "dark")}
          className={`h-10 px-4 rounded-xl border flex items-center gap-2 text-sm font-semibold transition ${softButtonClass}`}
          title="Toggle theme"
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
          <span>{isDark ? "Light" : "Dark"}</span>
        </button>

        <div
          className={`h-10 px-3 rounded-xl border hidden md:flex items-center gap-2 max-w-[150px] ${
            isDark
              ? "border-white/10 bg-white/[0.04]"
              : "border-slate-200 bg-slate-50"
          }`}
        >
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
              isDark ? "bg-white/10" : "bg-white border border-slate-200"
            }`}
          >
            <User size={15} />
          </div>

          <span
            className={`text-sm truncate ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}
          >
            {isTestMode ? participantLabel : "Practice"}
          </span>
        </div>
      </div>
    </div>
  );
}
