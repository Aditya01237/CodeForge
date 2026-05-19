const MONO = "'JetBrains Mono', 'Fira Code', ui-monospace, monospace";
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const Section = ({ title, children }) => (
  <div>
    <div className="text-lg font-semibold tracking-[0.1em] uppercase text-white mb-3 pb-2 border-b border-[#242424]">
      {title}
    </div>
    {children}
  </div>
);

const BulletRow = ({ children }) => (
  <div className="flex gap-2.5 text-[15px] text-white leading-[1.7] mb-1.5">
    <span className="text-[#444] shrink-0 pt-px">›</span>
    <span>{children}</span>
  </div>
);

const ColLabel = ({ children }) => (
  <div className="text-md font-bold tracking-[0.1em] uppercase text-white mb-2.5">
    {children}
  </div>
);

const Pre = ({ children }) => (
  <pre
    className="m-0 text-[13px] leading-[1.75] text-white whitespace-pre-wrap break-words"
    style={{ fontFamily: MONO }}
  >
    {children}
  </pre>
);

const ProblemPanel = ({ problem }) => {
  if (!problem) return null;

  return (
    <div
      className="h-full bg-[#1E1E1E] text-white flex flex-col text-sm"
      style={{ fontFamily: SANS }}
    >
      {/* HEADER */}
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-[#2a2a2a] shrink-0">
        <span
          className="text-[15px] font-semibold text-white bg-[#252525] border border-[#333] px-2 py-0.5 rounded-[5px] tracking-wide"
          style={{ fontFamily: MONO }}
        >
          #{problem.id}
        </span>
        <h1 className="text-[18px] font-semibold text-white m-0 tracking-tight">
          {problem.title}
        </h1>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-6">

        {/* DESCRIPTION */}
        <div>
          {problem.description?.map((para, i) => (
            <p key={i} className="text-[17px] leading-[1.8] text-white mb-2.5 last:mb-0 m-0">
              {para}
            </p>
          ))}
        </div>

        {/* INPUT FORMAT */}
        {problem.inputFormat && (
          <Section title="Input Format">
            {problem.inputFormat.map((line, i) => (
              <BulletRow key={i}>{line}</BulletRow>
            ))}
          </Section>
        )}

        {/* OUTPUT FORMAT */}
        {problem.outputFormat && (
          <Section title="Output Format">
            {problem.outputFormat.map((line, i) => (
              <BulletRow key={i}>{line}</BulletRow>
            ))}
          </Section>
        )}

        {/* EXAMPLE */}
        {problem.sampleInput && (
          <Section title="Example">
            <div className="rounded-lg overflow-hidden border border-[#2a2a2a]">
              <div className="grid grid-cols-2 bg-[#171618]">
                <div className="p-4 border-r border-[#2a2a2a]">
                  <ColLabel>Input</ColLabel>
                  <Pre>{problem.sampleInput}</Pre>
                </div>
                <div className="p-4">
                  <ColLabel>Output</ColLabel>
                  <Pre>{problem.sampleOutput}</Pre>
                </div>
              </div>

              {problem.exampleExplanation && (
                <div className="border-t border-[#2a2a2a] p-4 bg-[#181818]">
                  <ColLabel>Explanation</ColLabel>
                  {problem.exampleExplanation.map((line, i) => (
                    <p key={i} className="text-[14px] text-white leading-[1.7] mt-1.5 first:mt-0 m-0">
                      {line}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </Section>
        )}

        {/* CONSTRAINTS */}
        {problem.constraints && (
          <Section title="Constraints">
            <div className="flex flex-col gap-1.5">
              {problem.constraints.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-[#333] shrink-0" />
                  <code
                    className="text-[15px] text-[#c9d1d9] bg-[#222] border border-[#2e2e2e] px-2.5 py-0.5 rounded"
                    style={{ fontFamily: MONO }}
                  >
                    {c}
                  </code>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* NOTE */}
        {problem.note && (
          <div className="px-3.5 py-3 rounded-md bg-[#1e1e1e] border border-[#2a2a2a] border-l-[3px] border-l-[#333] text-[15px] text-[#6a7380] leading-[1.7]">
            {problem.note}
          </div>
        )}

      </div>
    </div>
  );
};

export default ProblemPanel;