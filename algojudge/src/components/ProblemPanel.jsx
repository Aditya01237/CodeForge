import { assetUrl } from "../api";

const MONO = "'JetBrains Mono', 'Fira Code', ui-monospace, monospace";
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const toLines = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;

  return String(value)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
};

const toParagraphs = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;

  return String(value)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
};

const parseContentBlocks = (contentJson) => {
  if (!contentJson) return [];

  try {
    const parsed = JSON.parse(contentJson);
    return Array.isArray(parsed?.blocks) ? parsed.blocks : [];
  } catch {
    return [];
  }
};

const Section = ({ title, children, theme }) => (
  <section className="mb-8">
    <div
      className={`text-[13px] font-bold tracking-[0.22em] uppercase mb-4 pb-3 border-b ${
        theme === "dark"
          ? "text-slate-200 border-white/10"
          : "text-slate-800 border-slate-200"
      }`}
      style={{ fontFamily: MONO }}
    >
      {title}
    </div>
    {children}
  </section>
);

const CodeBox = ({ children, theme }) => (
  <pre
    className={`m-0 rounded-xl border px-4 py-3 text-[13px] leading-6 whitespace-pre-wrap break-words ${
      theme === "dark"
        ? "bg-[#111111] border-white/10 text-slate-200"
        : "bg-slate-50 border-slate-200 text-slate-900"
    }`}
    style={{ fontFamily: MONO }}
  >
    {children || ""}
  </pre>
);

const ExampleCard = ({ example, index, theme }) => (
  <div
    className={`rounded-2xl border overflow-hidden mb-4 ${
      theme === "dark"
        ? "bg-[#111111] border-white/10"
        : "bg-white border-slate-200"
    }`}
  >
    <div
      className={`px-4 py-3 border-b font-semibold ${
        theme === "dark"
          ? "border-white/10 text-white bg-white/[0.03]"
          : "border-slate-200 text-slate-950 bg-slate-50"
      }`}
    >
      Example {index + 1}
    </div>

    <div className="p-4 space-y-4">
      <div>
        <div
          className="text-[11px] uppercase tracking-[0.16em] mb-2 text-slate-500"
          style={{ fontFamily: MONO }}
        >
          Input
        </div>
        <CodeBox theme={theme}>{example.input}</CodeBox>
      </div>

      <div>
        <div
          className="text-[11px] uppercase tracking-[0.16em] mb-2 text-slate-500"
          style={{ fontFamily: MONO }}
        >
          Output
        </div>
        <CodeBox theme={theme}>{example.output}</CodeBox>
      </div>

      {example.explanation && (
        <div>
          <div
            className="text-[11px] uppercase tracking-[0.16em] mb-2 text-slate-500"
            style={{ fontFamily: MONO }}
          >
            Explanation
          </div>

          <p
            className={`m-0 text-[15px] leading-7 ${
              theme === "dark" ? "text-slate-300" : "text-slate-700"
            }`}
          >
            {example.explanation}
          </p>
        </div>
      )}
    </div>
  </div>
);

