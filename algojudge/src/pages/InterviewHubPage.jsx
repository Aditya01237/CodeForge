import { createElement, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Clock3,
  Code2,
  KeyRound,
  MessageSquareText,
  Moon,
  Sparkles,
  Sun,
  Users,
} from "lucide-react";
import { apiPost } from "../api";
import { storeInterviewAccess } from "../interviewAccess";

const MONO = "'JetBrains Mono', 'Fira Code', ui-monospace, monospace";

export default function InterviewHubPage() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(
    () => localStorage.getItem("cf_theme") || "dark",
  );
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  const [createForm, setCreateForm] = useState({
    interviewerName: "",
    title: "",
  });
  const [joinForm, setJoinForm] = useState({
    roomCode: "",
    candidateName: "",
  });

  const isDark = theme === "dark";

  const pageClass = isDark
    ? "bg-[#070B12] text-white"
    : "bg-[#F8FAFC] text-slate-950";
  const cardClass = isDark
    ? "bg-[#111827] border-white/10"
    : "bg-white border-slate-200 shadow-sm";
  const panelClass = isDark
    ? "bg-[#0B1220] border-white/10"
    : "bg-slate-50 border-slate-200";
  const inputClass = isDark
    ? "bg-[#070B12] border-white/10 text-white placeholder:text-slate-600 focus:border-violet-400"
    : "bg-white border-slate-200 text-slate-950 placeholder:text-slate-400 focus:border-violet-500";
  const softButton = isDark
    ? "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100";
  const muted = isDark ? "text-slate-400" : "text-slate-600";

  useEffect(() => {
    localStorage.setItem("cf_theme", theme);
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark, theme]);

  const updateCreate = (field, value) => {
    setCreateForm((current) => ({ ...current, [field]: value }));
  };

  const createRoom = async (event) => {
    event.preventDefault();
    setError("");

    if (!createForm.interviewerName.trim()) {
      setError("Enter the interviewer name.");
      return;
    }

    setCreating(true);

    try {
      const room = await apiPost("/interviews", createForm);
      storeInterviewAccess(room.roomCode, room.accessToken);
      navigate(`/interview/room/${room.roomCode}`);
    } catch (err) {
      setError(err.message || "Failed to create interview room.");
    } finally {
      setCreating(false);
    }
  };

  const joinRoom = async (event) => {
    event.preventDefault();
    setError("");

    const roomCode = joinForm.roomCode.trim().toUpperCase();
    if (!roomCode || !joinForm.candidateName.trim()) {
      setError("Enter your name and room code.");
      return;
    }

    setJoining(true);

    try {
      const room = await apiPost(`/interviews/rooms/${roomCode}/join`, {
        candidateName: joinForm.candidateName.trim(),
      });
      storeInterviewAccess(roomCode, room.accessToken);
      navigate(`/interview/room/${roomCode}`);
    } catch (err) {
      setError(err.message || "Unable to join this interview room.");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className={`min-h-screen ${pageClass}`}>
      <nav
        className={`h-16 px-6 flex items-center justify-between border-b ${
          isDark ? "bg-[#0D1117] border-white/10" : "bg-white border-slate-200"
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className={`h-10 w-10 rounded-xl border flex items-center justify-center ${softButton}`}
          >
            <ArrowLeft size={17} />
          </button>
          <div>
            <div className="font-black flex items-center gap-2">
              <BrainCircuit size={18} className="text-violet-400" />
              Interview Studio
            </div>
            <div className={`text-xs ${muted}`}>
              One-on-one technical interview practice
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="hidden sm:block text-violet-400 text-sm"
            style={{ fontFamily: MONO }}
          >
            CodeForge / Practice
          </div>
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`h-10 rounded-xl border px-3 flex items-center gap-2 text-sm ${softButton}`}
            aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
            <span className="hidden sm:inline">
              {isDark ? "Light" : "Dark"}
            </span>
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <section
          className={`rounded-[32px] border p-8 lg:p-10 mb-7 relative overflow-hidden ${cardClass}`}
        >
          <div
            className={`absolute -right-20 -top-20 h-80 w-80 rounded-full blur-3xl ${
              isDark ? "bg-violet-500/20" : "bg-violet-200/70"
            }`}
          />
          <div className="relative max-w-4xl">
            <div
              className="text-xs uppercase tracking-[0.25em] text-violet-400 mb-5"
              style={{ fontFamily: MONO }}
            >
              Placement preparation, made collaborative
            </div>
            <h1 className="text-5xl lg:text-6xl font-black leading-tight">
              Think aloud. Code together.
              <span className="text-violet-400"> Improve faster.</span>
            </h1>
            <p className={`text-lg leading-8 mt-5 max-w-3xl ${muted}`}>
              Create a private interview room with a shared editor, live code
              execution, an interview timer, and structured feedback at the
              end.
            </p>
          </div>
        </section>

        <section className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6">
          <form
            onSubmit={createRoom}
            className={`rounded-3xl border p-6 lg:p-7 ${cardClass}`}
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 text-violet-400 font-bold">
                  <Sparkles size={18} />
                  Create an interview
                </div>
                <p className={`text-sm mt-2 ${muted}`}>
                  For faculty, mentors, seniors, or peer interviewers.
                </p>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-xs ${softButton}`}
              >
                Interviewer
              </span>
            </div>

            <label>
              <span className={`text-sm mb-2 block ${muted}`}>
                Interviewer name
              </span>
              <input
                value={createForm.interviewerName}
                onChange={(event) =>
                  updateCreate("interviewerName", event.target.value)
                }
                placeholder="Dr. Sharma"
                className={`h-12 w-full rounded-xl border px-4 outline-none ${inputClass}`}
              />
            </label>

            <label className="block mt-4">
              <span className={`text-sm mb-2 block ${muted}`}>
                Interview title
              </span>
              <input
                value={createForm.title}
                onChange={(event) => updateCreate("title", event.target.value)}
                placeholder="DSA Mock Interview"
                className={`h-12 w-full rounded-xl border px-4 outline-none ${inputClass}`}
              />
            </label>

            <button
              type="submit"
              disabled={creating}
              className="mt-6 h-12 w-full rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold flex items-center justify-center gap-2"
            >
              {creating ? "Creating room..." : "Create private room"}
              {!creating && <ArrowRight size={17} />}
            </button>
          </form>

          <div className="space-y-6">
            <form
              onSubmit={joinRoom}
              className={`rounded-3xl border p-6 lg:p-7 ${cardClass}`}
            >
              <div className="flex items-center gap-2 text-blue-400 font-bold">
                <Users size={18} />
                Join as candidate
              </div>
              <p className={`text-sm mt-2 mb-5 ${muted}`}>
                Enter the six-character room code shared by your interviewer.
              </p>

              <input
                value={joinForm.candidateName}
                onChange={(event) =>
                  setJoinForm((current) => ({
                    ...current,
                    candidateName: event.target.value,
                  }))
                }
                placeholder="Your name"
                className={`h-12 w-full rounded-xl border px-4 outline-none ${inputClass}`}
              />
              <input
                value={joinForm.roomCode}
                onChange={(event) =>
                  setJoinForm((current) => ({
                    ...current,
                    roomCode: event.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9]/g, "")
                      .slice(0, 6),
                  }))
                }
                placeholder="ROOM CODE"
                maxLength={6}
                className={`h-14 w-full rounded-xl border px-4 mt-3 outline-none text-center text-xl tracking-[0.35em] uppercase ${inputClass}`}
                style={{ fontFamily: MONO }}
              />

              <button
                type="submit"
                disabled={joining}
                className="mt-4 h-12 w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold"
              >
                {joining ? "Joining..." : "Join interview"}
              </button>
            </form>

            <div className={`rounded-3xl border p-6 ${panelClass}`}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  [Code2, "Shared editor", "Code appears for both people"],
                  [Clock3, "Elapsed timer", "See how long the interview has been running"],
                  [KeyRound, "Private room", "Join with a six-character code"],
                  [
                    MessageSquareText,
                    "Feedback",
                    "Strengths, improvements, rating",
                  ],
                ].map(([Icon, title, description]) => (
                  <div key={title}>
                    {createElement(Icon, {
                      size: 19,
                      className: "text-violet-400 mb-2",
                    })}
                    <div className="font-bold text-sm">{title}</div>
                    <div className={`text-xs leading-5 mt-1 ${muted}`}>
                      {description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-rose-400">
            {error}
          </div>
        )}
      </main>
    </div>
  );
}
