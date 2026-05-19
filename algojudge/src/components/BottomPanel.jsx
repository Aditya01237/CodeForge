import { useState, useEffect } from "react";

const ACCENT = "#4D9EFF";

const Label = ({ children }) => (
  <div
    style={{
      fontSize: 11,
      fontWeight: 500,
      letterSpacing: "0.07em",
      color: "#4d4d4d",
      textTransform: "uppercase",
      marginBottom: 6,
    }}
  >
    {children}
  </div>
);

const CodeBlock = ({ children }) => (
  <div
    style={{
      background: "#141414",
      border: "1px solid #2a2a2a",
      borderRadius: 6,
      padding: "10px 12px",
      color: "#efefef",
      fontSize: 13,
      fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
      lineHeight: 1.7,
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
      minHeight: 42,
    }}
  >
    {children || (
      <span style={{ opacity: 0.3, fontStyle: "italic" }}>(empty)</span>
    )}
  </div>
);

const ErrorBlock = ({ message }) => (
  <div
    style={{
      background: "#141414",
      border: "1px solid #2a2a2a",
      borderRadius: 6,
      padding: "10px 12px",
      color: "#ef4743",
      fontSize: 13,
      fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
      lineHeight: 1.7,
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
    }}
  >
    {message}
  </div>
);

