import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Code2,
  Download,
  Eye,
  Moon,
  RefreshCcw,
  Search,
  Sun,
  X,
} from "lucide-react";
import { apiGet } from "../api";

const MONO = "'JetBrains Mono', 'Fira Code', ui-monospace, monospace";

const formatDateTime = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleString();
};

const formatTime = (value) => {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

const getProblemTime = (problem) => {
  return (
    problem.acceptedAt ||
    problem.latestSubmittedAt ||
    problem.latestSubmissionAt ||
    problem.submittedAt ||
    null
  );
};

const getCellMeta = (problem, isDark) => {
  const status = String(problem?.problemStatus || "").toUpperCase();
  const time = formatTime(getProblemTime(problem));

  if (status === "ACCEPTED") {
    return {
      text: `✓ ${time}`,
      cls: isDark
        ? "text-emerald-300 bg-emerald-400/10 border-emerald-400/20"
        : "text-emerald-700 bg-emerald-50 border-emerald-200",
    };
  }

  if (status === "ATTEMPTED") {
    return {
      text: `WA ${time}`,
      cls: isDark
        ? "text-amber-300 bg-amber-400/10 border-amber-400/20"
        : "text-amber-700 bg-amber-50 border-amber-200",
    };
  }

  return {
    text: "—",
    cls: isDark
      ? "text-slate-500 bg-white/[0.02] border-white/10"
      : "text-slate-400 bg-slate-50 border-slate-200",
  };
};

export default function FacultyResultsPage() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("cf_theme") || "dark";
  });

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");

  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  const isDark = theme === "dark";

  useEffect(() => {
    localStorage.setItem("cf_theme", theme);

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const loadResults = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setRefreshing(true);
    setError("");

    try {
      const result = await apiGet(`/faculty/tests/${testId}/results`);
      setData(result);
    } catch (err) {
      setError(err.message || "Failed to load results.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, [testId]);

  const problemColumns = useMemo(() => {
    const map = new Map();

    (data?.participants || []).forEach((participant) => {
      (participant.problems || []).forEach((problem, index) => {
        if (!map.has(problem.problemId)) {
          map.set(problem.problemId, {
            problemId: problem.problemId,
            title: problem.problemTitle || `Q${index + 1}`,
          });
        }
      });
    });

    return Array.from(map.values());
  }, [data]);

  const filteredParticipants = useMemo(() => {
    const participants = data?.participants || [];

    return participants
      .filter((p) => {
        const text = [
          p.name,
          p.rollNumber,
          p.email,
          p.identifier,
          p.status,
          p.latestSubmissionStatus,
          p.latestSubmissionProblemTitle,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return text.includes(query.trim().toLowerCase());
      })
      .sort((a, b) => {
        const solvedDiff = (b.solvedCount ?? 0) - (a.solvedCount ?? 0);
        if (solvedDiff !== 0) return solvedDiff;

        const scoreDiff = (b.totalScore ?? 0) - (a.totalScore ?? 0);
        if (scoreDiff !== 0) return scoreDiff;

        return String(a.name || "").localeCompare(String(b.name || ""));
      });
  }, [data, query]);

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

  const inputClass = isDark
    ? "border-white/10 bg-[#0D1117] text-white placeholder:text-slate-500"
    : "border-slate-200 bg-white text-slate-950 placeholder:text-slate-400";

  const muted = isDark ? "text-slate-400" : "text-slate-600";

  const openSubmission = async (submissionId) => {
    if (!submissionId) return;

    setSelectedSubmission(null);
    setSubmissionError("");
    setSubmissionLoading(true);

    try {
      const result = await apiGet(`/faculty/submissions/${submissionId}`);
      setSelectedSubmission(result);
    } catch (err) {
      setSubmissionError(err.message || "Failed to load submission.");
    } finally {
      setSubmissionLoading(false);
    }
  };

  const exportCsv = () => {
    if (!data) return;

    const rows = [];

    rows.push([
      "Rank",
      "Name",
      "Roll/Email",
      "Solved",
      ...problemColumns.map((_, index) => `Q${index + 1}`),
      "Total Score",
    ]);

    filteredParticipants.forEach((p, index) => {
      rows.push([
        index + 1,
        p.name || "",
        p.rollNumber || p.email || p.identifier || "",
        `${p.solvedCount ?? 0}/${p.totalProblems ?? problemColumns.length}`,
        ...problemColumns.map((col) => {
          const problem = (p.problems || []).find(
            (item) => item.problemId === col.problemId,
          );

          if (!problem) return "—";

          const status = String(problem.problemStatus || "").toUpperCase();
          const time = formatTime(getProblemTime(problem));

          if (status === "ACCEPTED") return `Solved ${time}`;
          if (status === "ATTEMPTED") return `Attempted ${time}`;
          return "—";
        }),
        `${p.totalScore ?? 0}/${p.maxScore ?? problemColumns.length * 100}`,
      ]);
    });

    const csv = rows
      .map((row) =>
        row
          .map((cell) => {
            const safe = String(cell ?? "").replaceAll('"', '""');
            return `"${safe}"`;
          })
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `codeforge-test-${testId}-results.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className={`min-h-screen ${pageClass}`}>
      <nav
        className={`h-16 px-6 flex items-center justify-between border-b ${navClass}`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/faculty")}
            className={`h-10 w-10 rounded-xl border flex items-center justify-center transition ${softButton}`}
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

          <div
            className={`hidden md:block h-7 w-px ${
              isDark ? "bg-white/10" : "bg-slate-200"
            }`}
          />

          <div className="hidden md:block">
            <div className="font-bold">Results</div>
            <div className={`text-xs ${muted}`}>
              Name · solved · Q-wise time · total score
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadResults({ silent: true })}
            disabled={refreshing}
            className={`h-10 px-4 rounded-xl border flex items-center gap-2 text-sm font-semibold transition ${softButton} ${
              refreshing ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            <RefreshCcw size={15} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            onClick={exportCsv}
            disabled={!data}
            className={`h-10 px-4 rounded-xl border flex items-center gap-2 text-sm font-semibold transition ${softButton}`}
          >
            <Download size={15} />
            Export
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

      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className={`rounded-2xl border p-10 text-center ${cardClass}`}>
            Loading results...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-6 text-rose-500">
            {error}
          </div>
        ) : (
          <>
            <section className={`rounded-2xl border p-6 mb-6 ${cardClass}`}>
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
                <div>
                  <div
                    className="text-xs uppercase tracking-[0.22em] text-[#58A6FF] mb-3"
                    style={{ fontFamily: MONO }}
                  >
                    Test Results
                  </div>

                  <h1 className="text-3xl font-black">{data?.title}</h1>

                  <p className={`mt-2 text-sm ${muted}`}>
                    Code:{" "}
                    <span className="font-mono text-[#58A6FF]">
                      {data?.testCode}
                    </span>{" "}
                    · Participants: {data?.totalParticipants ?? 0} · Problems:{" "}
                    {problemColumns.length} · Submissions:{" "}
                    {data?.totalSubmissions ?? 0}
                  </p>
                </div>

                <button
                  onClick={() => navigate(`/faculty/tests/${testId}/manage`)}
                  className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition"
                >
                  Manage Test
                </button>
              </div>
            </section>

            <section className={`rounded-2xl border overflow-hidden ${cardClass}`}>
              <div
                className={`p-5 border-b ${
                  isDark ? "border-white/10" : "border-slate-200"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black">Leaderboard</h2>
                    <p className={`text-sm mt-1 ${muted}`}>
                      Showing {filteredParticipants.length} of{" "}
                      {data?.participants?.length || 0} participants.
                    </p>
                  </div>

                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search name, roll, email..."
                      className={`h-10 w-full sm:w-[300px] rounded-xl border pl-10 pr-3 text-sm outline-none ${inputClass}`}
                    />
                  </div>
                </div>
              </div>

              {filteredParticipants.length === 0 ? (
                <div className={`p-12 text-center ${muted}`}>
                  No participants found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead
                      className={`border-b ${
                        isDark
                          ? "border-white/10 bg-white/[0.02]"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <tr className="text-left text-slate-500">
                        <th className="px-4 py-4 font-semibold">Rank</th>
                        <th className="px-4 py-4 font-semibold min-w-[220px]">
                          Name
                        </th>
                        <th className="px-4 py-4 font-semibold">Solved</th>

                        {problemColumns.map((problem, index) => (
                          <th
                            key={problem.problemId}
                            className="px-4 py-4 font-semibold min-w-[110px]"
                            title={problem.title}
                          >
                            Q{index + 1}
                            <div className="text-[11px] font-normal truncate max-w-[100px]">
                              {problem.title}
                            </div>
                          </th>
                        ))}

                        <th className="px-4 py-4 font-semibold text-right min-w-[130px]">
                          Total Score
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredParticipants.map((participant, index) => (
                        <ParticipantRow
                          key={participant.participantId}
                          participant={participant}
                          index={index}
                          problemColumns={problemColumns}
                          isDark={isDark}
                          muted={muted}
                          onViewSubmission={openSubmission}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {(selectedSubmission || submissionLoading || submissionError) && (
        <SubmissionModal
          submission={selectedSubmission}
          loading={submissionLoading}
          error={submissionError}
          isDark={isDark}
          onClose={() => {
            setSelectedSubmission(null);
            setSubmissionError("");
            setSubmissionLoading(false);
          }}
        />
      )}
    </div>
  );
}

function ParticipantRow({
  participant,
  index,
  problemColumns,
  isDark,
  muted,
  onViewSubmission,
}) {
  const rowClass = isDark
    ? "border-white/5 hover:bg-white/[0.03]"
    : "border-slate-100 hover:bg-slate-50";

  const name =
    participant.name ||
    participant.rollNumber ||
    participant.identifier ||
    "Participant";

  const identity =
    participant.rollNumber || participant.email || participant.identifier || "—";

  return (
    <tr className={`border-b transition ${rowClass}`}>
      <td className="px-4 py-4 font-mono text-slate-500">
        {String(index + 1).padStart(2, "0")}
      </td>

      <td className="px-4 py-4">
        <div className="font-bold">{name}</div>
        <div className={`text-xs mt-1 ${muted}`}>{identity}</div>
      </td>

      <td className="px-4 py-4">
        <span className="font-bold text-emerald-400">
          {participant.solvedCount ?? 0}/{problemColumns.length}
        </span>
      </td>

      {problemColumns.map((column) => {
        const problem = (participant.problems || []).find(
          (item) => item.problemId === column.problemId,
        );

        const meta = getCellMeta(problem, isDark);

        return (
          <td key={column.problemId} className="px-4 py-4">
            {problem?.latestSubmissionId ? (
              <button
                onClick={() => onViewSubmission(problem.latestSubmissionId)}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold ${meta.cls}`}
                title="View code"
              >
                {meta.text}
                <Eye size={13} />
              </button>
            ) : (
              <span
                className={`inline-flex rounded-lg border px-3 py-1.5 text-xs font-bold ${meta.cls}`}
              >
                {meta.text}
              </span>
            )}
          </td>
        );
      })}

      <td className="px-4 py-4 text-right">
        <span className="font-black text-blue-400">
          {participant.totalScore ?? 0}/
          {participant.maxScore ?? problemColumns.length * 100}
        </span>
      </td>
    </tr>
  );
}

function SubmissionModal({ submission, loading, error, isDark, onClose }) {
  const modalClass = isDark
    ? "bg-[#111827] border-white/10 text-white"
    : "bg-white border-slate-200 text-slate-950";

  const muted = isDark ? "text-slate-400" : "text-slate-600";

  const codeClass = isDark
    ? "bg-[#0D1117] border-white/10 text-slate-200"
    : "bg-slate-50 border-slate-200 text-slate-900";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-5">
      <div
        className={`w-full max-w-5xl max-h-[88vh] rounded-2xl border overflow-hidden ${modalClass}`}
      >
        <div
          className={`h-16 px-5 border-b flex items-center justify-between ${
            isDark ? "border-white/10" : "border-slate-200"
          }`}
        >
          <div>
            <div className="font-black">Submission Details</div>
            <div className={`text-xs ${muted}`}>
              Code, output, error and score
            </div>
          </div>

          <button
            onClick={onClose}
            className={`h-10 w-10 rounded-xl border flex items-center justify-center ${
              isDark
                ? "border-white/10 hover:bg-white/10"
                : "border-slate-200 hover:bg-slate-100"
            }`}
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(88vh-64px)] p-5">
          {loading ? (
            <div className={`p-10 text-center ${muted}`}>
              Loading submission...
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 p-5 text-rose-500">
              {error}
            </div>
          ) : submission ? (
            <div className="space-y-5">
              <div className="grid md:grid-cols-4 gap-3">
                <InfoBox
                  label="Participant"
                  value={
                    submission.participantName ||
                    submission.rollNumber ||
                    submission.identifier ||
                    "—"
                  }
                  isDark={isDark}
                />
                <InfoBox
                  label="Problem"
                  value={submission.problemTitle || "—"}
                  isDark={isDark}
                />
                <InfoBox
                  label="Status"
                  value={submission.status || "—"}
                  isDark={isDark}
                />
                <InfoBox
                  label="Score"
                  value={`${submission.score ?? 0} / 100`}
                  isDark={isDark}
                />
              </div>

              <div className="grid md:grid-cols-4 gap-3">
                <InfoBox
                  label="Language"
                  value={submission.language || "—"}
                  isDark={isDark}
                />
                <InfoBox
                  label="Passed"
                  value={`${submission.passedTestCases ?? 0}/${
                    submission.totalTestCases ?? 0
                  }`}
                  isDark={isDark}
                />
                <InfoBox
                  label="Failed Case"
                  value={submission.failedTestCase || "—"}
                  isDark={isDark}
                />
                <InfoBox
                  label="Submitted At"
                  value={formatDateTime(submission.submittedAt)}
                  isDark={isDark}
                />
              </div>

              <div>
                <div className="font-bold mb-2 flex items-center gap-2">
                  <Code2 size={17} />
                  Submitted Code
                </div>

                <pre
                  className={`rounded-2xl border p-4 overflow-x-auto text-sm leading-6 ${codeClass}`}
                  style={{ fontFamily: MONO }}
                >
                  {submission.code || ""}
                </pre>
              </div>

              <div className="grid lg:grid-cols-2 gap-5">
                <div>
                  <div className="font-bold mb-2">Output</div>
                  <pre
                    className={`rounded-2xl border p-4 overflow-x-auto min-h-[120px] text-sm ${codeClass}`}
                    style={{ fontFamily: MONO }}
                  >
                    {submission.output || "—"}
                  </pre>
                </div>

                <div>
                  <div className="font-bold mb-2">Error</div>
                  <pre
                    className={`rounded-2xl border p-4 overflow-x-auto min-h-[120px] text-sm ${codeClass}`}
                    style={{ fontFamily: MONO }}
                  >
                    {submission.error || "—"}
                  </pre>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value, isDark }) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        isDark
          ? "border-white/10 bg-white/[0.03]"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="text-xs uppercase tracking-widest text-slate-500">
        {label}
      </div>
      <div className="font-bold mt-1 break-words">{value}</div>
    </div>
  );
}