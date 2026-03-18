import { useState, useEffect } from "react";

const BottomPanel = ({ problem, output, running, input, setInput }) => {
  const [tab, setTab] = useState("testcase");

  // 🔥 set default input
  useEffect(() => {
    if (problem?.sampleInput) {
      setInput(problem.sampleInput);
    }
  }, [problem]);

  return (
    <div className="h-full flex flex-col bg-[#1E1E1E] border-l border-[#2A2F3A] font-mono text-sm">
      {/* HEADER */}
      <div className="h-11 flex items-end px-5 border-b border-[#2A2F3A]">
        <button
          onClick={() => setTab("testcase")}
          className={`mr-6 pb-2 text-[14px] relative transition
            ${
              tab === "testcase"
                ? "text-[#4FA3FF]"
                : "text-[#A0A0A0] hover:text-white"
            }`}
        >
          Input
          {tab === "testcase" && (
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#4FA3FF]" />
          )}
        </button>

        <button
          onClick={() => setTab("result")}
          className={`pb-2 text-[14px] relative transition
            ${
              tab === "result"
                ? "text-[#4FA3FF]"
                : "text-[#A0A0A0] hover:text-white"
            }`}
        >
          Output
          {tab === "result" && (
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#4FA3FF]" />
          )}
        </button>
      </div>

      {/* BODY */}
      <div className="flex-1 px-5 py-4 overflow-y-auto">
        {/* INPUT TAB */}
        {tab === "testcase" && (
          <div>
            <div className="text-[#9CA3AF] text-[13px] mb-2">Custom Input</div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-40 bg-[#2C2C2C] text-[#E6EDF3] p-3 rounded-lg outline-none resize-none text-[13px] leading-5 border border-[#30363D] focus:border-[#4FA3FF]"
              placeholder="Enter input here..."
            />

            <button
              onClick={() => setInput(problem?.sampleInput || "")}
              className="mt-3 text-[12px] text-[#4FA3FF] hover:underline"
            >
              Load Sample Input
            </button>
          </div>
        )}

        {/* OUTPUT TAB */}
        {tab === "result" && (
          <div className="text-[14px]">
            {running ? (
              <span className="text-[#A0A0A0]">Running test cases...</span>
            ) : !output ? (
              <div className="text-[#9CA3AF]">Run your code to see output</div>
            ) : output.results ? (
              // 🟢 RUN MODE (sample test cases)
              <div>
                <div className="mb-3 font-semibold text-[#4FA3FF]">
                  Sample Test Cases
                </div>

                {output.results.map((tc, index) => (
                  <div
                    key={index}
                    className="mb-4 border border-[#2A2F3A] rounded-lg p-3"
                  >
                    <div className="text-[#4FA3FF] mb-1">{tc.testCase}</div>

                    <div className="text-[#9CA3AF] text-[13px]">
                      Your Output:
                    </div>
                    <pre className="whitespace-pre-wrap text-[#E6EDF3] mb-2">
                      {tc.output}
                    </pre>

                    <div className="text-[#9CA3AF] text-[13px]">Expected:</div>
                    <pre className="whitespace-pre-wrap text-[#E6EDF3]">
                      {tc.expected}
                    </pre>
                  </div>
                ))}
              </div>
            ) : (
              // 🔵 SUBMIT MODE (hidden test cases)
              <div>
                <div
                  className={`font-semibold ${
                    output.status === "Accepted"
                      ? "text-[#3FB950]"
                      : "text-[#F85149]"
                  }`}
                >
                  Status: {output.status}
                </div>

                {output.failedTestCase && (
                  <div className="mt-2 text-[#F85149] text-[13px]">
                    Failed at Test Case {output.failedTestCase}
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