const TestCaseCard = ({ tc, index }) => {
  const [open, setOpen] = useState(true);

  const isError = [
    "CE",
    "TLE",
    "RE",
    "MLE",
    "Compilation Error",
    "Time Limit Exceeded",
    "Runtime Error",
    "Memory Limit Exceeded",
  ].includes(tc.status);

  const errorMessages = {
    CE: tc.error || "Compilation failed.",
    "Compilation Error": tc.error || "Compilation failed.",
    TLE: "Execution exceeded the time limit.",
    "Time Limit Exceeded": "Execution exceeded the time limit.",
    RE: "Process exited with a non-zero code.",
    "Runtime Error": "Process exited with a non-zero code.",
    MLE: "Memory limit exceeded.",
    "Memory Limit Exceeded": "Memory limit exceeded.",
  };

  const passed = tc.status === "OK" || tc.status === "Accepted";

  return (
    <div
      style={{
        borderRadius: 6,
        border: "1px solid #2a2a2a",
        marginBottom: 8,
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          background: "#242424",
          border: "none",
          borderBottom: open ? "1px solid #2a2a2a" : "none",
          cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              color: "#4d4d4d",
              fontSize: 12,
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            }}
          >
            Case {index + 1}
          </span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: passed ? "#00b8a3" : "#ef4743",
            }}
          >
            {passed
              ? "Passed"
              : tc.status === "RE"
                ? "Runtime Error"
                : tc.status === "CE"
                  ? "Compile Error"
                  : tc.status === "TLE"
                    ? "Time Limit Exceeded"
                    : tc.status === "MLE"
                      ? "Memory Limit Exceeded"
                      : tc.status}
          </span>
        </div>
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 0.18s",
            flexShrink: 0,
          }}
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="#4d4d4d"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          style={{
            padding: "12px 14px",
            background: "#1a1a1a",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {isError && (
            <ErrorBlock message={errorMessages[tc.status] || tc.status} />
          )}
          {!isError && (
            <>
              <div>
                <Label>Your Output</Label>
                <CodeBlock>{tc.output}</CodeBlock>
              </div>
              <div>
                <Label>Expected</Label>
                <CodeBlock>{tc.expected}</CodeBlock>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const BottomPanel = ({ problem, output, running, input, setInput }) => {
  const [tab, setTab] = useState("testcase");

  useEffect(() => {
    if (problem?.sampleInput) setInput(problem.sampleInput);
  }, [problem]);

  useEffect(() => {
    if (output) setTab("result");
  }, [output]);

  const tabStyle = (active) => ({
    padding: "0 2px 11px",
    marginRight: 24,
    fontSize: 13,
    fontWeight: active ? 500 : 400,
    color: active ? "#efefef" : "#4d4d4d",
    background: "none",
    border: "none",
    borderBottom: active ? `2px solid ${ACCENT}` : "2px solid transparent",
    cursor: "pointer",
    transition: "color 0.15s, border-color 0.15s",
    fontFamily: "inherit",
    letterSpacing: "0.01em",
  });

  const isAllPassed = output?.results?.every(
    (r) => r.status === "OK" || r.status === "Accepted",
  );

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#1e1e1e",
        borderLeft: "1px solid #2a2a2a",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        fontSize: 13,
        color: "#efefef",
      }}
    >
      {/* TAB BAR */}
      <div
        style={{
          height: 44,
          display: "flex",
          alignItems: "flex-end",
          padding: "0 16px",
          borderBottom: "1px solid #2a2a2a",
          flexShrink: 0,
        }}
      >
        <button
          style={tabStyle(tab === "testcase")}
          onClick={() => setTab("testcase")}
        >
          Input
        </button>
        <button
          style={tabStyle(tab === "result")}
          onClick={() => setTab("result")}
        >
          Output
          {output && (
            <span
              style={{
                marginLeft: 6,
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: isAllPassed ? "#00b8a3" : "#ef4743",
                verticalAlign: "middle",
                position: "relative",
                top: -1,
              }}
            />
          )}
        </button>
      </div>

      {/* BODY */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
        {/* INPUT TAB */}
        {tab === "testcase" && (
          <div>
            <Label>Custom Input</Label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                width: "100%",
                height: 120,
                background: "#141414",
                color: "#efefef",
                border: "1px solid #2a2a2a",
                borderRadius: 6,
                padding: "10px 12px",
                outline: "none",
                resize: "none",
                fontSize: 13,
                lineHeight: 1.65,
                boxSizing: "border-box",
                fontFamily:
                  "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = `${ACCENT}44`)}
              onBlur={(e) => (e.target.style.borderColor = "#2a2a2a")}
            />
            <button
              onClick={() => setInput(problem?.sampleInput || "")}
              style={{
                marginTop: 8,
                background: "none",
                border: "none",
                color: "#4d4d4d",
                fontSize: 12,
                cursor: "pointer",
                padding: 0,
                fontFamily: "inherit",
                opacity: 0.75,
                transition: "opacity 0.15s",
              }}
              onMouseEnter={(e) => (e.target.style.opacity = 1)}
              onMouseLeave={(e) => (e.target.style.opacity = 0.75)}
            >
              ↺ Reset to sample input
            </button>
          </div>
        )}

        {/* OUTPUT TAB */}
        {tab === "result" && (
          <div>
            {running && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: "#4d4d4d",
                  fontSize: 13,
                }}
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    border: `2px solid ${ACCENT}`,
                    borderTopColor: "transparent",
                    display: "inline-block",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                Judging…
              </div>
            )}

            {!running && !output && (
              <div style={{ color: "#3a3a3a", fontSize: 13 }}>
                Run your code to see output
              </div>
            )}

            {/* RUN MODE — per test case */}
            {!running && output?.results && (
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 14,
                  }}
                >
                  <span
                    style={{
                      color: "#4d4d4d",
                      fontSize: 11,
                      fontWeight: 500,
                      letterSpacing: "0.07em",
                      textTransform: "uppercase",
                    }}
                  >
                    Sample Tests
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: isAllPassed ? "#00b8a3" : "#ef4743",
                    }}
                  >
                    {
                      output.results.filter(
                        (r) => r.status === "OK" || r.status === "Accepted",
                      ).length
                    }{" "}
                    / {output.results.length} passed
                  </span>
                </div>
                {output.results.map((tc, i) => (
                  <TestCaseCard key={i} tc={tc} index={i} />
                ))}
              </div>
            )}

            {/* SUBMIT MODE */}
            {!running && output?.status && !output.results && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: output.status === "Accepted" ? "#00b8a3" : "#ef4743",
                  }}
                >
                  {output.status}
                  {output.failedTestCase && (
                    <span
                      style={{
                        fontSize: 11,
                        color: "#4d4d4d",
                        fontWeight: 400,
                        marginLeft: 10,
                      }}
                    >
                      failed on test case {output.failedTestCase}
                    </span>
                  )}
                </div>

                {output.status === "Wrong Answer" && (
                  <>
                    <div>
                      <Label>Your Output</Label>
                      <CodeBlock>{output.output}</CodeBlock>
                    </div>
                    <div>
                      <Label>Expected</Label>
                      <CodeBlock>{output.expected}</CodeBlock>
                    </div>
                  </>
                )}
                {(output.status === "Compilation Error" ||
                  output.status === "CE") && (
                  <ErrorBlock message={output.error || "Compilation failed."} />
                )}
                {(output.status === "Time Limit Exceeded" ||
                  output.status === "TLE") && (
                  <ErrorBlock message="Execution exceeded the time limit." />
                )}
                {(output.status === "Runtime Error" ||
                  output.status === "RE") && (
                  <ErrorBlock message="Process exited with a non-zero code." />
                )}
                {output.status === "Accepted" && (
                  <div style={{ color: "#00b8a3", fontSize: 13 }}>
                    All test cases passed.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BottomPanel;
