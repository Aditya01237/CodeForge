import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Clock3,
  Medal,
  RefreshCw,
  Trophy,
  Users,
} from "lucide-react";
import { apiGet } from "../api";

const MONO = "'JetBrains Mono', 'Fira Code', ui-monospace, monospace";

const formatTime = (value) => {
  if (!value) return "No submissions";
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function LiveLeaderboardPage() {
  const { testId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const facultyView = location.pathname.startsWith("/faculty/");

  const [theme] = useState(
    () => localStorage.getItem("cf_theme") || "dark",
  );
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastRefresh, setLastRefresh] = useState(null);

  const isDark = theme === "dark";

  const loadLeaderboard = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setRefreshing(true);

    try {
      const data = await apiGet(`/tests/${testId}/leaderboard`);
      setLeaderboard(data);
      setLastRefresh(new Date());
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load the live leaderboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [testId]);

  useEffect(() => {
    loadLeaderboard();
    const interval = window.setInterval(
      () => loadLeaderboard({ silent: true }),
      5000,
    );
    return () => window.clearInterval(interval);
  }, [loadLeaderboard]);

  const entries = useMemo(
    () => (Array.isArray(leaderboard?.entries) ? leaderboard.entries : []),
    [leaderboard],
  );

  const podium = entries.slice(0, 3);
  const activeCount = entries.filter(
    (entry) => String(entry.status).toUpperCase() === "IN_PROGRESS",
  ).length;

  const pageClass = isDark
    ? "bg-[#070B12] text-white"
    : "bg-[#F8FAFC] text-slate-950";
  const navClass = isDark
    ? "bg-[#0D1117]/95 border-white/10"
    : "bg-white/95 border-slate-200";
  const cardClass = isDark
    ? "bg-[#111827] border-white/10"
    : "bg-white border-slate-200 shadow-sm";
  const muted = isDark ? "text-slate-400" : "text-slate-600";
  const softButton = isDark
    ? "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100";

  const goBack = () => {
    navigate(
      facultyView
        ? `/faculty/tests/${testId}/results`
        : `/test/${testId}/problems`,
    );
  };

  return (
    <div className={`min-h-screen ${pageClass}`}>
      <nav
        className={`sticky top-0 z-40 h-16 px-6 flex items-center justify-between border-b backdrop-blur ${navClass}`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={goBack}
            className={`h-10 w-10 rounded-xl border flex items-center justify-center ${softButton}`}
            aria-label="Go back"
          >
            <ArrowLeft size={17} />
          </button>

          <div>
            <div className="flex items-center gap-2 font-black">
              <Trophy size={18} className="text-amber-400" />
              Live Leaderboard
            </div>
            <div className={`text-xs ${muted}`}>
              {leaderboard?.title || `Test #${testId}`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Auto-refreshing
          </div>
          <button
            onClick={() => loadLeaderboard()}
            disabled={refreshing}
            className={`h-10 px-4 rounded-xl border flex items-center gap-2 text-sm font-semibold ${softButton}`}
          >
            <RefreshCw
              size={15}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <section
          className={`rounded-3xl border p-7 mb-6 relative overflow-hidden ${cardClass}`}
        >
          <div
            className={`absolute -right-16 -top-16 h-64 w-64 rounded-full blur-3xl ${
              isDark ? "bg-amber-500/15" : "bg-amber-200/60"
            }`}
          />
          <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div
                className="text-xs uppercase tracking-[0.24em] text-amber-400 mb-3"
                style={{ fontFamily: MONO }}
              >
                Real-time contest standings
              </div>
              <h1 className="text-4xl lg:text-5xl font-black">
                Every accepted solution
                <span className="text-amber-400"> changes the board.</span>
              </h1>
              <p className={`mt-4 max-w-3xl leading-7 ${muted}`}>
                Rankings use each participant&apos;s best score per problem.
                Ties are resolved by solved count and earliest latest
                submission.
              </p>
            </div>

            <div className={`text-sm ${muted}`}>
              Updated{" "}
              <span className={isDark ? "text-white" : "text-slate-950"}>
                {lastRefresh ? lastRefresh.toLocaleTimeString() : "—"}
              </span>
            </div>
          </div>
        </section>

        <section className="grid sm:grid-cols-3 gap-4 mb-6">
          <div className={`rounded-2xl border p-5 ${cardClass}`}>
            <Users className="text-blue-400 mb-3" size={22} />
            <div className="text-3xl font-black">
              {leaderboard?.totalParticipants ?? 0}
            </div>
            <div className={`text-sm mt-1 ${muted}`}>Registered</div>
          </div>
          <div className={`rounded-2xl border p-5 ${cardClass}`}>
            <Clock3 className="text-emerald-400 mb-3" size={22} />
            <div className="text-3xl font-black">{activeCount}</div>
            <div className={`text-sm mt-1 ${muted}`}>Currently coding</div>
          </div>
          <div className={`rounded-2xl border p-5 ${cardClass}`}>
            <CheckCircle2 className="text-violet-400 mb-3" size={22} />
            <div className="text-3xl font-black">
              {leaderboard?.totalProblems ?? 0}
            </div>
            <div className={`text-sm mt-1 ${muted}`}>Problems</div>
          </div>
        </section>

        {podium.length > 0 && (
          <section className="grid md:grid-cols-3 gap-4 mb-6">
            {podium.map((entry, index) => {
              const styles = [
                "border-amber-400/30 bg-amber-400/10",
                "border-slate-400/30 bg-slate-400/10",
                "border-orange-500/30 bg-orange-500/10",
              ];

              return (
                <div
                  key={entry.participantId}
                  className={`rounded-3xl border p-6 ${
                    styles[index] || styles[2]
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div
                        className="text-xs uppercase tracking-[0.2em] opacity-60"
                        style={{ fontFamily: MONO }}
                      >
                        Rank #{entry.rank}
                      </div>
                      <div className="text-xl font-black mt-2">
                        {entry.displayName || entry.rollNumber || "Participant"}
                      </div>
                      <div className={`text-sm mt-1 ${muted}`}>
                        {entry.rollNumber || "External participant"}
                      </div>
                    </div>
                    {index === 0 ? (
                      <Trophy className="text-amber-400" size={30} />
                    ) : (
                      <Medal
                        className={
                          index === 1 ? "text-slate-400" : "text-orange-500"
                        }
                        size={30}
                      />
                    )}
                  </div>
                  <div className="flex items-end justify-between mt-6">
                    <div>
                      <div className="text-3xl font-black">
                        {entry.totalScore}
                      </div>
                      <div className={`text-xs ${muted}`}>
                        of {entry.maxScore} points
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-400">
                        {entry.solvedCount} solved
                      </div>
                      <div className={`text-xs ${muted}`}>
                        {entry.attemptedCount} attempted
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        <section className={`rounded-3xl border overflow-hidden ${cardClass}`}>
          <div
            className={`grid grid-cols-[70px_1fr_110px_130px_130px] px-5 py-4 text-xs uppercase tracking-[0.16em] border-b ${
              isDark
                ? "border-white/10 bg-white/[0.02] text-slate-500"
                : "border-slate-200 bg-slate-50 text-slate-500"
            }`}
            style={{ fontFamily: MONO }}
          >
            <span>Rank</span>
            <span>Participant</span>
            <span>Solved</span>
            <span>Score</span>
            <span>Last update</span>
          </div>

          {loading ? (
            <div className={`p-14 text-center ${muted}`}>
              Loading live standings...
            </div>
          ) : error && entries.length === 0 ? (
            <div className="p-14 text-center text-rose-500">{error}</div>
          ) : entries.length === 0 ? (
            <div className={`p-14 text-center ${muted}`}>
              <Award size={34} className="mx-auto mb-3 opacity-50" />
              The leaderboard will appear after participants join.
            </div>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.participantId}
                className={`grid grid-cols-[70px_1fr_110px_130px_130px] px-5 py-4 items-center border-b ${
                  isDark
                    ? "border-white/5 hover:bg-white/[0.03]"
                    : "border-slate-100 hover:bg-slate-50"
                }`}
              >
                <span
                  className={`font-black ${
                    entry.rank <= 3 ? "text-amber-400" : muted
                  }`}
                >
                  #{entry.rank}
                </span>
                <div>
                  <div className="font-bold">
                    {entry.displayName || entry.rollNumber || "Participant"}
                  </div>
                  <div className={`text-xs mt-1 ${muted}`}>
                    {entry.rollNumber || entry.status}
                  </div>
                </div>
                <span className="font-bold text-emerald-400">
                  {entry.solvedCount}/{leaderboard?.totalProblems || 0}
                </span>
                <div>
                  <div className="font-black">{entry.totalScore}</div>
                  <div className={`text-xs ${muted}`}>/{entry.maxScore}</div>
                </div>
                <span className={`text-sm ${muted}`}>
                  {formatTime(entry.latestSubmittedAt)}
                </span>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
