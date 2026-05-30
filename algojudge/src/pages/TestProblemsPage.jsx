import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet } from "../api";
import {
  Home,
  Moon,
  Sun,
  Clock,
  UserRound,
  GraduationCap,
  Mail,
  Phone,
  ArrowLeft,
  Play,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Circle,
} from "lucide-react";

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

const difficultyStyle = (difficulty, isDark) => {
  const value = String(difficulty || "").toLowerCase();

  if (value === "easy") {
    return isDark
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (value === "medium") {
    return isDark
      ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
      : "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (value === "hard") {
    return isDark
      ? "border-rose-400/20 bg-rose-400/10 text-rose-300"
      : "border-rose-200 bg-rose-50 text-rose-700";
  }

  return isDark
    ? "border-white/10 bg-white/[0.04] text-slate-300"
    : "border-slate-200 bg-slate-50 text-slate-700";
};

const getProblemStatusMeta = (status, isDark) => {
  if (status === "ACCEPTED") {
    return {
      label: "Solved",
      icon: <CheckCircle2 size={16} />,
      row: isDark
        ? "border-emerald-400/20 bg-emerald-400/5"
        : "border-emerald-200 bg-emerald-50/60",
      badge: isDark
        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
        : "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (status === "ATTEMPTED") {
    return {
      label: "Attempted",
      icon: <AlertTriangle size={16} />,
      row: isDark
        ? "border-amber-400/20 bg-amber-400/5"
        : "border-amber-200 bg-amber-50/60",
      badge: isDark
        ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
        : "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  return {
    label: "Not Started",
    icon: <Circle size={16} />,
    row: "",
    badge: isDark
      ? "border-white/10 bg-white/[0.04] text-slate-400"
      : "border-slate-200 bg-slate-50 text-slate-500",
  };
};

export default function TestProblemsPage() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("cf_theme") || "dark";
  });

  const [test, setTest] = useState(null);
  const [participant, setParticipant] = useState(null);
  const [testProblems, setTestProblems] = useState([]);
  const [problemStatus, setProblemStatus] = useState({});
  const [remainingMs, setRemainingMs] = useState(null);
  const [error, setError] = useState("");

  const isDark = theme === "dark";
  const isExpired = remainingMs !== null && remainingMs <= 0;

  useEffect(() => {
    localStorage.setItem("cf_theme", theme);

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    const testRaw = localStorage.getItem("cf_test_access");
    const participantRaw = localStorage.getItem("cf_participant");

    if (!testRaw) {
      navigate("/test-access");
      return;
    }

    if (!participantRaw) {
      navigate(`/test/${testId}/identity`);
      return;
    }

    try {
      const parsedTest = JSON.parse(testRaw);
      const parsedParticipant = JSON.parse(participantRaw);

      if (String(parsedTest.testId) !== String(testId)) {
        navigate("/test-access");
        return;
      }

      setTest(parsedTest);
      setParticipant(parsedParticipant);
    } catch {
      navigate("/test-access");
      return;
    }

    apiGet(`/tests/${testId}/problems`)
      .then((data) => setTestProblems(Array.isArray(data) ? data : []))
      .catch(() => setError("Failed to load test problems."));
  }, [testId, navigate]);

  useEffect(() => {
    const key = `cf_test_problem_status_${testId}`;
    const raw = localStorage.getItem(key);

    try {
      setProblemStatus(raw ? JSON.parse(raw) : {});
    } catch {
      setProblemStatus({});
    }

    const onStorage = () => {
      const latest = localStorage.getItem(key);
      try {
        setProblemStatus(latest ? JSON.parse(latest) : {});
      } catch {
        setProblemStatus({});
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onStorage);
    };
  }, [testId]);

  useEffect(() => {
    if (!test?.endTime) return;

    const end = new Date(test.endTime).getTime();

    const tick = () => {
      const diff = end - Date.now();
      setRemainingMs(Math.max(diff, 0));
    };

    tick();
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [test]);

  const statusCounts = useMemo(() => {
    let solved = 0;
    let attempted = 0;

    Object.values(problemStatus).forEach((status) => {
      if (status === "ACCEPTED") solved++;
      else if (status === "ATTEMPTED") attempted++;
    });

    return { solved, attempted };
  }, [problemStatus]);

  if (!test || !participant) {
    return (
      <div className="min-h-screen bg-[#070B12] text-white p-8">
        Loading test...
      </div>
    );
  }

  const isExternal = participant.participantType === "EXTERNAL";

  const participantName = isExternal
    ? participant.name
    : participant.name || participant.rollNumber;

  const pageClass = isDark
    ? "bg-[#070B12] text-white"
    : "bg-[#F8FAFC] text-slate-950";

  const navClass = isDark
    ? "bg-[#0D1117] border-white/10"
    : "bg-white border-slate-200";

  const cardClass = isDark
    ? "bg-[#111827] border-white/10"
    : "bg-white border-slate-200 shadow-sm";

  const softButton = isDark
    ? "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100";

  const muted = isDark ? "text-slate-400" : "text-slate-600";

  const tableHeader = isDark
    ? "text-slate-500 border-white/10 bg-white/[0.02]"
    : "text-slate-500 border-slate-200 bg-slate-50";

  const tableRow = isDark
    ? "border-white/5 hover:bg-white/[0.04]"
    : "border-slate-100 hover:bg-slate-50";

  const timerClass = isExpired
    ? "border-rose-400/30 bg-rose-400/10 text-rose-500"
    : remainingMs !== null && remainingMs <= 5 * 60 * 1000
      ? "border-amber-400/30 bg-amber-400/10 text-amber-500"
      : "border-blue-400/30 bg-blue-500/10 text-[#58A6FF]";

  const openProblem = (problemId) => {
    if (isExpired) return;

    navigate(`/problem/${problemId}?mode=test&testId=${testId}`);
  };

  return (
    <div className={`min-h-screen ${pageClass}`}>
      <nav
        className={`h-16 px-6 flex items-center justify-between border-b ${navClass}`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/test/${testId}/lobby`)}
            className={`h-10 w-10 rounded-xl border flex items-center justify-center transition ${softButton}`}
            title="Back to lobby"
          >
            <ArrowLeft size={17} />
          </button>

          <button
            onClick={() => navigate("/")}
            className="text-xl font-bold text-[#58A6FF]"
            style={{ fontFamily: MONO }}
          >
            CodeForge
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`h-10 px-4 rounded-xl border flex items-center gap-2 text-sm font-bold ${timerClass}`}
            style={{ fontFamily: MONO }}
          >
            {isExpired ? <Lock size={15} /> : <Clock size={15} />}
            {isExpired ? "ENDED" : formatRemainingTime(remainingMs || 0)}
          </div>

          <button
            onClick={() => navigate("/")}
            className={`hidden sm:flex h-10 px-4 rounded-xl border items-center gap-2 text-sm font-semibold transition ${softButton}`}
          >
            <Home size={15} />
            Home
          </button>

          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`h-10 px-4 rounded-xl border flex items-center gap-2 text-sm font-semibold transition ${softButton}`}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
            {isDark ? "Light" : "Dark"}
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <section className="mb-7 grid lg:grid-cols-[1fr_360px] gap-5">
          <div>
            <div
              className="text-xs uppercase tracking-[0.25em] text-[#58A6FF] mb-3"
              style={{ fontFamily: MONO }}
            >
              Coding Test
            </div>

            <h1 className="text-4xl font-black">{test.title}</h1>

            <p className={`mt-3 max-w-2xl leading-7 ${muted}`}>
              Solve assigned problems before the timer reaches zero. Green means
              solved, yellow means attempted but not accepted.
            </p>

            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              <span className={`px-3 py-1 rounded-full border ${softButton}`}>
                Test ID:{" "}
                <span className="font-mono text-[#58A6FF]">
                  {test.testCode}
                </span>
              </span>

              <span className={`px-3 py-1 rounded-full border ${softButton}`}>
                Problems: {testProblems.length}
              </span>

              <span className={`px-3 py-1 rounded-full border ${softButton}`}>
                Solved:{" "}
                <span className="font-semibold text-emerald-500">
                  {statusCounts.solved}
                </span>
              </span>

              <span className={`px-3 py-1 rounded-full border ${softButton}`}>
                Attempted:{" "}
                <span className="font-semibold text-amber-500">
                  {statusCounts.attempted}
                </span>
              </span>

              <span className={`px-3 py-1 rounded-full border ${timerClass}`}>
                {isExpired ? "Test closed" : "Time left"}:{" "}
                {isExpired ? "00:00:00" : formatRemainingTime(remainingMs || 0)}
              </span>
            </div>

            {isExpired && (
              <div className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-4 text-sm text-rose-500">
                Test time is over. Problem solving is now disabled.
              </div>
            )}
          </div>

          <aside className={`rounded-3xl border p-5 ${cardClass}`}>
            <div className="flex items-start gap-3">
              {isExternal ? (
                <UserRound className="text-[#58A6FF] mt-1" size={20} />
              ) : (
                <GraduationCap className="text-[#58A6FF] mt-1" size={20} />
              )}

              <div className="min-w-0">
                <div
                  className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-1"
                  style={{ fontFamily: MONO }}
                >
                  Participant
                </div>

                <div className="font-bold truncate">
                  {participantName || "Participant"}
                </div>

                {!isExternal && (
                  <div className={`text-sm mt-1 ${muted}`}>
                    Roll No:{" "}
                    <span className="font-mono text-[#58A6FF]">
                      {participant.rollNumber}
                    </span>
                  </div>
                )}

                {isExternal && (
                  <div className="mt-3 space-y-2">
                    <div className={`flex items-center gap-2 text-sm ${muted}`}>
                      <Mail size={14} />
                      <span className="truncate">{participant.email || "—"}</span>
                    </div>

                    <div className={`flex items-center gap-2 text-sm ${muted}`}>
                      <Phone size={14} />
                      <span>{participant.identifier || "—"}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </section>

        {error && (
          <div className="mb-5 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-500">
            {error}
          </div>
        )}

        <section className={`rounded-3xl border overflow-hidden ${cardClass}`}>
          <div
            className={`hidden md:grid grid-cols-[80px_1fr_150px_150px_150px] px-5 py-4 text-xs uppercase tracking-[0.18em] border-b ${tableHeader}`}
            style={{ fontFamily: MONO }}
          >
            <span>#</span>
            <span>Problem</span>
            <span>Difficulty</span>
            <span>Status</span>
            <span>Action</span>
          </div>

          {testProblems.length === 0 ? (
            <div className={`p-12 text-center ${muted}`}>
              No problems attached to this test.
            </div>
          ) : (
            testProblems.map((item, index) => {
              const problem = item.problem;
              const status = problemStatus[String(problem?.id)] || "NOT_STARTED";
              const statusMeta = getProblemStatusMeta(status, isDark);

              return (
                <div
                  key={item.id || `${problem?.id}-${index}`}
                  className={`grid md:grid-cols-[80px_1fr_150px_150px_150px] gap-3 md:gap-0 px-5 py-5 items-center border-b transition ${tableRow} ${statusMeta.row}`}
                >
                  <span
                    className="font-mono text-slate-500"
                    style={{ fontFamily: MONO }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div>
                    <div className="font-bold">{problem?.title}</div>
                    <div className={`text-sm mt-1 ${muted}`}>
                      Problem ID: {problem?.id}
                    </div>
                  </div>

                  <span>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-bold ${difficultyStyle(
                        problem?.difficulty,
                        isDark
                      )}`}
                    >
                      {problem?.difficulty || "—"}
                    </span>
                  </span>

                  <span>
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold ${statusMeta.badge}`}
                    >
                      {statusMeta.icon}
                      {statusMeta.label}
                    </span>
                  </span>

                  <button
                    onClick={() => openProblem(problem.id)}
                    disabled={isExpired}
                    className={`h-10 rounded-xl text-white text-sm font-semibold transition flex items-center justify-center gap-2 ${
                      isExpired
                        ? "bg-slate-500 cursor-not-allowed opacity-60"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {isExpired ? <Lock size={15} /> : <Play size={15} />}
                    {isExpired ? "Closed" : "Solve"}
                  </button>
                </div>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
}