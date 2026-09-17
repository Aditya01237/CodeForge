import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clipboard,
  Clock3,
  LogOut,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Play,
  Radio,
  Square,
  Sun,
  Users,
} from "lucide-react";
import { apiGet, apiPost } from "../api";
import EditorPanel from "../components/EditorPanel";
import ProblemPanel from "../components/ProblemPanel";
import { STARTERS } from "../data/codeTemplates";
import {
  clearInterviewAccess,
  readInterviewAccess,
} from "../interviewAccess";

const MONO = "'JetBrains Mono', 'Fira Code', ui-monospace, monospace";
const interviewOptions = (accessToken) => ({
  headers: {
    "X-Interview-Token": accessToken,
  },
});

const toEditorLanguage = (language) => {
  if (language === "python") return "Python";
  if (language === "java") return "Java";
  return "C++";
};

const toBackendLanguage = (language) => {
  if (language === "Python") return "python";
  if (language === "Java") return "java";
  return "cpp";
};

const formatElapsed = (milliseconds) => {
  if (milliseconds === null) return "00:00";
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return hours > 0
    ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

const normalizeRunStatus = (status) => {
  if (status === "OK" || status === "Accepted") return "ACCEPTED";
  if (status === "WA" || status === "Wrong Answer") return "WRONG_ANSWER";
  if (status === "CE" || status === "Compilation Error") return "COMPILE_ERROR";
  if (status === "TLE" || status === "Time Limit Exceeded") return "TLE";
  if (status === "RE" || status === "Runtime Error") return "RUNTIME_ERROR";
  if (status === "NO_OUTPUT" || status === "No Output") return "NO_OUTPUT";
  return status || "UNKNOWN";
};

const runStatusLabel = {
  ACCEPTED: "Passed",
  WRONG_ANSWER: "Wrong answer",
  COMPILE_ERROR: "Compile error",
  TLE: "Time limit exceeded",
  RUNTIME_ERROR: "Runtime error",
  NO_OUTPUT: "No output",
  UNKNOWN: "Unknown",
};

const InterviewRunResults = ({ output, running, theme }) => {
  const isDark = theme === "dark";
  const results = Array.isArray(output?.results) ? output.results : [];
  const passedCount = results.filter(
    (result) => normalizeRunStatus(result.status) === "ACCEPTED",
  ).length;

  if (running) {
    return (
      <div className="flex items-center gap-3 text-sm text-slate-400">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-blue-400" />
        Running sample cases...
      </div>
    );
  }

  if (!output) {
    return (
      <div className="text-sm text-slate-500">
        Run the code to compare its output with the sample cases.
      </div>
    );
  }

  if (!results.length) {
    return (
      <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-300">
        {output.message || output.error || "The judge did not return a result."}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-xs text-slate-400">
        <span
          className={`h-2 w-2 rounded-full ${
            passedCount === results.length ? "bg-emerald-400" : "bg-rose-400"
          }`}
        />
        {passedCount} of {results.length} sample cases passed
      </div>

      <div className="space-y-3">
        {results.map((result, index) => {
          const status = normalizeRunStatus(result.status);
          const passed = status === "ACCEPTED";
          const message =
            status === "NO_OUTPUT"
              ? "Your program ran but did not print anything."
              : status === "COMPILE_ERROR"
                ? result.error || "Compilation failed."
                : status === "TLE"
                  ? "The program exceeded the time limit."
                  : status === "RUNTIME_ERROR"
                    ? result.error || "The program stopped with a runtime error."
                    : null;

          return (
            <div
              key={result.testCase || index}
              className={`rounded-xl border p-3 ${
                passed
                  ? "border-emerald-400/20 bg-emerald-400/[0.06]"
                  : "border-rose-400/20 bg-rose-400/[0.06]"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold">
                  {result.testCase || `Test Case ${index + 1}`}
                </span>
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                    passed
                      ? "bg-emerald-400/10 text-emerald-300"
                      : "bg-rose-400/10 text-rose-300"
                  }`}
                >
                  {runStatusLabel[status] || status}
                </span>
              </div>

              {message && (
                <p className="mt-2 text-xs leading-5 text-rose-300">
                  {message}
                </p>
              )}

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">
                    Your output
                  </div>
                  <pre
                    className={`m-0 min-h-10 overflow-auto rounded-lg border p-2 text-xs whitespace-pre-wrap ${
                      isDark
                        ? "border-white/10 bg-black/20 text-slate-200"
                        : "border-slate-200 bg-white text-slate-800"
                    }`}
                    style={{ fontFamily: MONO }}
                  >
                    {String(result.output || "").trim() || "(no output)"}
                  </pre>
                </div>
                <div>
                  <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">
                    Expected
                  </div>
                  <pre
                    className={`m-0 min-h-10 overflow-auto rounded-lg border p-2 text-xs whitespace-pre-wrap ${
                      isDark
                        ? "border-white/10 bg-black/20 text-slate-200"
                        : "border-slate-200 bg-white text-slate-800"
                    }`}
                    style={{ fontFamily: MONO }}
                  >
                    {String(result.expected || "").trim() || "(empty)"}
                  </pre>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function InterviewRoomPage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [accessToken] = useState(() => readInterviewAccess(roomCode));

  const [theme, setTheme] = useState(
    () => localStorage.getItem("cf_theme") || "dark",
  );
  const [session, setSession] = useState(null);
  const [problems, setProblems] = useState([]);
  const [sampleTests, setSampleTests] = useState([]);
  const [code, setCode] = useState("");
  const [lang, setLang] = useState("C++");
  const [output, setOutput] = useState(null);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(Boolean(accessToken));
  const [error, setError] = useState("");
  const [elapsedMs, setElapsedMs] = useState(null);
  const [starting, setStarting] = useState(false);
  const [switchingProblemId, setSwitchingProblemId] = useState(null);
  const [questionsOpen, setQuestionsOpen] = useState(true);
  const [problemWidth, setProblemWidth] = useState(() => {
    const saved = Number(localStorage.getItem("cf_interview_problem_width"));
    return saved >= 300 && saved <= 760 ? saved : 430;
  });
  const [consoleHeight, setConsoleHeight] = useState(() => {
    const saved = Number(localStorage.getItem("cf_interview_console_height"));
    return saved >= 120 && saved <= 520 ? saved : 210;
  });
  const [resizingAxis, setResizingAxis] = useState(null);

  const initializedRef = useRef(false);
  const dirtyRef = useRef(false);
  const codeRef = useRef("");
  const langRef = useRef("C++");

  const isDark = theme === "dark";
  const isInterviewer = session?.viewerRole === "INTERVIEWER";
  const isCompleted = session?.status === "COMPLETED";

  useEffect(() => {
    localStorage.setItem("cf_theme", theme);
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark, theme]);

  const applyRemoteSession = useCallback((data, force = false) => {
    setSession(data);

    if (force || !initializedRef.current) {
      const remoteCode = data.code || "";
      const remoteLang = toEditorLanguage(data.language);
      codeRef.current = remoteCode;
      langRef.current = remoteLang;
      setCode(remoteCode);
      setLang(remoteLang);
      initializedRef.current = true;
      dirtyRef.current = false;
      return;
    }

    if (!dirtyRef.current && data.code !== codeRef.current) {
      const remoteCode = data.code || "";
      codeRef.current = remoteCode;
      setCode(remoteCode);
    }

    const remoteLang = toEditorLanguage(data.language);
    if (!dirtyRef.current && remoteLang !== langRef.current) {
      langRef.current = remoteLang;
      setLang(remoteLang);
    }
  }, []);

  const loadSession = useCallback(async ({ initial = false } = {}) => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      const data = await apiGet(
        `/interviews/rooms/${roomCode}`,
        interviewOptions(accessToken),
      );
      applyRemoteSession(data, initial);
      setError("");

    } catch (err) {
      setError(err.message || "Unable to load interview room.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, applyRemoteSession, roomCode]);

  useEffect(() => {
    loadSession({ initial: true });
    const interval = window.setInterval(() => loadSession(), 2500);
    return () => window.clearInterval(interval);
  }, [loadSession]);

  useEffect(() => {
    if (!accessToken) return;

    apiGet("/problems")
      .then((data) => {
        const safeProblems = Array.isArray(data) ? data : [];
        setProblems(safeProblems);
      })
      .catch(() => setError("Unable to load the interview problem bank."));
  }, [accessToken]);

  useEffect(() => {
    localStorage.setItem(
      "cf_interview_problem_width",
      String(Math.round(problemWidth)),
    );
  }, [problemWidth]);

  useEffect(() => {
    localStorage.setItem(
      "cf_interview_console_height",
      String(Math.round(consoleHeight)),
    );
  }, [consoleHeight]);

  useEffect(() => {
    if (!session?.problem?.id) {
      setSampleTests([]);
      return;
    }

    apiGet(`/problems/${session.problem.id}/testcases/sample`)
      .then((tests) => setSampleTests(Array.isArray(tests) ? tests : []))
      .catch(() => setSampleTests([]));
  }, [session?.problem?.id]);

  useEffect(() => {
    if (!dirtyRef.current || !initializedRef.current || isCompleted) return;

    const snapshotCode = code;
    const snapshotLanguage = lang;
    const timeout = window.setTimeout(async () => {
      try {
        const data = await apiPost(`/interviews/rooms/${roomCode}/code`, {
          code: snapshotCode,
          language: toBackendLanguage(snapshotLanguage),
        }, interviewOptions(accessToken));

        if (
          codeRef.current === snapshotCode &&
          langRef.current === snapshotLanguage
        ) {
          dirtyRef.current = false;
        }
        setSession(data);
      } catch (err) {
        setError(err.message || "Live code sync failed.");
      }
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [accessToken, code, isCompleted, lang, roomCode]);

  useEffect(() => {
    if (!session?.startedAt) {
      setElapsedMs(0);
      return undefined;
    }

    const startedAt = new Date(session.startedAt).getTime();
    const endedAt = session.endedAt
      ? new Date(session.endedAt).getTime()
      : null;

    const tick = () => {
      const currentTime = isCompleted && endedAt ? endedAt : Date.now();
      setElapsedMs(Math.max(currentTime - startedAt, 0));
    };
    tick();

    if (isCompleted) return undefined;

    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [isCompleted, session?.endedAt, session?.startedAt]);

  const updateCode = (value) => {
    codeRef.current = value;
    dirtyRef.current = true;
    setCode(value);
  };

  const updateLanguage = (nextLanguage) => {
    langRef.current = nextLanguage;
    dirtyRef.current = true;
    setLang(nextLanguage);
    const starter = STARTERS[nextLanguage] || "";
    codeRef.current = starter;
    setCode(starter);
  };

  const startProblemResize = (event) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = problemWidth;
    setResizingAxis("horizontal");
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const handleMove = (moveEvent) => {
      const maxWidth = Math.min(760, window.innerWidth * 0.58);
      setProblemWidth(
        Math.max(300, Math.min(maxWidth, startWidth + moveEvent.clientX - startX)),
      );
    };

    const handleUp = () => {
      setResizingAxis(null);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  };

  const startConsoleResize = (event) => {
    event.preventDefault();
    const startY = event.clientY;
    const startHeight = consoleHeight;
    setResizingAxis("vertical");
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";

    const handleMove = (moveEvent) => {
      const maxHeight = Math.min(520, window.innerHeight - 260);
      setConsoleHeight(
        Math.max(120, Math.min(maxHeight, startHeight + startY - moveEvent.clientY)),
      );
    };

    const handleUp = () => {
      setResizingAxis(null);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  };

  const startInterview = async () => {
    setStarting(true);
    try {
      const data = await apiPost(
        `/interviews/rooms/${roomCode}/start`,
        {},
        interviewOptions(accessToken),
      );
      applyRemoteSession(data);
    } catch (err) {
      setError(err.message || "Unable to start the interview.");
    } finally {
      setStarting(false);
    }
  };

  const selectInterviewProblem = async (problem) => {
    if (
      !isInterviewer ||
      isCompleted ||
      problem.id === session?.problem?.id ||
      switchingProblemId
    ) {
      return;
    }

    setSwitchingProblemId(problem.id);
    setError("");

    try {
      const data = await apiPost(
        `/interviews/rooms/${roomCode}/configure`,
        {
          problemId: problem.id,
          durationMinutes: session.durationMinutes || 45,
        },
        interviewOptions(accessToken),
      );
      applyRemoteSession(data);
      setOutput(null);
    } catch (err) {
      setError(err.message || "Unable to change the interview question.");
    } finally {
      setSwitchingProblemId(null);
    }
  };

  const completeInterview = async () => {
    if (
      !window.confirm(
        "End this interview? The shared editor will become read-only.",
      )
    ) {
      return;
    }

    try {
      const data = await apiPost(
        `/interviews/rooms/${roomCode}/complete`,
        {},
        interviewOptions(accessToken),
      );
      if (data.status === "COMPLETED") {
        clearInterviewAccess(roomCode);
        navigate("/", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Unable to complete the interview.");
    }
  };

  const runCode = async () => {
    if (!session?.problem?.id) return;
    setRunning(true);
    setOutput(null);

    try {
      const data = await apiPost("/run", {
        code,
        language: toBackendLanguage(lang),
        problemId: session.problem.id,
      });
      setOutput(data);
    } catch (err) {
      setOutput({
        status: "Error",
        message: err.message || "Code execution failed.",
      });
    } finally {
      setRunning(false);
    }
  };

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
    } catch {
      // Clipboard access is optional.
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark
            ? "bg-[#070B12] text-white"
            : "bg-[#F8FAFC] text-slate-950"
        }`}
      >
        Opening interview room...
      </div>
    );
  }

  if (!accessToken) {
    return (
      <div
        className={`min-h-screen p-6 flex items-center justify-center ${
          isDark
            ? "bg-[#070B12] text-white"
            : "bg-[#F8FAFC] text-slate-950"
        }`}
      >
        <section
          className={`w-full max-w-lg rounded-3xl border p-8 text-center ${
            isDark
              ? "border-white/10 bg-[#111827]"
              : "border-slate-200 bg-white shadow-sm"
          }`}
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-500">
            <Users size={22} />
          </div>
          <h1 className="mt-5 text-2xl font-black">Join required</h1>
          <p className={`mt-3 leading-7 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            A copied room URL cannot open an interview. Create the room as the
            interviewer or enter its code and your name as the candidate.
          </p>
          <button
            type="button"
            onClick={() => navigate("/interview", { replace: true })}
            className="mt-6 h-11 w-full rounded-xl bg-violet-600 font-bold text-white hover:bg-violet-700"
          >
            Go to Interview Studio
          </button>
        </section>
      </div>
    );
  }

  if (!session) {
    return (
      <div className={`min-h-screen p-10 ${isDark ? "bg-[#070B12] text-white" : "bg-[#F8FAFC] text-slate-950"}`}>
        <div className="text-rose-400">{error || "Interview not found."}</div>
        <button
          onClick={() => navigate("/interview")}
          className="mt-5 rounded-xl bg-violet-600 px-5 py-3"
        >
          Back to Interview Studio
        </button>
      </div>
    );
  }

  const pageClass = isDark
    ? "bg-[#070B12] text-white"
    : "bg-[#F8FAFC] text-slate-950";
  const navClass = isDark
    ? "bg-[#0D1117] border-white/10"
    : "bg-white border-slate-200";
  const panelClass = isDark
    ? "bg-[#111827] border-white/10"
    : "bg-white border-slate-200";
  const softButton = isDark
    ? "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100";
  const muted = isDark ? "text-slate-400" : "text-slate-600";

  return (
    <div className={`h-screen overflow-hidden flex flex-col ${pageClass}`}>
      <nav
        className={`h-16 px-5 flex items-center justify-between border-b shrink-0 ${navClass}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate("/interview")}
            className={`h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 ${softButton}`}
          >
            <ArrowLeft size={17} />
          </button>
          <div className="min-w-0">
            <div className="font-black truncate">{session.title}</div>
            <div className={`text-xs truncate ${muted}`}>
              {session.candidateName
                ? `${session.interviewerName} interviewing ${session.candidateName}`
                : `${session.interviewerName} · Candidate can join anytime`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`h-10 px-3 rounded-xl border flex items-center gap-2 text-sm ${softButton}`}
            aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
            <span className="hidden lg:inline">
              {isDark ? "Light" : "Dark"}
            </span>
          </button>

          <button
            onClick={copyRoomCode}
            className={`hidden md:flex h-10 px-4 rounded-xl border items-center gap-2 text-sm ${softButton}`}
          >
            <Clipboard size={14} />
            <span style={{ fontFamily: MONO }}>{roomCode}</span>
          </button>

          {session.status === "WAITING" ? (
            <div className="h-10 px-4 rounded-xl border border-violet-400/30 bg-violet-500/10 text-violet-400 flex items-center gap-2 text-sm font-bold">
              <Users size={15} />
              Lobby
            </div>
          ) : (
            <div
              className="h-10 px-4 rounded-xl border border-violet-400/30 bg-violet-500/10 text-violet-400 flex items-center gap-2 font-bold"
              style={{ fontFamily: MONO }}
              title="Elapsed interview time"
            >
              <Clock3 size={15} />
              {formatElapsed(elapsedMs)}
            </div>
          )}

          {isInterviewer && session.status === "ACTIVE" && (
            <button
              onClick={completeInterview}
              className="h-10 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold flex items-center gap-2"
            >
              <Square size={13} />
              End
            </button>
          )}

          {!isInterviewer && (
            <button
              type="button"
              onClick={() => {
                clearInterviewAccess(roomCode);
                navigate("/", { replace: true });
              }}
              className={`h-10 px-4 rounded-xl border text-sm font-bold flex items-center gap-2 ${softButton}`}
            >
              <LogOut size={14} />
              Exit
            </button>
          )}
        </div>
      </nav>

      <div
        className={`h-10 px-5 border-b flex items-center justify-between text-xs shrink-0 ${navClass}`}
      >
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-2 text-emerald-400">
            <Radio size={13} className="animate-pulse" />
            Live sync
          </span>
          <span className={muted}>
            Viewing as{" "}
            <strong className={isDark ? "text-white" : "text-slate-950"}>
              {isInterviewer ? "Interviewer" : "Candidate"}
            </strong>
          </span>
          <span className={`hidden md:inline ${muted}`}>
            Status: {session.status}
          </span>
        </div>
        <span className={muted}>
          Shared automatically every few seconds
        </span>
      </div>

      {error && (
        <div className="shrink-0 border-b border-rose-400/20 bg-rose-500/10 px-5 py-2 text-sm text-rose-400">
          {error}
        </div>
      )}

      {session.status === "WAITING" ? (
        <main className="flex-1 overflow-auto px-5 py-8 flex items-center">
          <section className={`mx-auto w-full max-w-2xl rounded-3xl border p-7 ${panelClass}`}>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
                <Users size={22} />
              </div>
              <p
                className="mt-5 text-xs uppercase tracking-[0.22em] text-violet-400"
                style={{ fontFamily: MONO }}
              >
                Interview lobby
              </p>
              <h1 className="mt-3 text-3xl font-black">
                {session.candidateName
                  ? "Both participants are ready."
                  : "Your workspace is ready."}
              </h1>
              <p className={`mt-3 leading-7 ${muted}`}>
                Share room code{" "}
                <strong
                  className={isDark ? "text-white" : "text-slate-950"}
                  style={{ fontFamily: MONO }}
                >
                  {roomCode}
                </strong>
                . Joined participants appear below automatically. Enter the
                workspace whenever you are ready.
              </p>
            </div>

              <div className={`mt-7 rounded-2xl border divide-y ${
                isDark ? "border-white/10 divide-white/10" : "border-slate-200 divide-slate-200"
              }`}>
                <div className="text-xs uppercase tracking-widest text-slate-500">
                  <div className="px-4 py-3">Participants</div>
                </div>
                <div className="flex items-center justify-between gap-3 px-4 py-4">
                  <span className="font-semibold">
                    {session.interviewerName}
                  </span>
                  <span className="text-xs text-emerald-400">Interviewer</span>
                </div>
                <div className="flex items-center justify-between gap-3 px-4 py-4">
                  <span className="font-semibold">
                    {session.candidateName || "Not joined yet"}
                  </span>
                  <span
                    className={`text-xs ${
                      session.candidateName
                        ? "text-emerald-400"
                        : "text-amber-400"
                    }`}
                  >
                    {session.candidateName ? "Candidate ready" : "Waiting"}
                  </span>
                </div>
              </div>

              {isInterviewer ? (
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={startInterview}
                    disabled={starting}
                    className="h-12 w-full rounded-xl bg-emerald-600 font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Play size={16} />
                    {starting
                      ? "Opening workspace..."
                      : "Enter workspace"}
                  </button>
                </div>
              ) : (
                <div className={`mt-6 flex items-center justify-center gap-2 text-sm ${muted}`}>
                  <Radio size={14} className="animate-pulse text-emerald-400" />
                  The workspace will open when the interviewer starts.
                </div>
              )}
          </section>
        </main>
      ) : (
      <main
        className={`flex-1 min-h-0 grid ${
          resizingAxis ? "" : "transition-[grid-template-columns] duration-200"
        }`}
        style={{
          gridTemplateColumns: questionsOpen
            ? `250px ${problemWidth}px 7px minmax(0, 1fr)`
            : `52px ${problemWidth}px 7px minmax(0, 1fr)`,
        }}
      >
        <aside
          className={`min-w-0 min-h-0 border-r flex flex-col ${
            isDark
              ? "border-white/10 bg-[#0D1117]"
              : "border-slate-200 bg-slate-50"
          }`}
        >
          <div
            className={`shrink-0 border-b ${
              questionsOpen ? "p-4" : "p-2"
            } ${isDark ? "border-white/10" : "border-slate-200"}`}
          >
            <div
              className={`flex items-center ${
                questionsOpen ? "justify-between gap-2" : "justify-center"
              }`}
            >
              {questionsOpen && (
                <div className="flex items-center gap-2 font-bold">
                  <BookOpen size={16} className="text-violet-400" />
                  Questions
                </div>
              )}
              <button
                type="button"
                onClick={() => setQuestionsOpen((open) => !open)}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${softButton}`}
                aria-label={
                  questionsOpen
                    ? "Hide questions sidebar"
                    : "Show questions sidebar"
                }
                title={
                  questionsOpen
                    ? "Hide questions sidebar"
                    : "Show questions sidebar"
                }
              >
                {questionsOpen ? (
                  <PanelLeftClose size={15} />
                ) : (
                  <PanelLeftOpen size={15} />
                )}
              </button>
            </div>
            {questionsOpen && (
              <p className={`mt-1 text-xs leading-5 ${muted}`}>
                {isInterviewer
                  ? "Select another question at any time."
                  : "The interviewer controls the active question."}
              </p>
            )}
          </div>

          {questionsOpen ? (
          <div className="flex-1 overflow-y-auto p-2">
            {problems.map((problem, index) => {
              const selected = problem.id === session.problem?.id;
              const switching = switchingProblemId === problem.id;

              return (
                <button
                  key={problem.id}
                  type="button"
                  onClick={() => selectInterviewProblem(problem)}
                  disabled={!isInterviewer || isCompleted || Boolean(switchingProblemId)}
                  className={`mb-1 w-full rounded-xl px-3 py-3 text-left transition ${
                    selected
                      ? isDark
                        ? "bg-violet-500/15 text-white"
                        : "bg-violet-100 text-violet-950"
                      : isDark
                        ? "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
                        : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-950"
                  } ${!isInterviewer ? "cursor-default" : ""}`}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`mt-0.5 text-[10px] ${
                        selected ? "text-violet-400" : "text-slate-600"
                      }`}
                      style={{ fontFamily: MONO }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {problem.title}
                      </span>
                      <span className="mt-1 block truncate text-[10px] text-slate-500">
                        {problem.difficulty || "Unrated"} ·{" "}
                        {problem.category || "General"}
                      </span>
                    </span>
                    {selected && (
                      <ChevronRight
                        size={14}
                        className="mt-0.5 shrink-0 text-violet-400"
                      />
                    )}
                  </div>
                  {switching && (
                    <span className="mt-2 block text-[10px] text-violet-400">
                      Switching for everyone...
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          ) : (
            <div className="flex flex-1 flex-col items-center gap-3 pt-3">
              <BookOpen size={17} className="text-violet-400" />
              <span
                className="text-[10px] text-slate-500"
                style={{
                  fontFamily: MONO,
                  writingMode: "vertical-rl",
                }}
              >
                QUESTIONS
              </span>
            </div>
          )}
        </aside>

        <div className="min-w-0 min-h-0">
          <ProblemPanel
            problem={session.problem}
            sampleTests={sampleTests}
            theme={theme}
          />
        </div>

        <div
          role="separator"
          aria-label="Resize problem and editor"
          aria-orientation="vertical"
          onPointerDown={startProblemResize}
          className={`group relative z-20 cursor-col-resize touch-none ${
            isDark ? "bg-[#0D1117]" : "bg-slate-100"
          }`}
          title="Drag to resize problem and editor"
        >
          <div
            className={`absolute inset-y-0 left-1/2 w-px -translate-x-1/2 transition group-hover:w-[3px] ${
              resizingAxis === "horizontal"
                ? "w-[3px] bg-violet-400"
                : isDark
                  ? "bg-white/10 group-hover:bg-violet-400"
                  : "bg-slate-300 group-hover:bg-violet-500"
            }`}
          />
        </div>

        <div className="min-w-0 min-h-0 flex flex-col">
          <div className="flex-1 min-h-[260px] relative">
            {isCompleted && (
              <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                <div className="rounded-2xl border border-emerald-400/30 bg-[#0D1117] px-6 py-4 text-emerald-400 font-bold flex items-center gap-2">
                  <CheckCircle2 size={18} />
                  Interview completed · editor is read-only
                </div>
              </div>
            )}
            <EditorPanel
              code={code}
              setCode={updateCode}
              lang={lang}
              onLangChange={updateLanguage}
              theme={theme}
              readOnly={isCompleted}
            />
          </div>

          <div
            role="separator"
            aria-label="Resize editor and execution console"
            aria-orientation="horizontal"
            onPointerDown={startConsoleResize}
            className={`group relative z-20 h-[7px] shrink-0 cursor-row-resize touch-none ${
              isDark ? "bg-[#0D1117]" : "bg-slate-100"
            }`}
            title="Drag to resize editor and execution console"
          >
            <div
              className={`absolute inset-x-0 top-1/2 h-px -translate-y-1/2 transition group-hover:h-[3px] ${
                resizingAxis === "vertical"
                  ? "h-[3px] bg-violet-400"
                  : isDark
                    ? "bg-white/10 group-hover:bg-violet-400"
                    : "bg-slate-300 group-hover:bg-violet-500"
              }`}
            />
          </div>

          <div
            className={`shrink-0 overflow-hidden ${panelClass}`}
            style={{ height: `${consoleHeight}px` }}
          >
            <div className="flex h-full min-w-0 flex-col p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-bold">Execution console</div>
                <button
                  onClick={runCode}
                  disabled={running || isCompleted}
                  className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold flex items-center gap-2"
                >
                  <Play size={14} />
                  {running ? "Running..." : "Run samples"}
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                <InterviewRunResults
                  output={output}
                  running={running}
                  theme={theme}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      )}
    </div>
  );
}
