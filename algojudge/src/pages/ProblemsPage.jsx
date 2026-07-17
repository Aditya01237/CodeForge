import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { apiGet } from "../api";
import {
  DIFFICULTIES,
  filterProblems,
  getProblemCategories,
} from "../utils/problemFilters";

const difficultyClass = {
  Easy: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  Medium: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  Hard: "border-rose-400/20 bg-rose-400/10 text-rose-300",
};

export default function ProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    apiGet("/problems")
      .then((data) => setProblems(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message || "Failed to load problems."))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => getProblemCategories(problems), [problems]);
  const filteredProblems = useMemo(
    () => filterProblems(problems, { query, difficulty, category }),
    [problems, query, difficulty, category],
  );

  return (
    <div className="min-h-screen bg-[#070B12] text-slate-100">
      <header className="border-b border-white/10 bg-[#0D1117]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <Link to="/" className="font-mono text-xl font-bold text-blue-400">
              CodeForge
            </Link>
            <p className="mt-1 text-sm text-slate-400">
              Search the practice library and open a problem workspace.
            </p>
          </div>
          <Link
            to="/"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-blue-400">
              Practice library
            </p>
            <h1 className="text-3xl font-bold">Choose your next problem</h1>
          </div>
          <p className="text-sm text-slate-400">
            {filteredProblems.length} of {problems.length} problems
          </p>
        </div>

        <section className="mb-6 grid gap-3 rounded-2xl border border-white/10 bg-[#111827] p-4 md:grid-cols-[1fr_190px_190px]">
          <label className="relative">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title or category"
              className="h-11 w-full rounded-xl border border-white/10 bg-[#070B12] pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-600 focus:border-blue-400"
            />
          </label>

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-11 rounded-xl border border-white/10 bg-[#070B12] px-4 text-sm outline-none focus:border-blue-400"
          >
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <select
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value)}
            className="h-11 rounded-xl border border-white/10 bg-[#070B12] px-4 text-sm outline-none focus:border-blue-400"
          >
            {DIFFICULTIES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </section>

        {loading && (
          <div className="rounded-2xl border border-white/10 bg-[#111827] p-8 text-slate-400">
            Loading problems...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-5 text-rose-300">
            {error}
          </div>
        )}

        {!loading && !error && filteredProblems.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-[#111827] p-10 text-center text-slate-400">
            No problems match the selected filters.
          </div>
        )}

        {!loading && !error && filteredProblems.length > 0 && (
          <div className="grid gap-3">
            {filteredProblems.map((problem, index) => (
              <Link
                key={problem.id}
                to={`/problems/${problem.id}`}
                className="group grid gap-4 rounded-2xl border border-white/10 bg-[#111827] p-5 transition hover:-translate-y-0.5 hover:border-blue-400/40 hover:bg-[#141d2d] sm:grid-cols-[56px_1fr_auto] sm:items-center"
              >
                <span className="font-mono text-sm text-slate-500">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2 className="font-semibold text-white group-hover:text-blue-300">
                    {problem.title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {problem.category || "General"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      difficultyClass[problem.difficulty] ||
                      "border-white/10 bg-white/5 text-slate-300"
                    }`}
                  >
                    {problem.difficulty || "Unrated"}
                  </span>
                  <span className="text-sm font-semibold text-blue-400">
                    Solve →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
