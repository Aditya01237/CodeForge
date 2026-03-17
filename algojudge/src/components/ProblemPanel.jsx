import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function ProblemPanel({ problem }) {
  const [open, setOpen] = useState({});

  const toggle = (key) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  if (!problem) return null;

  return (
    <div className="h-full rounded-tr-lg border-t border-r border-[#2A2F3A] bg-[#1E1E1E] text-[#E6EDF3] flex flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* TITLE */}
        <h1 className="text-[22px] font-semibold mb-5 tracking-tight">
          {problem.id}. {problem.title}
        </h1>

        {/* DESCRIPTION */}
        <div className="space-y-3">
          {problem.description?.map((para, i) => (
            <p key={i} className="text-[14px] text-[#C9D1D9] leading-6">
              {para}
            </p>
          ))}
        </div>

        {/* INPUT FORMAT */}
        {problem.inputFormat && (
          <>
            <h2 className="text-[18px] font-semibold mt-7 mb-3">
              Input Format
            </h2>

            <ul className="space-y-2 mb-5">
              {problem.inputFormat.map((line, i) => (
                <li key={i} className="flex gap-2 text-[14px] text-[#C9D1D9]">
                  <span className="text-[#6E7681]">•</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* OUTPUT FORMAT */}
        {problem.outputFormat && (
          <>
            <h2 className="text-[18px] font-semibold mb-3">Output Format</h2>

            <ul className="space-y-2 mb-5">
              {problem.outputFormat.map((line, i) => (
                <li key={i} className="flex gap-2 text-[14px] text-[#C9D1D9]">
                  <span className="text-[#6E7681]">•</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* NOTE */}
        {problem.note && (
          <div className="mt-5 text-[14px] text-[#8B949E] flex gap-2">
            <span>💡</span>
            <span>{problem.note}</span>
          </div>
        )}

        {/* EXAMPLE (CODEFORCES STYLE) */}
        {problem.sampleInput && (
          <>
            <h2 className="text-[18px] font-semibold mt-7 mb-3">Example</h2>

            <div className="bg-[#1E1E1E] border border-[#30363D] rounded-lg p-4 mb-6">
              <CodeBlock label="Input" value={problem.sampleInput} />
              <CodeBlock label="Output" value={problem.sampleOutput} />

              {/* 🔥 EXPLANATION */}
              {problem.exampleExplanation && (
                <div className="mt-4 space-y-2">
                  <div className="text-[#8B949E] text-[12px] uppercase tracking-wide">
                    Explanation
                  </div>

                  {problem.exampleExplanation.map((line, i) => (
                    <p key={i} className="text-[13px] text-[#C9D1D9] leading-5">
                      {line}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* CONSTRAINTS */}
        {problem.constraints && (
          <>
            <h2 className="text-[18px] font-semibold mb-3">Constraints</h2>

            <ul className="space-y-2 mb-6">
              {problem.constraints.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-[14px]">
                  <span className="text-[#6E7681] mt-[2px]">•</span>
                  <span className="bg-[#2A2A2A] px-2 py-[2px] rounded text-[13px] text-[#C9D1D9]">
                    {c}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* STATS */}
        <div className="text-[13px] text-[#8B949E] flex gap-6 mb-6 border-t border-[#2A2F3A] pt-4">
          <span>
            Accepted {problem.acceptedCount || "—"} /{" "}
            {problem.totalSubmissions || "—"}
          </span>
          <span>Acceptance Rate {problem.acceptance || "—"}%</span>
        </div>

        {/* COLLAPSIBLE SECTIONS */}
        <Collapse
          title="Topics"
          icon="🏷"
          open={open.topics}
          onClick={() => toggle("topics")}
        >
          {problem.topics?.map((t, i) => (
            <Chip key={i} text={t} />
          ))}
        </Collapse>

        <Collapse
          title="Companies"
          icon="🔒"
          open={open.companies}
          onClick={() => toggle("companies")}
        >
          {problem.companies?.map((c, i) => (
            <Chip key={i} text={c} highlight />
          ))}
        </Collapse>

        {problem.hints?.map((hint, i) => (
          <Collapse
            key={i}
            title={`Hint ${i + 1}`}
            icon="💡"
            open={open[`hint${i}`]}
            onClick={() => toggle(`hint${i}`)}
          >
            <p className="text-[14px] text-[#C9D1D9]">{hint}</p>
          </Collapse>
        ))}

        <Collapse
          title="Similar Questions"
          icon="📋"
          open={open.similar}
          onClick={() => toggle("similar")}
        >
          {problem.similarQuestions?.map((q, i) => (
            <div
              key={i}
              className="text-[#4FA3FF] text-[14px] hover:underline cursor-pointer"
            >
              {q}
            </div>
          ))}
        </Collapse>
      </div>
    </div>
  );
}

/* ---------- COMPONENTS ---------- */

const Collapse = ({ title, children, onClick, icon, open }) => (
  <div className="border-t border-[#2A2F3A]">
    <div
      onClick={onClick}
      className="flex items-center justify-between py-4 cursor-pointer group"
    >
      <div className="flex items-center gap-3">
        <span className="text-[16px] text-[#8B949E] group-hover:text-white">
          {icon}
        </span>
        <span className="text-[15px] text-[#C9D1D9] group-hover:text-white">
          {title}
        </span>
      </div>

      <ChevronDown
        size={16}
        className={`text-[#6E7681] transition-transform duration-200 ${
          open ? "rotate-180 text-white" : ""
        }`}
      />
    </div>

    {open && <div className="pb-4 pl-7">{children}</div>}
  </div>
);

const CodeBlock = ({ label, value }) => (
  <div className="mb-4">
    <div className="text-[#8B949E] text-[12px] mb-1 uppercase tracking-wide">
      {label}
    </div>
    <pre className="bg-[#1E1E1E] border border-[#1E1E1E] rounded-lg px-3 py-2 text-[13px] font-mono whitespace-pre-wrap">
      {value}
    </pre>
  </div>
);

const Chip = ({ text, highlight }) => (
  <span
    className={`inline-block px-2 py-1 rounded-md text-[12px] mr-2 mt-2 ${
      highlight ? "bg-[#3A2F1C] text-[#FFC01E]" : "bg-[#2A2A2A] text-[#C9D1D9]"
    }`}
  >
    {text}
  </span>
);
