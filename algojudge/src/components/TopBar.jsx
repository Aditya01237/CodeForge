import {
  Home,
  Play,
  Send,
  User,
  Clock,
  Sun,
  Moon,
} from "lucide-react";

import { useNavigate, useSearchParams } from "react-router-dom";

const MONO = "'JetBrains Mono', 'Fira Code', ui-monospace, monospace";

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

  let participant = null;

  try {
    participant = JSON.parse(localStorage.getItem("cf_participant") || "null");
  } catch {
    participant = null;
  }

  const isDark = theme === "dark";

  const goBack = () => {
    if (mode === "test" && testId) {
      navigate(`/test/${testId}/problems`);
      return;
    }

    navigate("/");
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

  return (
    <div
      className={`h-16 shrink-0 border-b px-5 flex items-center justify-between ${wrapperClass}`}
    >
      {/* LEFT */}
      <div className="flex items-center gap-4">
        <button
          onClick={goBack}
          className={`h-10 w-10 rounded-xl border flex items-center justify-center transition ${softButtonClass}`}
          title="Back"
        >
          <Home size={17} />
        </button>

        <button
          onClick={() => navigate("/")}
          className="text-[21px] font-bold tracking-wide text-[#58A6FF]"
          style={{ fontFamily: MONO }}
        >
          CodeForge
        </button>
      </div>

      {/* CENTER */}
      <div className="flex items-center gap-3">
        <button
          onClick={onRun}
          disabled={running}
          className={`h-10 min-w-[92px] px-5 rounded-xl border flex items-center justify-center gap-2 text-sm font-semibold transition ${
            running
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
          onClick={onSubmit}
          disabled={running}
          className={`h-10 min-w-[110px] px-5 rounded-xl border flex items-center justify-center gap-2 text-sm font-semibold transition disabled:opacity-60 ${
            isDark
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
        {mode === "test" && (
          <div
            className={`h-10 px-3 rounded-xl border hidden sm:flex items-center gap-2 text-sm ${
              isDark
                ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
                : "border-amber-200 bg-amber-50 text-amber-700"
            }`}
          >
            <Clock size={15} />
            <span style={{ fontFamily: MONO }}>90:00</span>
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
            {mode === "test" ? participantLabel : "Practice"}
          </span>
        </div>
      </div>
    </div>
  );
}