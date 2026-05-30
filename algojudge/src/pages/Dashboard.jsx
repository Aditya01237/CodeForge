import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { problems } from "../data/problems";

const MONO = "'JetBrains Mono', 'Fira Code', ui-monospace, monospace";

const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];

const CATEGORY_FALLBACK = [
  "All",
  "Arrays",
  "Strings",
  "Linked List",
  "Stack",
  "Queue",
  "Binary Search",
  "Two Pointers",
  "Sliding Window",
  "Recursion",
  "Backtracking",
  "Tree",
  "Graph",
  "DP",
  "Greedy",
  "Heap",
  "Trie",
  "Segment Tree",
  "Bit Manipulation",
];

const difficultyClass = {
  Easy: {
    dark: "text-emerald-300 bg-emerald-400/10 border-emerald-400/20",
    light: "text-emerald-700 bg-emerald-50 border-emerald-200",
  },
  Medium: {
    dark: "text-amber-300 bg-amber-400/10 border-amber-400/20",
    light: "text-amber-700 bg-amber-50 border-amber-200",
  },
  Hard: {
    dark: "text-rose-300 bg-rose-400/10 border-rose-400/20",
    light: "text-rose-700 bg-rose-50 border-rose-200",
  },
};

function StatCard({ label, value, sub, theme }) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        theme === "dark"
          ? "bg-[#111827] border-white/10"
          : "bg-white border-slate-200 shadow-sm"
      }`}
    >
      <div
        className={`text-xs uppercase tracking-[0.18em] mb-3 ${
          theme === "dark" ? "text-slate-500" : "text-slate-500"
        }`}
        style={{ fontFamily: MONO }}
      >
        {label}
      </div>

      <div
        className={`text-3xl font-bold ${
          theme === "dark" ? "text-white" : "text-slate-950"
        }`}
      >
        {value}
      </div>

      {sub && (
        <div
          className={`text-sm mt-2 ${
            theme === "dark" ? "text-slate-400" : "text-slate-500"
          }`}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

function ThemeToggle({ theme, setTheme }) {
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={`h-10 px-4 rounded-xl border text-sm font-medium transition ${
        theme === "dark"
          ? "bg-white/5 border-white/10 text-slate-200 hover:bg-white/10"
          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
      }`}
    >
      {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}

function JoinTestCard({ theme }) {
  const navigate = useNavigate();

  return (
    <div
      className={`rounded-3xl border p-6 overflow-hidden relative ${
        theme === "dark"
          ? "bg-[#111827] border-white/10"
          : "bg-white border-slate-200 shadow-sm"
      }`}
    >
      <div
        className={`absolute -right-10 -top-10 w-36 h-36 rounded-full blur-3xl ${
          theme === "dark" ? "bg-blue-500/20" : "bg-blue-200/70"
        }`}
      />

      <div className="relative">
        <div
          className="text-xs uppercase tracking-[0.22em] text-blue-400 mb-3"
          style={{ fontFamily: MONO }}
        >
          Live Coding Test
        </div>

        <h2
          className={`text-2xl font-bold mb-2 ${
            theme === "dark" ? "text-white" : "text-slate-950"
          }`}
        >
          Join a test using ID + password
        </h2>

        <p
          className={`text-sm leading-6 mb-5 ${
            theme === "dark" ? "text-slate-400" : "text-slate-600"
          }`}
        >
          Use the test credentials shared by your faculty or organizer. College
          students can enter roll number; external participants can enter name
          or email.
        </p>

        <button
          onClick={() => navigate("/test-access")}
          className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
        >
          Join Test
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("cf_theme") || "dark";
  });

  const [search, setSearch] = useState("");
  const [diff, setDiff] = useState("All");
  const [category, setCategory] = useState("All");

  const [solved, setSolved] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("cf_solved") || "[]");
      return new Set(stored);
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    localStorage.setItem("cf_theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("cf_solved", JSON.stringify([...solved]));
  }, [solved]);

  const categories = useMemo(() => {
    const fromProblems = Array.from(
      new Set(problems.map((p) => p.category).filter(Boolean))
    );

    if (fromProblems.length === 0) return CATEGORY_FALLBACK;

    return ["All", ...fromProblems];
  }, []);

  const filtered = useMemo(() => {
    return problems.filter((p) => {
      const title = p.title || "";
      const cat = p.category || "";

      const matchSearch =
        title.toLowerCase().includes(search.toLowerCase()) ||
        cat.toLowerCase().includes(search.toLowerCase());

      const matchDifficulty = diff === "All" || p.difficulty === diff;
      const matchCategory = category === "All" || cat === category;

      return matchSearch && matchDifficulty && matchCategory;
    });
  }, [search, diff, category]);

  const toggleSolved = (e, id) => {
    e.stopPropagation();

    setSolved((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const total = problems.length;
  const solvedCount = solved.size;
  const pct = total ? Math.round((solvedCount / total) * 100) : 0;

  const easyTotal = problems.filter((p) => p.difficulty === "Easy").length;
  const mediumTotal = problems.filter((p) => p.difficulty === "Medium").length;
  const hardTotal = problems.filter((p) => p.difficulty === "Hard").length;

  const easySolved = problems.filter(
    (p) => p.difficulty === "Easy" && solved.has(p.id)
  ).length;

  const mediumSolved = problems.filter(
    (p) => p.difficulty === "Medium" && solved.has(p.id)
  ).length;

  const hardSolved = problems.filter(
    (p) => p.difficulty === "Hard" && solved.has(p.id)
  ).length;

  const pageBg =
    theme === "dark"
      ? "bg-[#070B12] text-slate-100"
      : "bg-[#F8FAFC] text-slate-950";

  const navClass =
    theme === "dark"
      ? "bg-[#0D1117]/95 border-white/10"
      : "bg-white/95 border-slate-200";

  const cardClass =
    theme === "dark"
      ? "bg-[#111827] border-white/10"
      : "bg-white border-slate-200 shadow-sm";

  const inputClass =
    theme === "dark"
      ? "bg-[#0B1220] border-white/10 text-white placeholder:text-slate-500 focus:border-blue-400"
      : "bg-white border-slate-200 text-slate-950 placeholder:text-slate-400 focus:border-blue-500";

  const muted = theme === "dark" ? "text-slate-400" : "text-slate-600";

  return (
    <div className={`min-h-screen ${pageBg} font-sans`}>
      {/* NAVBAR */}
      <nav
        className={`sticky top-0 z-40 h-16 flex items-center justify-between px-6 border-b backdrop-blur ${navClass}`}
      >
        <div className="flex items-center gap-8">
          <button
            onClick={() => navigate("/")}
            className="text-xl font-bold text-blue-400"
            style={{ fontFamily: MONO }}
          >
            CodeForge
          </button>

          <div className="hidden md:flex items-center gap-5 text-sm">
            <button
              onClick={() => window.scrollTo({ top: 420, behavior: "smooth" })}
              className={`${muted} hover:text-blue-400 transition`}
            >
              Practice
            </button>

            <button
              onClick={() => navigate("/test-access")}
              className={`${muted} hover:text-blue-400 transition`}
            >
              Tests
            </button>

            <button className={`${muted} hover:text-blue-400 transition`}>
              Submissions
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle theme={theme} setTheme={setTheme} />

          <button
            onClick={() => navigate("/test-access")}
            className="hidden sm:block h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition"
          >
            Join Test
          </button>

          <div
            className={`w-10 h-10 flex items-center justify-center rounded-full text-xs font-semibold ${
              theme === "dark"
                ? "bg-white/10 text-slate-200"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            AP
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* HERO */}
        <section className="grid lg:grid-cols-[1.25fr_0.75fr] gap-7 items-stretch mb-8">
          <div
            className={`rounded-3xl border p-8 lg:p-10 relative overflow-hidden ${cardClass}`}
          >
            <div
              className={`absolute -right-20 -top-20 w-72 h-72 rounded-full blur-3xl ${
                theme === "dark" ? "bg-blue-500/20" : "bg-blue-200/70"
              }`}
            />

            <div className="relative">
              <div
                className="text-xs uppercase tracking-[0.25em] text-blue-400 mb-5"
                style={{ fontFamily: MONO }}
              >
                DSA Practice + Coding Tests
              </div>

              <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-5">
                Master DSA.
                <br />
                <span className="text-blue-400">Crack coding tests.</span>
              </h1>

              <p className={`max-w-2xl text-lg leading-8 ${muted}`}>
                Practice curated DSA problems and join live coding tests using
                test ID and password. Built for college labs, assignments, and
                external assessments.
              </p>

              <div className="flex flex-wrap gap-3 mt-8">
                <button
                  onClick={() => window.scrollTo({ top: 620, behavior: "smooth" })}
                  className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
                >
                  Start Practice
                </button>

                <button
                  onClick={() => navigate("/test-access")}
                  className={`h-12 px-6 rounded-xl border font-semibold transition ${
                    theme === "dark"
                      ? "border-white/10 hover:bg-white/10"
                      : "border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Join Coding Test
                </button>
              </div>
            </div>
          </div>

          <JoinTestCard theme={theme} />
        </section>

        {/* STATS */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            theme={theme}
            label="Total Progress"
            value={`${solvedCount}/${total}`}
            sub={`${pct}% of sheet completed`}
          />

          <StatCard
            theme={theme}
            label="Easy"
            value={`${easySolved}/${easyTotal}`}
            sub="Foundation problems"
          />

          <StatCard
            theme={theme}
            label="Medium"
            value={`${mediumSolved}/${mediumTotal}`}
            sub="Interview-level patterns"
          />

          <StatCard
            theme={theme}
            label="Hard"
            value={`${hardSolved}/${hardTotal}`}
            sub="Advanced practice"
          />
        </section>

        {/* PROGRESS BAR */}
        <section className={`rounded-2xl border p-5 mb-8 ${cardClass}`}>
          <div className="flex items-center justify-between mb-3">
            <div
              className={`text-xs uppercase tracking-[0.18em] ${
                theme === "dark" ? "text-slate-500" : "text-slate-500"
              }`}
              style={{ fontFamily: MONO }}
            >
              Overall Progress
            </div>

            <div className="text-sm font-semibold text-blue-400">{pct}%</div>
          </div>

          <div
            className={`h-2 rounded-full overflow-hidden ${
              theme === "dark" ? "bg-[#0B1220]" : "bg-slate-100"
            }`}
          >
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </section>

        {/* PRACTICE SECTION HEADER */}
        <section className="mb-5">
          <div
            className="text-xs uppercase tracking-[0.25em] text-blue-400 mb-3"
            style={{ fontFamily: MONO }}
          >
            Practice Sheet
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold">Curated DSA Problems</h2>
              <p className={`mt-2 ${muted}`}>
                Search, filter, mark solved, and open the editor to practice.
              </p>
            </div>

            <div className={`text-sm ${muted}`}>
              Showing <span className="font-semibold text-blue-400">{filtered.length}</span>{" "}
              of <span className="font-semibold">{total}</span>
            </div>
          </div>
        </section>

        {/* FILTERS */}
        <section className={`rounded-2xl border p-4 mb-5 ${cardClass}`}>
          <div className="grid lg:grid-cols-[1fr_220px_220px] gap-3">
            <input
              className={`h-12 rounded-xl border px-4 outline-none transition ${inputClass}`}
              placeholder="Search by title or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`h-12 rounded-xl border px-4 outline-none transition ${inputClass}`}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={diff}
              onChange={(e) => setDiff(e.target.value)}
              className={`h-12 rounded-xl border px-4 outline-none transition ${inputClass}`}
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setDiff(d)}
                className={`h-9 px-4 rounded-xl border text-xs uppercase tracking-wider transition ${
                  diff === d
                    ? "border-blue-400 text-blue-400 bg-blue-500/10"
                    : theme === "dark"
                      ? "border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
                style={{ fontFamily: MONO }}
              >
                {d}
              </button>
            ))}
          </div>
        </section>

        {/* TABLE */}
        <section className={`rounded-2xl border overflow-hidden ${cardClass}`}>
          <div
            className={`hidden md:grid grid-cols-[70px_1fr_180px_130px_120px_90px] px-5 py-4 text-xs uppercase tracking-[0.18em] border-b ${
              theme === "dark"
                ? "text-slate-500 border-white/10 bg-white/[0.02]"
                : "text-slate-500 border-slate-200 bg-slate-50"
            }`}
            style={{ fontFamily: MONO }}
          >
            <span>#</span>
            <span>Title</span>
            <span>Category</span>
            <span>Difficulty</span>
            <span>Acceptance</span>
            <span>Done</span>
          </div>

          {filtered.length === 0 ? (
            <div className={`p-12 text-center ${muted}`}>
              No problems found.
            </div>
          ) : (
            filtered.map((p, index) => {
              const isSolved = solved.has(p.id);
              const diffStyle =
                difficultyClass[p.difficulty]?.[theme] ||
                "text-slate-400 bg-slate-400/10 border-slate-400/20";

              return (
                <div
                  key={p.id}
                  onClick={() => navigate(`/problem/${p.id}`)}
                  className={`grid md:grid-cols-[70px_1fr_180px_130px_120px_90px] gap-3 md:gap-0 px-5 py-4 md:items-center border-b cursor-pointer transition ${
                    theme === "dark"
                      ? "border-white/5 hover:bg-white/[0.04]"
                      : "border-slate-100 hover:bg-slate-50"
                  } ${isSolved ? "opacity-70" : ""}`}
                >
                  <span
                    className={`text-sm ${
                      theme === "dark" ? "text-slate-500" : "text-slate-400"
                    }`}
                    style={{ fontFamily: MONO }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div>
                    <div
                      className={`font-semibold ${
                        theme === "dark" ? "text-white" : "text-slate-950"
                      }`}
                    >
                      {p.title}
                    </div>

                    <div className={`md:hidden text-sm mt-1 ${muted}`}>
                      {p.category} • {p.difficulty}
                    </div>
                  </div>

                  <span
                    className={`hidden md:block text-sm ${
                      theme === "dark" ? "text-slate-400" : "text-slate-500"
                    }`}
                    style={{ fontFamily: MONO }}
                  >
                    {p.category || "General"}
                  </span>

                  <span>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${diffStyle}`}
                    >
                      {p.difficulty || "Easy"}
                    </span>
                  </span>

                  <span
                    className={`hidden md:block text-sm ${
                      theme === "dark" ? "text-slate-400" : "text-slate-500"
                    }`}
                    style={{ fontFamily: MONO }}
                  >
                    {p.acceptance ? `${p.acceptance}%` : "—"}
                  </span>

                  <button
                    onClick={(e) => toggleSolved(e, p.id)}
                    className={`w-7 h-7 rounded-lg border flex items-center justify-center text-sm transition ${
                      isSolved
                        ? "border-emerald-400 text-emerald-300 bg-emerald-400/10"
                        : theme === "dark"
                          ? "border-white/10 text-transparent hover:text-emerald-300 hover:border-emerald-400"
                          : "border-slate-300 text-transparent hover:text-emerald-600 hover:border-emerald-500"
                    }`}
                  >
                    ✓
                  </button>
                </div>
              );
            })
          )}
        </section>

        <div className={`mt-5 text-xs ${muted}`} style={{ fontFamily: MONO }}>
          Tip: Use practice for learning. Use Join Test for faculty/organizer
          coding tests.
        </div>
      </main>
    </div>
  );
}