const RichBlocks = ({ blocks, theme }) => {
  const text = theme === "dark" ? "text-white" : "text-slate-950";
  const muted = theme === "dark" ? "text-slate-400" : "text-slate-600";
  if (!blocks.length) return null;

  return (
    <section className="mb-8 space-y-5">
      {blocks.map((block, index) => {
        if (block.type === "paragraph") {
          return (
            <p
              key={block.id || index}
              className={`m-0 text-[16px] leading-8 ${text}`}
            >
              {block.text}
            </p>
          );
        }

        if (block.type === "math") {
          return (
            <div
              key={block.id || index}
              className={`rounded-2xl border px-4 py-3 ${
                theme === "dark"
                  ? "border-blue-400/20 bg-blue-400/10 text-blue-200"
                  : "border-blue-200 bg-blue-50 text-blue-800"
              }`}
            >
              <div
                className="text-[11px] uppercase tracking-[0.16em] mb-2 opacity-70"
                style={{ fontFamily: MONO }}
              >
                Math
              </div>

              <div
                className="text-[15px] leading-7 whitespace-pre-wrap"
                style={{ fontFamily: MONO }}
              >
                {block.text}
              </div>
            </div>
          );
        }

        if (block.type === "code") {
          return (
            <div key={block.id || index}>
              {block.language && (
                <div
                  className="text-[11px] uppercase tracking-[0.16em] mb-2 text-slate-500"
                  style={{ fontFamily: MONO }}
                >
                  {block.language}
                </div>
              )}

              <CodeBox theme={theme}>{block.text}</CodeBox>
            </div>
          );
        }

        if (block.type === "image") {
          return (
            <figure key={block.id || index} className="m-0">
              {block.url && (
                <img
                  src={assetUrl(block.url)}
                  alt={block.caption || "Problem image"}
                  className={`mx-auto max-w-[420px] max-h-[360px] w-auto rounded-xl border object-contain ${
                    theme === "dark" ? "border-white/10" : "border-slate-200"
                  }`}
                />
              )}

              {block.caption && (
                <figcaption className={`mt-2 text-sm ${muted}`}>
                  {block.caption}
                </figcaption>
              )}
            </figure>
          );
        }

        if (block.type === "example") {
          return (
            <div
              key={block.id || index}
              className={`rounded-2xl border overflow-hidden ${
                theme === "dark"
                  ? "bg-[#111111] border-white/10"
                  : "bg-white border-slate-200"
              }`}
            >
              <div
                className={`px-4 py-3 border-b font-semibold ${
                  theme === "dark"
                    ? "border-white/10 text-white bg-white/[0.03]"
                    : "border-slate-200 text-slate-950 bg-slate-50"
                }`}
              >
                {block.title || `Example ${index + 1}`}
              </div>

              <div className="p-4 space-y-4">
                {block.imageUrl && (
                  <figure className="m-0">
                    <img
                      src={assetUrl(block.imageUrl)}
                      alt={block.imageCaption || block.title || "Example image"}
                      className={`mx-auto max-w-[420px] max-h-[360px] w-auto border object-contain ${
                        theme === "dark"
                          ? "border-white/10"
                          : "border-slate-200"
                      }`}
                    />

                    {block.imageCaption && (
                      <figcaption className={`mt-2 text-sm ${muted}`}>
                        {block.imageCaption}
                      </figcaption>
                    )}
                  </figure>
                )}

                {block.input && (
                  <div>
                    <div
                      className="text-[11px] uppercase tracking-[0.16em] mb-2 text-slate-500"
                      style={{ fontFamily: MONO }}
                    >
                      Input
                    </div>

                    <CodeBox theme={theme}>{block.input}</CodeBox>
                  </div>
                )}

                {block.output && (
                  <div>
                    <div
                      className="text-[11px] uppercase tracking-[0.16em] mb-2 text-slate-500"
                      style={{ fontFamily: MONO }}
                    >
                      Output
                    </div>

                    <CodeBox theme={theme}>{block.output}</CodeBox>
                  </div>
                )}

                {block.explanation && (
                  <div>
                    <div
                      className="text-[11px] uppercase tracking-[0.16em] mb-2 text-slate-500"
                      style={{ fontFamily: MONO }}
                    >
                      Explanation
                    </div>

                    <p
                      className={`m-0 text-[15px] leading-7 ${
                        theme === "dark" ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      {block.explanation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        }

        if (block.type === "note") {
          return (
            <div
              key={block.id || index}
              className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${
                theme === "dark"
                  ? "border-amber-400/20 bg-amber-400/10 text-amber-100"
                  : "border-amber-200 bg-amber-50 text-amber-800"
              }`}
            >
              {block.text}
            </div>
          );
        }

        return null;
      })}
    </section>
  );
};

export default function ProblemPanel({
  problem,
  sampleTests = [],
  theme = "dark",
}) {
  if (!problem) return null;

  const richBlocks = parseContentBlocks(problem.contentJson);

  const description = toParagraphs(problem.description);
  const inputFormat = toLines(problem.inputFormat);
  const outputFormat = toLines(problem.outputFormat);
  const constraints = toLines(problem.constraintsText || problem.constraints);

  const hasRichExampleBlocks = richBlocks.some(
    (block) => block.type === "example",
  );

  const examples = hasRichExampleBlocks
    ? []
    : Array.isArray(problem.examples) && problem.examples.length > 0
      ? problem.examples
      : sampleTests.slice(0, 3).map((tc) => ({
          input: tc.inputData,
          output: tc.expectedOutput,
          explanation: "",
        }));

  const panelBg = theme === "dark" ? "bg-[#171717]" : "bg-white";
  const headerBg = theme === "dark" ? "bg-[#1B1B1B]" : "bg-slate-50";
  const border = theme === "dark" ? "border-white/10" : "border-slate-200";
  const text = theme === "dark" ? "text-white" : "text-slate-950";
  return (
    <div
      className={`h-full flex flex-col border-r ${panelBg} ${border}`}
      style={{ fontFamily: SANS }}
    >
      <div className={`shrink-0 border-b ${border} ${headerBg} px-6 py-5`}>
        <div className="flex items-start gap-4">
          <span
            className={`mt-1 inline-flex h-9 min-w-9 items-center justify-center rounded-xl border px-2 text-sm font-semibold ${
              theme === "dark"
                ? "border-white/10 bg-white/[0.04] text-slate-200"
                : "border-slate-200 bg-white text-slate-700"
            }`}
            style={{ fontFamily: MONO }}
          >
            #{problem.id}
          </span>

          <div>
            <h1
              className={`m-0 text-[22px] font-bold tracking-tight leading-8 ${text}`}
            >
              {problem.title}
            </h1>

            {problem.difficulty && (
              <div
                className="mt-1 text-[11px] uppercase tracking-[0.24em] text-[#58A6FF]"
                style={{ fontFamily: MONO }}
              >
                {problem.difficulty}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {richBlocks.length > 0 ? (
          <RichBlocks blocks={richBlocks} theme={theme} />
        ) : (
          description.length > 0 && (
            <section className="mb-8">
              {description.map((para, i) => (
                <p
                  key={i}
                  className={`m-0 mb-3 last:mb-0 text-[16px] leading-8 ${text}`}
                >
                  {para}
                </p>
              ))}
            </section>
          )
        )}

        {examples.length > 0 && (
          <Section title="Examples" theme={theme}>
            {examples.map((ex, i) => (
              <ExampleCard key={i} example={ex} index={i} theme={theme} />
            ))}
          </Section>
        )}

        {inputFormat.length > 0 && (
          <Section title="Input Format" theme={theme}>
            {inputFormat.map((line, i) => (
              <div
                key={i}
                className={`flex gap-3 text-[15px] leading-7 mb-2 ${text}`}
              >
                <span
                  className={
                    theme === "dark" ? "text-slate-600" : "text-slate-400"
                  }
                >
                  ›
                </span>
                <span>{line}</span>
              </div>
            ))}
          </Section>
        )}

        {outputFormat.length > 0 && (
          <Section title="Output Format" theme={theme}>
            {outputFormat.map((line, i) => (
              <div
                key={i}
                className={`flex gap-3 text-[15px] leading-7 mb-2 ${text}`}
              >
                <span
                  className={
                    theme === "dark" ? "text-slate-600" : "text-slate-400"
                  }
                >
                  ›
                </span>
                <span>{line}</span>
              </div>
            ))}
          </Section>
        )}

        {constraints.length > 0 && (
          <Section title="Constraints" theme={theme}>
            <div className="space-y-2">
              {constraints.map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span
                    className={`h-1 w-1 rounded-full ${
                      theme === "dark" ? "bg-slate-600" : "bg-slate-400"
                    }`}
                  />

                  <code
                    className={`rounded-lg border px-3 py-1.5 text-[14px] ${
                      theme === "dark"
                        ? "border-white/10 bg-white/[0.04] text-slate-200"
                        : "border-slate-200 bg-slate-50 text-slate-800"
                    }`}
                    style={{ fontFamily: MONO }}
                  >
                    {c}
                  </code>
                </div>
              ))}
            </div>
          </Section>
        )}

        {problem.note && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${
              theme === "dark"
                ? "border-blue-400/20 bg-blue-400/10 text-blue-200"
                : "border-blue-200 bg-blue-50 text-blue-800"
            }`}
          >
            {problem.note}
          </div>
        )}
      </div>
    </div>
  );
}
