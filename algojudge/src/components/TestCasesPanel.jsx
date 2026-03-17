import { useState } from "react";

const TestCasesPanel = ({ problem }) => {
  const [active, setActive] = useState(0);

  if (!problem?.examples) return null;

  const example = problem.examples[active];

  return (
    <div className="h-[200px] rounded-tl-lg flex flex-col bg-[#0F1117] border-t border-[#2A2F3A] font-mono text-sm">

      {/* HEADER */}
      <div className="h-10 flex items-center px-4 border-b border-[#2A2F3A] bg-[#0F1117]">
        <span className="text-[11px] tracking-widest uppercase text-[#8B949E]">
          Testcases
        </span>
      </div>

      {/* CASE TABS */}
      <div className="flex items-center gap-2 px-4 py-2">
        {problem.examples.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`px-3 py-1 rounded-md text-xs transition
              ${
                active === i
                  ? "bg-[#2A2F3A] text-white"
                  : "text-[#8B949E] hover:bg-[#1F2937]"
              }`}
          >
            Case {i + 1}
          </button>
        ))}

        {/* Add button (like LC) */}
        <button className="ml-2 text-[#8B949E] hover:text-white text-sm">
          +
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">

        {/* INPUT */}
        <div className="text-[#8B949E] text-xs mb-1">Input</div>
        <div className="bg-[#161B22] rounded-lg px-3 py-2 text-[#E6EDF3] mb-4">
          {example.input}
        </div>

        {/* OUTPUT */}
        <div className="text-[#8B949E] text-xs mb-1">Output</div>
        <div className="bg-[#161B22] rounded-lg px-3 py-2 text-[#E6EDF3]">
          {example.output}
        </div>
      </div>
    </div>
  );
};

export default TestCasesPanel;