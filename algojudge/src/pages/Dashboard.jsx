import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { problems } from "../data/problems";

const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];

export default function Dashboard() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [diff, setDiff] = useState("All");
  const [solved, setSolved] = useState(new Set());

  const filtered = useMemo(() => {
    return problems.filter((p) => {
      const matchS =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());
      const matchD = diff === "All" || p.difficulty === diff;
      return matchS && matchD;
    });
  }, [search, diff]);

  const toggle = (e, id) => {
    e.stopPropagation();
    setSolved((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const total = problems.length;
  const pct = total ? Math.round((solved.size / total) * 100) : 0;

  return (
    <div className="h-screen flex flex-col bg-[#0D1117] text-gray-200 font-sans">
      {/* NAV */}
      <nav className="h-14 flex items-center justify-between px-6 border-b border-white/5 bg-[#161B22]">
        {/* LEFT */}
        <div className="flex items-center gap-4">
          {/* Logo */}
          <span className="text-lg font-semibold text-[#58A6FF] font-mono">
            CodeForge
          </span>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          {/* Profile */}
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#2A2F3A] text-xs text-gray-300">
            AP
          </div>
        </div>
      </nav>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto px-6 py-8 max-w-6xl mx-auto w-full">
        {/* HERO */}
        <div className="mb-10 border-b border-white/5 pb-8">
          <div className="text-[10px] uppercase tracking-widest text-blue-400 mb-4 font-mono">
            ● DSA Problem Sheet
          </div>

          <h1 className="text-4xl font-bold leading-tight mb-3">
            Master Every <br />
            <span className="text-blue-400">Algorithm.</span>
          </h1>

          <p className="text-sm text-gray-400">
            {total} problems curated for interview prep.
          </p>
        </div>

        {/* PROGRESS */}
        <div className="mb-6 flex items-center gap-4 bg-[#161B22] border border-white/5 rounded-lg px-4 py-3">
          <span className="text-xs uppercase tracking-widest text-gray-400 font-mono">
            Progress
          </span>

          <div className="flex-1 h-1 bg-[#21262D] rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-400 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>

          <span className="text-sm font-mono text-blue-400">{pct}%</span>
        </div>

        {/* CONTROLS */}
        <div className="flex gap-3 mb-4 flex-wrap">
          <input
            className="flex-1 min-w-[200px] bg-[#161B22] border border-white/5 rounded-md px-4 py-2 text-sm outline-none focus:border-blue-400"
            placeholder="Search problems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="flex gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setDiff(d)}
                className={`text-xs uppercase tracking-wider px-4 py-2 rounded-md border transition ${
                  diff === d
                    ? "border-blue-400 text-blue-400 bg-blue-400/10"
                    : "border-white/10 text-gray-400 hover:text-white"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-[#161B22] border border-white/5 rounded-lg overflow-hidden">
          {/* HEADER */}
          <div className="grid grid-cols-[50px_1fr_160px_110px_100px_60px] px-4 py-3 text-[10px] uppercase tracking-widest text-gray-500 font-mono border-b border-white/5">
            <span>#</span>
            <span>Title</span>
            <span>Category</span>
            <span>Difficulty</span>
            <span>Acceptance</span>
            <span>Done</span>
          </div>

          {/* ROWS */}
          {filtered.length === 0 ? (
            <div className="p-10 text-center text-gray-500 font-mono text-sm">
              No problems found.
            </div>
          ) : (
            filtered.map((p) => {
              const isSolved = solved.has(p.id);

              return (
                <div
                  key={p.id}
                  onClick={() => navigate(`/problem/${p.id}`)}
                  className={`grid grid-cols-[50px_1fr_160px_110px_100px_60px] px-4 items-center h-14 border-b border-white/5 cursor-pointer transition ${
                    isSolved ? "opacity-60" : ""
                  } hover:bg-white/5`}
                >
                  <span className="text-xs font-mono text-gray-500">
                    {String(p.id).padStart(2, "0")}
                  </span>

                  <span className="text-sm font-medium">{p.title}</span>

                  <span className="text-xs text-gray-500 font-mono">
                    {p.category}
                  </span>

                  <span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        p.difficulty === "Easy"
                          ? "text-green-400 bg-green-400/10"
                          : p.difficulty === "Medium"
                            ? "text-yellow-400 bg-yellow-400/10"
                            : "text-red-400 bg-red-400/10"
                      }`}
                    >
                      {p.difficulty}
                    </span>
                  </span>

                  <span className="text-xs font-mono text-gray-400">
                    {p.acceptance}%
                  </span>

                  <button
                    onClick={(e) => toggle(e, p.id)}
                    className={`w-5 h-5 border rounded flex items-center justify-center text-xs transition ${
                      isSolved
                        ? "border-green-400 text-green-400 bg-green-400/10"
                        : "border-white/10 text-transparent hover:text-green-400 hover:border-green-400"
                    }`}
                  >
                    ✓
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-4 text-xs text-gray-500 font-mono">
          Showing {filtered.length} of {total}
        </div>
      </div>
    </div>
  );
}
