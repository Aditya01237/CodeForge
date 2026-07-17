import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Moon,
  Sun,
  Plus,
  ClipboardCopy,
  LockKeyhole,
  Users,
  CalendarClock,
  ExternalLink,
  BookOpen,
  BarChart3,
} from "lucide-react";
import { apiGet } from "../api";

const MONO = "'JetBrains Mono', 'Fira Code', ui-monospace, monospace";

export default function FacultyDashboard() {
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("cf_theme") || "dark";
  });

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusReferenceTime] = useState(() => Date.now());

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
    apiGet("/faculty/tests")
      .then((data) => setTests(Array.isArray(data) ? data : []))
      .catch(() => setError("Failed to load coding tests."))
      .finally(() => setLoading(false));
  }, []);

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

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text || "");
    } catch {
      // no-op
    }
  };

  const formatDateTime = (value) => {
    if (!value) return "Not set";
    return new Date(value).toLocaleString();
  };

  const getTestStatus = (test) => {
    const start = test.startTime ? new Date(test.startTime).getTime() : null;
    const end = test.endTime ? new Date(test.endTime).getTime() : null;

    if (start && statusReferenceTime < start) return "UPCOMING";
    if (end && statusReferenceTime > end) return "ENDED";
    return "LIVE";
  };

  const statusClass = (status) => {
    if (status === "LIVE") {
      return isDark
        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
        : "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (status === "UPCOMING") {
      return isDark
        ? "border-blue-400/20 bg-blue-400/10 text-blue-300"
        : "border-blue-200 bg-blue-50 text-blue-700";
    }

    return isDark
      ? "border-slate-400/20 bg-slate-400/10 text-slate-300"
      : "border-slate-200 bg-slate-50 text-slate-700";
  };

  return (
    <div className={`min-h-screen ${pageClass}`}>
      <nav
        className={`h-16 px-6 flex items-center justify-between border-b ${navClass}`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className={`h-10 w-10 rounded-xl border flex items-center justify-center transition ${softButton}`}
          >
            <Home size={17} />
          </button>

          <button
            onClick={() => navigate("/")}
            className="text-xl font-bold text-[#58A6FF]"
            style={{ fontFamily: MONO }}
          >
            CodeForge
          </button>

          <div
            className={`hidden md:block h-7 w-px ${
              isDark ? "bg-white/10" : "bg-slate-200"
            }`}
          />

          <div className="hidden md:block">
            <div className="font-bold">Faculty Dashboard</div>
            <div className={`text-xs ${muted}`}>
              Create tests and manage assessments
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`h-10 px-4 rounded-xl border flex items-center gap-2 text-sm font-semibold transition ${softButton}`}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
            {isDark ? "Light" : "Dark"}
          </button>

          <button
            onClick={() => navigate("/faculty/tests/create")}
            className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition flex items-center gap-2"
          >
            <Plus size={16} />
            Create Test
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <section className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6 mb-8">
          <div
            className={`rounded-3xl border p-8 relative overflow-hidden ${cardClass}`}
          >
            <div
              className={`absolute -right-20 -top-20 h-72 w-72 rounded-full blur-3xl ${
                isDark ? "bg-blue-500/20" : "bg-blue-200/70"
              }`}
            />

            <div className="relative">
              <div
                className="text-xs uppercase tracking-[0.25em] text-[#58A6FF] mb-4"
                style={{ fontFamily: MONO }}
              >
                Faculty Control Center
              </div>

              <h1 className="text-5xl font-black leading-tight mb-4">
                Create tests.
                <br />
                <span className="text-[#58A6FF]">Track results.</span>
              </h1>

              <p className={`text-lg leading-8 max-w-2xl ${muted}`}>
                Build coding tests with password access, attach DSA problems,
                monitor submissions, and view participant-wise results from the
                faculty result dashboard.
              </p>

              <div className="flex flex-wrap gap-3 mt-7">
                <button
                  onClick={() => navigate("/faculty/tests/create")}
                  className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition flex items-center gap-2"
                >
                  <Plus size={18} />
                  Create New Test
                </button>

                <button
                  onClick={() => navigate("/")}
                  className={`h-12 px-6 rounded-xl border font-semibold transition ${softButton}`}
                >
                  View Student Dashboard
                </button>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 lg:grid-cols-1 gap-4">
            <div className={`rounded-3xl border p-5 ${cardClass}`}>
              <CalendarClock className="text-[#58A6FF] mb-3" size={22} />
              <div className="text-3xl font-black">{tests.length}</div>
              <div className={`text-sm mt-1 ${muted}`}>Total Tests</div>
            </div>

            <div className={`rounded-3xl border p-5 ${cardClass}`}>
              <Users className="text-[#58A6FF] mb-3" size={22} />
              <div className="text-3xl font-black">Live</div>
              <div className={`text-sm mt-1 ${muted}`}>Participants tracked</div>
            </div>

            <div className={`rounded-3xl border p-5 ${cardClass}`}>
              <BarChart3 className="text-[#58A6FF] mb-3" size={22} />
              <div className="text-3xl font-black">CSV</div>
              <div className={`text-sm mt-1 ${muted}`}>Result export ready</div>
            </div>
          </div>
        </section>

        <section className={`rounded-3xl border overflow-hidden ${cardClass}`}>
          <div
            className={`px-6 py-5 border-b ${
              isDark ? "border-white/10" : "border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black">Coding Tests</h2>
                <p className={`text-sm mt-1 ${muted}`}>
                  Existing tests created by faculty.
                </p>
              </div>

              <button
                onClick={() => navigate("/faculty/tests/create")}
                className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition flex items-center gap-2"
              >
                <Plus size={16} />
                New
              </button>
            </div>
          </div>

          {loading ? (
            <div className={`p-10 text-center ${muted}`}>Loading tests...</div>
          ) : error ? (
            <div className="p-10 text-center text-rose-500">{error}</div>
          ) : tests.length === 0 ? (
            <div className={`p-12 text-center ${muted}`}>
              No tests created yet.
            </div>
          ) : (
            <div>
              {tests.map((test) => {
                const status = getTestStatus(test);

                return (
                  <div
                    key={test.id}
                    className={`grid xl:grid-cols-[1fr_180px_180px_300px] gap-4 px-6 py-5 border-b items-center ${
                      isDark
                        ? "border-white/5 hover:bg-white/[0.03]"
                        : "border-slate-100 hover:bg-slate-50"
                    } transition`}
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-bold text-lg">{test.title}</h3>
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusClass(
                            status,
                          )}`}
                        >
                          {status}
                        </span>
                      </div>

                      <div className={`text-sm mt-2 ${muted}`}>
                        Start: {formatDateTime(test.startTime)} · End:{" "}
                        {formatDateTime(test.endTime)}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs uppercase tracking-widest text-slate-500 mb-1">
                        Test ID
                      </div>
                      <button
                        onClick={() => copyText(test.testCode)}
                        className={`h-9 px-3 rounded-xl border flex items-center gap-2 font-mono text-sm transition ${softButton}`}
                      >
                        {test.testCode}
                        <ClipboardCopy size={14} />
                      </button>
                    </div>

                    <div>
                      <div className="text-xs uppercase tracking-widest text-slate-500 mb-1">
                        Password
                      </div>
                      <button
                        onClick={() => copyText(test.testPassword || "")}
                        className={`h-9 px-3 rounded-xl border flex items-center gap-2 text-sm transition ${softButton}`}
                      >
                        <LockKeyhole size={14} />
                        {test.testPassword || "—"}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => navigate(`/test-access`)}
                        className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition flex items-center gap-2"
                      >
                        <ExternalLink size={15} />
                        Open
                      </button>

                      <button
                        onClick={() =>
                          navigate(`/faculty/tests/${test.id}/manage`)
                        }
                        className={`h-10 px-4 rounded-xl border text-sm font-semibold transition ${softButton}`}
                      >
                        <BookOpen size={15} />
                        Manage
                      </button>

                      <button
                        onClick={() =>
                          navigate(`/faculty/tests/${test.id}/results`)
                        }
                        className={`h-10 px-4 rounded-xl border text-sm font-semibold transition ${softButton}`}
                      >
                        <BarChart3 size={15} />
                        Results
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
