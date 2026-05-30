import { useState, useEffect } from "react";

const MONO = "'JetBrains Mono', 'Fira Code', ui-monospace, monospace";
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const normalizeStatus = (status) => {
  if (!status) return "UNKNOWN";
  if (status === "OK") return "ACCEPTED";
  if (status === "Accepted") return "ACCEPTED";
  if (status === "WA") return "WRONG_ANSWER";
  if (status === "Wrong Answer") return "WRONG_ANSWER";
  if (status === "CE" || status === "Compilation Error") return "COMPILE_ERROR";
  if (status === "TLE" || status === "Time Limit Exceeded") return "TLE";
  if (status === "RE" || status === "Runtime Error") return "RUNTIME_ERROR";
  if (status === "NO_OUTPUT" || status === "No Output") return "NO_OUTPUT";
  return status;
};

const statusMeta = (status) => {
  const normalized = normalizeStatus(status);

  switch (normalized) {
    case "ACCEPTED":
      return {
        label: "Accepted",
        color: "text-emerald-600 dark:text-emerald-300",
        bg: "bg-emerald-50 dark:bg-emerald-400/10",
        border: "border-emerald-200 dark:border-emerald-400/20",
        dot: "bg-emerald-500",
      };

    case "WRONG_ANSWER":
      return {
        label: "Wrong Answer",
        color: "text-rose-600 dark:text-rose-300",
        bg: "bg-rose-50 dark:bg-rose-400/10",
        border: "border-rose-200 dark:border-rose-400/20",
        dot: "bg-rose-500",
      };

    case "COMPILE_ERROR":
      return {
        label: "Compile Error",
        color: "text-amber-700 dark:text-amber-300",
        bg: "bg-amber-50 dark:bg-amber-400/10",
        border: "border-amber-200 dark:border-amber-400/20",
        dot: "bg-amber-500",
      };

    case "TLE":
      return {
        label: "Time Limit Exceeded",
        color: "text-orange-700 dark:text-orange-300",
        bg: "bg-orange-50 dark:bg-orange-400/10",
        border: "border-orange-200 dark:border-orange-400/20",
        dot: "bg-orange-500",
      };

    case "RUNTIME_ERROR":
      return {
        label: "Runtime Error",
        color: "text-red-700 dark:text-red-300",
        bg: "bg-red-50 dark:bg-red-400/10",
        border: "border-red-200 dark:border-red-400/20",
        dot: "bg-red-500",
      };

    case "NO_OUTPUT":
      return {
        label: "No Output",
        color: "text-rose-600 dark:text-rose-300",
        bg: "bg-rose-50 dark:bg-rose-400/10",
        border: "border-rose-200 dark:border-rose-400/20",
        dot: "bg-rose-500",
      };

    default:
      return {
        label: status || "Unknown",
        color: "text-slate-700 dark:text-slate-300",
        bg: "bg-slate-50 dark:bg-white/[0.04]",
        border: "border-slate-200 dark:border-white/10",
        dot: "bg-slate-400",
      };
  }
};

const Label = ({ children, theme }) => (
  <div
    className={`text-[11px] font-semibold tracking-[0.16em] uppercase mb-2 ${
      theme === "dark" ? "text-slate-500" : "text-slate-500"
    }`}
    style={{ fontFamily: MONO }}
  >
    {children}
  </div>
);

const CodeBlock = ({ children, theme }) => (
  <pre
    className={`m-0 min-h-[42px] whitespace-pre-wrap break-words rounded-xl border px-4 py-3 text-[13px] leading-6 ${
      theme === "dark"
        ? "border-white/10 bg-[#111111] text-slate-200"
        : "border-slate-200 bg-slate-50 text-slate-900"
    }`}
    style={{ fontFamily: MONO }}
  >
    {children || <span className="text-slate-500 italic">(empty)</span>}
  </pre>
);

