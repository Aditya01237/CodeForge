import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet } from "../api";
import { Home, Moon, Sun, Clock, UserRound } from "lucide-react";

const MONO = "'JetBrains Mono', 'Fira Code', ui-monospace, monospace";

export default function TestProblemsPage() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => localStorage.getItem("cf_theme") || "dark");
  const [test, setTest] = useState(null);
  const [participant, setParticipant] = useState(null);
  const [testProblems, setTestProblems] = useState([]);
  const [error, setError] = useState("");

  const isDark = theme === "dark";

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

    setTest(JSON.parse(testRaw));
    setParticipant(JSON.parse(participantRaw));

    apiGet(`/tests/${testId}/problems`)
      .then(setTestProblems)
      .catch(() => setError("Failed to load test problems."));
  }, [testId, navigate]);

  if (!test || !participant) {
    return <div className="min-h-screen bg-[#070B12] text-white p-8">Loading test...</div>;
  }

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

  const participantLabel =
    participant.participantType === "STUDENT"
      ? participant.rollNumber
      : participant.name;

  return (
    <div className={`min-h-screen ${pageClass}`}>
      <nav className={`h-16 px-6 flex items-center justify-between border-b ${navClass}`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/test/${testId}/lobby`)}
            className={`h-10 w-10 rounded-xl border flex items-center justify-center transition ${softButton}`}
          >
            <Home size={17} />
          </button>

          <div>
            <div className="text-xl font-bold text-[#58A6FF]" style={{ fontFamily: MONO }}>
              CodeForge
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`hidden md:flex h-10 px-3 rounded-xl border items-center gap-2 text-sm ${softButton}`}>
            <UserRound size={15} />
            {participantLabel}
          </div>

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
        <div className="mb-7 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div
              className="text-xs uppercase tracking-[0.25em] text-[#58A6FF] mb-3"
              style={{ fontFamily: MONO }}
            >
              Coding Test
            </div>

            <h1 className="text-4xl font-black">{test.title}</h1>

            <p className={`mt-2 ${muted}`}>
              Solve assigned problems. Submit uses hidden test cases.
            </p>
          </div>

          <div className={`rounded-2xl border px-5 py-3 ${cardClass}`}>
            <div className="flex items-center gap-2 text-[#58A6FF]">
              <Clock size={17} />
              <span className="font-bold">{test.durationMinutes || 90} min</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-500">
            {error}
          </div>
        )}

        <section className={`rounded-3xl border overflow-hidden ${cardClass}`}>
          <div
            className={`hidden md:grid grid-cols-[80px_1fr_150px_130px] px-5 py-4 text-xs uppercase tracking-[0.18em] border-b ${
              isDark
                ? "text-slate-500 border-white/10 bg-white/[0.02]"
                : "text-slate-500 border-slate-200 bg-slate-50"
            }`}
            style={{ fontFamily: MONO }}
          >
            <span>#</span>
            <span>Problem</span>
            <span>Difficulty</span>
            <span>Action</span>
          </div>

          {testProblems.length === 0 ? (
            <div className={`p-12 text-center ${muted}`}>
              No problems attached to this test.
            </div>
          ) : (
            testProblems.map((item, index) => {
              const problem = item.problem;

              return (
                <div
                  key={item.id}
                  className={`grid md:grid-cols-[80px_1fr_150px_130px] gap-3 md:gap-0 px-5 py-5 items-center border-b transition ${
                    isDark
                      ? "border-white/5 hover:bg-white/[0.04]"
                      : "border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  <span className="font-mono text-slate-500">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div>
                    <div className="font-bold">{problem?.title}</div>
                    <div className={`text-sm mt-1 ${muted}`}>
                      Problem ID: {problem?.id}
                    </div>
                  </div>

                  <span className="text-sm text-[#58A6FF] font-semibold">
                    {problem?.difficulty || "—"}
                  </span>

                  <button
                    onClick={() =>
                      navigate(`/problem/${problem.id}?mode=test&testId=${testId}`)
                    }
                    className="h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition"
                  >
                    Solve
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