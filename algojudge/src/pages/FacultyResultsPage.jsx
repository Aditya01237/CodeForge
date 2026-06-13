import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Circle,
  ClipboardList,
  Code2,
  Download,
  Eye,
  GraduationCap,
  Mail,
  Moon,
  RefreshCcw,
  Search,
  ShieldAlert,
  Sun,
  Timer,
  UserRound,
  Users,
  X,
  AlertTriangle,
} from "lucide-react";
import { apiGet } from "../api";

const MONO = "'JetBrains Mono', 'Fira Code', ui-monospace, monospace";

const formatDateTime = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleString();
};

const normalize = (value) => String(value || "").toLowerCase();

const statusBadgeClass = (status, isDark) => {
  const value = String(status || "").toUpperCase();

  if (value === "COMPLETED" || value === "SUBMITTED") {
    return isDark
      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (value === "IN_PROGRESS") {
    return isDark
      ? "border-blue-400/30 bg-blue-400/10 text-blue-300"
      : "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (value === "DISQUALIFIED") {
    return isDark
      ? "border-rose-400/30 bg-rose-400/10 text-rose-300"
      : "border-rose-200 bg-rose-50 text-rose-700";
  }

  return isDark
    ? "border-slate-400/20 bg-slate-400/10 text-slate-300"
    : "border-slate-200 bg-slate-50 text-slate-700";
};

const problemStatusMeta = (status, isDark) => {
  if (status === "ACCEPTED") {
    return {
      label: "Solved",
      icon: <CheckCircle2 size={14} />,
      cls: isDark
        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
        : "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (status === "ATTEMPTED") {
    return {
      label: "Attempted",
      icon: <AlertTriangle size={14} />,
      cls: isDark
        ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
        : "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  return {
    label: "Not Started",
    icon: <Circle size={14} />,
    cls: isDark
      ? "border-white/10 bg-white/[0.04] text-slate-400"
      : "border-slate-200 bg-slate-50 text-slate-500",
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
  const [statusFilter, setStatusFilter] = useState("ALL");

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

  const filteredParticipants = useMemo(() => {
    const participants = data?.participants || [];

    return participants.filter((p) => {
      const text = [
        p.name,
        p.rollNumber,
        p.email,
        p.identifier,
        p.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesQuery = text.includes(query.trim().toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" ||
        String(p.status || "").toUpperCase() === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [data, query, statusFilter]);

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

    const problemTitles =
      data.participants?.[0]?.problems?.map((p) => p.problemTitle) || [];

    rows.push([
      "Participant ID",
      "Name",
      "Roll Number",
      "Email",
      "Identifier",
      "Type",
      "Status",
      "Solved",
      "Attempted",
      "Total Problems",
      "Score",
      "Max Score",
      "Latest Submission Status",
      "Latest Submission Problem",
      ...problemTitles,
    ]);

    (data.participants || []).forEach((p) => {
      rows.push([
        p.participantId,
        p.name || "",
        p.rollNumber || "",
        p.email || "",
        p.identifier || "",
        p.participantType || "",
        p.status || "",
        p.solvedCount ?? 0,
        p.attemptedCount ?? 0,
        p.totalProblems ?? 0,
        p.totalScore ?? 0,
        p.maxScore ?? 0,
        p.latestSubmissionStatus || "",
        p.latestSubmissionProblemTitle || "",
        ...(p.problems || []).map(
          (problem) =>
            `${problem.problemStatus || "NOT_STARTED"} (${problem.bestScore ?? 0})`,
        ),
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
            title="Back"
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
            <div className="font-bold">Faculty Results</div>
            <div className={`text-xs ${muted}`}>
              Participant-wise contest performance
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
            Export CSV
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

      <main className="max-w-7xl mx-auto px-6 py-10">
        {loading ? (
          <div className={`rounded-3xl border p-12 text-center ${cardClass}`}>
            Loading result dashboard...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-400/20 bg-rose-400/10 p-8 text-rose-500">
            {error}
          </div>
        ) : (
          <>
            <section className={`rounded-3xl border p-8 mb-7 ${cardClass}`}>
              <div
                className="text-xs uppercase tracking-[0.25em] text-[#58A6FF] mb-4"
                style={{ fontFamily: MONO }}
              >
                Test Result Dashboard
              </div>

              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
                <div>
                  <h1 className="text-4xl font-black">{data?.title}</h1>

                  <p className={`mt-3 ${muted}`}>
                    Test Code:{" "}
                    <span className="font-mono text-[#58A6FF]">
                      {data?.testCode}
                    </span>{" "}
                    · Start: {formatDateTime(data?.startTime)} · End:{" "}
                    {formatDateTime(data?.endTime)}
                  </p>
                </div>

                <button
                  onClick={() => navigate(`/faculty/tests/${testId}/manage`)}
                  className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
                >
                  Manage Test
                </button>
              </div>
            </section>

            <section className="grid md:grid-cols-2 xl:grid-cols-6 gap-4 mb-7">
              <SummaryCard
                icon={<Users size={20} />}
                label="Participants"
                value={data?.totalParticipants ?? 0}
                isDark={isDark}
              />
              <SummaryCard
                icon={<Code2 size={20} />}
                label="Problems"
                value={data?.totalProblems ?? 0}
                isDark={isDark}
              />
              <SummaryCard
                icon={<ClipboardList size={20} />}
                label="Submissions"
                value={data?.totalSubmissions ?? 0}
                isDark={isDark}
              />
              <SummaryCard
                icon={<Timer size={20} />}
                label="In Progress"
                value={data?.inProgressCount ?? 0}
                isDark={isDark}
              />
              <SummaryCard
                icon={<CheckCircle2 size={20} />}
                label="Completed"
                value={data?.completedCount ?? 0}
                isDark={isDark}
              />
              <SummaryCard
                icon={<ShieldAlert size={20} />}
                label="Disqualified"
                value={data?.disqualifiedCount ?? 0}
                isDark={isDark}
              />
            </section>

            <section className={`rounded-3xl border overflow-hidden ${cardClass}`}>
              <div
                className={`p-5 border-b ${
                  isDark ? "border-white/10" : "border-slate-200"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black">Participants</h2>
                    <p className={`text-sm mt-1 ${muted}`}>
                      Showing {filteredParticipants.length} of{" "}
                      {data?.participants?.length || 0} participants.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                      />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search name, roll, email..."
                        className={`h-10 w-full sm:w-[280px] rounded-xl border pl-10 pr-3 text-sm outline-none ${inputClass}`}
                      />
                    </div>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className={`h-10 rounded-xl border px-3 text-sm outline-none ${inputClass}`}
                    >
                      <option value="ALL">All Status</option>
                      <option value="REGISTERED">Registered</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="DISQUALIFIED">Disqualified</option>
                    </select>
                  </div>
                </div>
              </div>

              {filteredParticipants.length === 0 ? (
                <div className={`p-12 text-center ${muted}`}>
                  No participants found.
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {filteredParticipants.map((participant, index) => (
                    <ParticipantResultCard
                      key={participant.participantId}
                      participant={participant}
                      index={index}
                      isDark={isDark}
                      muted={muted}
                      softButton={softButton}
                      onViewSubmission={openSubmission}
                    />
                  ))}
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

function SummaryCard({ icon, label, value, isDark }) {
  const cardClass = isDark
    ? "bg-[#111827] border-white/10"
    : "bg-white border-slate-200 shadow-sm";

  return (
    <div className={`rounded-3xl border p-5 ${cardClass}`}>
      <div className="text-[#58A6FF] mb-3">{icon}</div>
      <div className="text-3xl font-black">{value}</div>
      <div className="text-sm mt-1 text-slate-500">{label}</div>
    </div>
  );
}

function ParticipantResultCard({
  participant,
  index,
  isDark,
  muted,
  softButton,
  onViewSubmission,
}) {
  const cardHover = isDark ? "hover:bg-white/[0.03]" : "hover:bg-slate-50";

  return (
    <div className={`p-6 transition ${cardHover}`}>
      <div className="grid xl:grid-cols-[60px_1.1fr_220px_220px] gap-5 items-start">
        <div
          className="font-mono text-slate-500 pt-1"
          style={{ fontFamily: MONO }}
        >
          {String(index + 1).padStart(2, "0")}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-bold text-lg">
              {participant.name ||
                participant.rollNumber ||
                participant.identifier ||
                "Participant"}
            </h3>

            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusBadgeClass(
                participant.status,
                isDark,
              )}`}
            >
              {participant.status || "REGISTERED"}
            </span>
          </div>

          <div className={`mt-2 flex flex-wrap gap-4 text-sm ${muted}`}>
            {participant.rollNumber && (
              <span className="inline-flex items-center gap-1">
                <GraduationCap size={14} />
                {participant.rollNumber}
              </span>
            )}

            {participant.email && (
              <span className="inline-flex items-center gap-1">
                <Mail size={14} />
                {participant.email}
              </span>
            )}

            {participant.identifier && (
              <span className="inline-flex items-center gap-1">
                <UserRound size={14} />
                {participant.identifier}
              </span>
            )}
          </div>

          <div className={`mt-2 text-sm ${muted}`}>
            Started: {formatDateTime(participant.startedAt)} · Submitted:{" "}
            {formatDateTime(participant.submittedAt)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SmallMetric
            label="Solved"
            value={`${participant.solvedCount ?? 0}/${participant.totalProblems ?? 0}`}
            tone="green"
            isDark={isDark}
          />
          <SmallMetric
            label="Attempted"
            value={participant.attemptedCount ?? 0}
            tone="yellow"
            isDark={isDark}
          />
          <SmallMetric
            label="Score"
            value={`${participant.totalScore ?? 0}/${participant.maxScore ?? 0}`}
            tone="blue"
            isDark={isDark}
          />
          <SmallMetric
            label="Latest"
            value={participant.latestSubmissionStatus || "—"}
            tone="slate"
            isDark={isDark}
          />
        </div>

        <div>
          {participant.latestSubmissionId ? (
            <button
              onClick={() => onViewSubmission(participant.latestSubmissionId)}
              className={`h-10 px-4 rounded-xl border text-sm font-semibold transition flex items-center gap-2 ${softButton}`}
            >
              <Eye size={15} />
              View Latest Code
            </button>
          ) : (
            <div className={`text-sm ${muted}`}>No submissions yet</div>
          )}

          {participant.latestSubmissionProblemTitle && (
            <div className={`text-xs mt-2 ${muted}`}>
              Latest problem: {participant.latestSubmissionProblemTitle}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 grid md:grid-cols-2 xl:grid-cols-3 gap-3">
        {(participant.problems || []).map((problem) => {
          const meta = problemStatusMeta(problem.problemStatus, isDark);

          return (
            <div
              key={problem.problemId}
              className={`rounded-2xl border p-4 ${
                isDark
                  ? "border-white/10 bg-white/[0.03]"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold truncate">
                    {problem.problemTitle}
                  </div>
                  <div className={`text-xs mt-1 ${muted}`}>
                    Score: {problem.bestScore ?? 0} · Attempts:{" "}
                    {problem.attempts ?? 0}
                  </div>
                </div>

                <span
                  className={`shrink-0 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-bold ${meta.cls}`}
                >
                  {meta.icon}
                  {meta.label}
                </span>
              </div>

              {problem.latestSubmissionId && (
                <button
                  onClick={() => onViewSubmission(problem.latestSubmissionId)}
                  className={`mt-3 h-9 px-3 rounded-xl border text-xs font-semibold transition flex items-center gap-2 ${softButton}`}
                >
                  <Eye size={14} />
                  View Code
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SmallMetric({ label, value, tone, isDark }) {
  const toneClass = {
    green: isDark
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
      : "border-emerald-200 bg-emerald-50 text-emerald-700",
    yellow: isDark
      ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
      : "border-amber-200 bg-amber-50 text-amber-700",
    blue: isDark
      ? "border-blue-400/20 bg-blue-400/10 text-blue-300"
      : "border-blue-200 bg-blue-50 text-blue-700",
    slate: isDark
      ? "border-white/10 bg-white/[0.04] text-slate-300"
      : "border-slate-200 bg-slate-50 text-slate-700",
  }[tone];

  return (
    <div className={`rounded-2xl border p-3 ${toneClass}`}>
      <div className="text-xs opacity-80">{label}</div>
      <div className="font-black mt-1 truncate">{value}</div>
    </div>
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
        className={`w-full max-w-5xl max-h-[88vh] rounded-3xl border overflow-hidden ${modalClass}`}
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
              isDark ? "border-white/10 hover:bg-white/10" : "border-slate-200 hover:bg-slate-100"
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
                <InfoBox label="Participant" value={submission.participantName || submission.rollNumber || submission.identifier || "—"} isDark={isDark} />
                <InfoBox label="Problem" value={submission.problemTitle || "—"} isDark={isDark} />
                <InfoBox label="Status" value={submission.status || "—"} isDark={isDark} />
                <InfoBox label="Score" value={`${submission.score ?? 0} / 100`} isDark={isDark} />
              </div>

              <div className="grid md:grid-cols-4 gap-3">
                <InfoBox label="Language" value={submission.language || "—"} isDark={isDark} />
                <InfoBox label="Passed" value={`${submission.passedTestCases ?? 0}/${submission.totalTestCases ?? 0}`} isDark={isDark} />
                <InfoBox label="Failed Case" value={submission.failedTestCase || "—"} isDark={isDark} />
                <InfoBox label="Submitted At" value={formatDateTime(submission.submittedAt)} isDark={isDark} />
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