const ErrorBlock = ({ message, theme }) => (
  <pre
    className={`m-0 whitespace-pre-wrap break-words rounded-xl border px-4 py-3 text-[13px] leading-6 ${
      theme === "dark"
        ? "border-red-400/20 bg-red-400/10 text-red-300"
        : "border-red-200 bg-red-50 text-red-700"
    }`}
    style={{ fontFamily: MONO }}
  >
    {message || "Error"}
  </pre>
);

const TestCaseCard = ({ tc, index, theme }) => {
  const [open, setOpen] = useState(index === 0);

  const meta = statusMeta(tc.status);
  const normalized = normalizeStatus(tc.status);

  const isError = [
    "COMPILE_ERROR",
    "TLE",
    "RUNTIME_ERROR",
    "NO_OUTPUT",
  ].includes(normalized);

  const errorMessage =
    normalized === "COMPILE_ERROR"
      ? tc.error || "Compilation failed."
      : normalized === "TLE"
        ? "Execution exceeded the time limit."
        : normalized === "RUNTIME_ERROR"
          ? tc.error || "Process exited with a non-zero code."
          : normalized === "NO_OUTPUT"
            ? "Your program did not print anything."
            : tc.error || tc.status;

  const cardClass =
    theme === "dark"
      ? "border-white/10 bg-[#111111]"
      : "border-slate-200 bg-white";

  const headerClass =
    theme === "dark"
      ? "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
      : "border-slate-200 bg-slate-50 hover:bg-slate-100";

  return (
    <div className={`mb-3 overflow-hidden rounded-2xl border ${cardClass}`}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between border-b px-4 py-3 text-left transition ${headerClass}`}
      >
        <div className="flex items-center gap-3">
          <span
            className="text-xs text-slate-500"
            style={{ fontFamily: MONO }}
          >
            Case {index + 1}
          </span>

          <span
            className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.bg} ${meta.border} ${meta.color}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
          </span>
        </div>

        <span
          className={`text-slate-500 transition ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="space-y-4 px-4 py-4">
          {isError && <ErrorBlock theme={theme} message={errorMessage} />}

          {!isError && (
            <>
              <div>
                <Label theme={theme}>Your Output</Label>
                <CodeBlock theme={theme}>{tc.output}</CodeBlock>
              </div>

              <div>
                <Label theme={theme}>Expected Output</Label>
                <CodeBlock theme={theme}>{tc.expected}</CodeBlock>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default function BottomPanel({
  problem,
  output,
  running,
  input,
  setInput,
  theme = "dark",
}) {
  const [tab, setTab] = useState("input");

  useEffect(() => {
    if (problem?.sampleInput) {
      setInput(problem.sampleInput);
    }
  }, [problem, setInput]);

  useEffect(() => {
    if (output || running) {
      setTab("output");
    }
  }, [output, running]);

  const isDark = theme === "dark";

  const results = output?.results || [];
  const passedCount = results.filter((r) => {
    const s = normalizeStatus(r.status);
    return s === "ACCEPTED";
  }).length;

  const allPassed = results.length > 0 && passedCount === results.length;
  const submitMeta = output?.status ? statusMeta(output.status) : null;

  const wrapperClass = isDark
    ? "border-white/10 bg-[#171717] text-slate-200"
    : "border-slate-200 bg-white text-slate-900";

  const tabBarClass = isDark
    ? "border-white/10 bg-[#111111]"
    : "border-slate-200 bg-white";

  const emptyClass = isDark
    ? "border-white/10 bg-white/[0.03] text-slate-500"
    : "border-slate-200 bg-slate-50 text-slate-500";

  const textareaClass = isDark
    ? "border-white/10 bg-[#0D0D0D] text-slate-200 placeholder:text-slate-600 focus:border-[#58A6FF]/60"
    : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500";

  return (
    <div
      className={`flex h-full flex-col border-l ${wrapperClass}`}
      style={{ fontFamily: SANS }}
    >
      <div className={`flex h-12 shrink-0 items-end border-b px-5 ${tabBarClass}`}>
        <button
          onClick={() => setTab("input")}
          className={`mr-7 border-b-2 pb-3 text-sm font-semibold transition ${
            tab === "input"
              ? "border-[#58A6FF] text-[#58A6FF]"
              : isDark
                ? "border-transparent text-slate-500 hover:text-slate-300"
                : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Input
        </button>

        <button
          onClick={() => setTab("output")}
          className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-semibold transition ${
            tab === "output"
              ? "border-[#58A6FF] text-[#58A6FF]"
              : isDark
                ? "border-transparent text-slate-500 hover:text-slate-300"
                : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Output
          {output && (
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                allPassed || output.status === "Accepted"
                  ? "bg-emerald-400"
                  : "bg-rose-400"
              }`}
            />
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {tab === "input" && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <Label theme={theme}>Custom Input</Label>

              <button
                onClick={() => setInput(problem?.sampleInput || "")}
                className="text-xs text-slate-500 transition hover:text-[#58A6FF]"
              >
                Reset
              </button>
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter custom input here..."
              className={`h-32 w-full resize-none rounded-2xl border px-4 py-3 text-[13px] leading-6 outline-none transition ${textareaClass}`}
              style={{ fontFamily: MONO }}
            />

            <p className="mt-3 text-xs leading-5 text-slate-500">
              This input is used only for Run. Submit uses hidden test cases.
            </p>
          </div>
        )}

        {tab === "output" && (
          <div>
            {running && (
              <div className={`flex items-center gap-3 rounded-2xl border px-4 py-4 text-sm ${emptyClass}`}>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-[#58A6FF]" />
                Judging your code...
              </div>
            )}

            {!running && !output && (
              <div className={`rounded-2xl border px-4 py-5 text-sm ${emptyClass}`}>
                Run your code to see output here.
              </div>
            )}

            {!running && output?.results && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <Label theme={theme}>Sample Tests</Label>
                    <div
                      className={`text-sm font-semibold ${
                        allPassed ? "text-emerald-500" : "text-rose-500"
                      }`}
                    >
                      {passedCount} / {results.length} passed
                    </div>
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      allPassed
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300"
                        : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300"
                    }`}
                  >
                    {allPassed ? "Ready to submit" : "Fix and run again"}
                  </span>
                </div>

                {results.map((tc, i) => (
                  <TestCaseCard key={i} tc={tc} index={i} theme={theme} />
                ))}
              </div>
            )}

            {!running && output?.status && !output.results && (
              <div className="space-y-4">
                <div
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${submitMeta.bg} ${submitMeta.border} ${submitMeta.color}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${submitMeta.dot}`} />
                  {submitMeta.label}
                </div>

                {output.failedTestCase && (
                  <div className="text-sm text-slate-500">
                    Failed on hidden test case{" "}
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      #{output.failedTestCase}
                    </span>
                  </div>
                )}

                {normalizeStatus(output.status) === "ACCEPTED" && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
                    All hidden test cases passed successfully.
                  </div>
                )}

                {normalizeStatus(output.status) === "WRONG_ANSWER" && (
                  <>
                    <div>
                      <Label theme={theme}>Your Output</Label>
                      <CodeBlock theme={theme}>{output.output}</CodeBlock>
                    </div>

                    <div>
                      <Label theme={theme}>Expected Output</Label>
                      <CodeBlock theme={theme}>{output.expected}</CodeBlock>
                    </div>
                  </>
                )}

                {normalizeStatus(output.status) === "COMPILE_ERROR" && (
                  <ErrorBlock theme={theme} message={output.error || "Compilation failed."} />
                )}

                {normalizeStatus(output.status) === "TLE" && (
                  <ErrorBlock theme={theme} message="Execution exceeded the time limit." />
                )}

                {normalizeStatus(output.status) === "RUNTIME_ERROR" && (
                  <ErrorBlock theme={theme} message={output.error || "Process exited with a non-zero code."} />
                )}

                {normalizeStatus(output.status) === "NO_OUTPUT" && (
                  <ErrorBlock theme={theme} message="Your program did not print anything." />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}