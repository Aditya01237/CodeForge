import { useState } from "react";
import { Check, Clipboard } from "lucide-react";
import { assetUrl } from "../api";

const MONO = "'JetBrains Mono', 'Fira Code', ui-monospace, monospace";
const SANS = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const DIFFICULTY_STYLES = {
  Easy: {
    dark: "bg-emerald-400/10 text-emerald-300",
    light: "bg-emerald-50 text-emerald-700",
  },
  Medium: {
    dark: "bg-amber-400/10 text-amber-300",
    light: "bg-amber-50 text-amber-700",
  },
  Hard: {
    dark: "bg-rose-400/10 text-rose-300",
    light: "bg-rose-50 text-rose-700",
  },
};

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
    <h2
      className={`mb-3 text-[16px] font-semibold tracking-[-0.01em] ${
        theme === "dark"
          ? "text-[#F2F3F5]"
          : "text-slate-900"
      }`}
    >
      {title}
    </h2>
    {children}
  </section>
);

const CodeBox = ({ children, label, theme }) => {
  const [copied, setCopied] = useState(false);

  const copyValue = async () => {
    try {
      await navigator.clipboard.writeText(String(children || ""));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // Clipboard access is optional.
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-lg border ${
        theme === "dark"
          ? "bg-[#202020] border-white/[0.06]"
          : "bg-slate-50 border-slate-200/80"
      }`}
    >
      {label && (
        <div className="absolute right-2 top-2 z-10 flex items-center gap-2">
          <span
            className="sr-only"
            style={{ fontFamily: MONO }}
          >
            {label}
          </span>
          <button
            type="button"
            onClick={copyValue}
            aria-label={`Copy ${label.toLowerCase()}`}
            className={`flex h-7 w-7 items-center justify-center rounded-md transition ${
              copied
                ? "text-emerald-400"
                : theme === "dark"
                  ? "text-slate-500 hover:bg-white/5 hover:text-slate-300"
                  : "text-slate-400 hover:bg-slate-200/70 hover:text-slate-700"
            }`}
          >
            {copied ? <Check size={13} /> : <Clipboard size={13} />}
          </button>
        </div>
      )}
      <pre
        className={`m-0 min-h-12 overflow-x-auto px-4 py-3.5 pr-11 text-[13px] leading-6 whitespace-pre-wrap break-words ${
          theme === "dark" ? "text-slate-200" : "text-slate-900"
        }`}
        style={{ fontFamily: MONO }}
      >
        {children || ""}
      </pre>
    </div>
  );
};

const ExampleCard = ({ example, index, theme }) => {
  const sampleText = `Input:\n${String(example.input || "").trim()}\n\nOutput:\n${String(example.output || "").trim()}`;
  const [copied, setCopied] = useState(false);

  const copySample = async () => {
    try {
      await navigator.clipboard.writeText(sampleText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // Clipboard access is optional.
    }
  };

  return (
    <section className="mb-8">
      <h3
        className={`mb-3 text-[16px] font-semibold ${
          theme === "dark" ? "text-[#F2F3F5]" : "text-slate-900"
        }`}
      >
        Example {index + 1}
      </h3>

      <div
        className={`relative rounded-lg px-4 py-4 ${
          theme === "dark" ? "bg-[#202020]" : "bg-slate-100"
        }`}
      >
        <button
          type="button"
          onClick={copySample}
          aria-label={`Copy example ${index + 1}`}
          className={`absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-md transition ${
            copied
              ? "text-emerald-500"
              : theme === "dark"
                ? "text-slate-500 hover:bg-white/5 hover:text-slate-300"
                : "text-slate-400 hover:bg-white hover:text-slate-700"
          }`}
        >
          {copied ? <Check size={13} /> : <Clipboard size={13} />}
        </button>

        <div className="space-y-3 pr-8 text-[13px] leading-6">
          <div className="grid grid-cols-[62px_minmax(0,1fr)] gap-2">
            <span
              className={
                theme === "dark" ? "text-emerald-300" : "text-emerald-700"
              }
              style={{ fontFamily: MONO }}
            >
              Input:
            </span>
            <pre
              className={`m-0 overflow-x-auto whitespace-pre-wrap break-words ${
                theme === "dark" ? "text-slate-200" : "text-slate-800"
              }`}
              style={{ fontFamily: MONO }}
            >
              {String(example.input || "").trim() || "(empty)"}
            </pre>
          </div>
          <div className="grid grid-cols-[62px_minmax(0,1fr)] gap-2">
            <span
              className={theme === "dark" ? "text-sky-300" : "text-sky-700"}
              style={{ fontFamily: MONO }}
            >
              Output:
            </span>
            <pre
              className={`m-0 overflow-x-auto whitespace-pre-wrap break-words ${
                theme === "dark" ? "text-slate-200" : "text-slate-800"
              }`}
              style={{ fontFamily: MONO }}
            >
              {String(example.output || "").trim() || "(empty)"}
            </pre>
          </div>
        </div>
      </div>

      {example.explanation && (
        <p
          className={`mt-3 mb-0 text-[14px] leading-7 ${
            theme === "dark" ? "text-slate-300" : "text-slate-700"
          }`}
        >
          <span
            className={`font-semibold ${
              theme === "dark" ? "text-slate-100" : "text-slate-900"
            }`}
          >
            Explanation:{" "}
          </span>
          {example.explanation}
        </p>
      )}
    </section>
  );
};

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
          explanation: tc.explanation || "",
        }));

  const panelBg = theme === "dark" ? "bg-[#191919]" : "bg-white";
  const headerBg = theme === "dark" ? "bg-[#191919]" : "bg-white";
  const border =
    theme === "dark" ? "border-white/[0.07]" : "border-slate-200";
  const text = theme === "dark" ? "text-[#F2F3F5]" : "text-slate-950";
  const difficultyStyle =
    DIFFICULTY_STYLES[problem.difficulty]?.[theme] ||
    (theme === "dark"
      ? "bg-sky-400/10 text-sky-300"
      : "bg-sky-50 text-sky-700");

  return (
    <div
      className={`h-full flex flex-col border-r ${panelBg} ${border}`}
      style={{ fontFamily: SANS }}
    >
      <div className={`shrink-0 border-b ${border} ${headerBg} px-6 py-5`}>
        <h1
          className={`m-0 text-[21px] font-semibold tracking-[-0.025em] leading-7 ${text}`}
        >
          {problem.id}. {problem.title}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          {problem.difficulty && (
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${difficultyStyle}`}
            >
              {problem.difficulty}
            </span>
          )}
          {problem.category && (
            <span className="text-[12px] font-medium text-slate-500">
              {problem.category}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <article className="mx-auto w-full max-w-[760px] px-6 py-6">
          {richBlocks.length > 0 ? (
            <RichBlocks blocks={richBlocks} theme={theme} />
          ) : (
            description.length > 0 && (
              <section className="mb-8">
                {description.map((para, i) => (
                  <p
                    key={i}
                    className={`m-0 mb-4 last:mb-0 text-[15px] leading-[1.8] ${
                      theme === "dark" ? "text-slate-200" : "text-slate-700"
                    }`}
                  >
                    {para}
                  </p>
                ))}
              </section>
            )
          )}

          {examples.length > 0 && (
            <div>
            {examples.map((ex, i) => (
              <ExampleCard key={i} example={ex} index={i} theme={theme} />
            ))}
            </div>
          )}

          {inputFormat.length > 0 && (
            <Section title="Input Format" theme={theme}>
              <div
                className={`space-y-1 text-[14px] leading-7 ${
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                {inputFormat.map((line, index) => (
                  <p key={index} className="m-0">
                    {line}
                  </p>
                ))}
              </div>
            </Section>
          )}

          {outputFormat.length > 0 && (
            <Section title="Output Format" theme={theme}>
              <div
                className={`space-y-1 text-[14px] leading-7 ${
                  theme === "dark" ? "text-slate-300" : "text-slate-700"
                }`}
              >
                {outputFormat.map((line, index) => (
                  <p key={index} className="m-0">
                    {line}
                  </p>
                ))}
              </div>
            </Section>
          )}

          {constraints.length > 0 && (
            <Section title="Constraints" theme={theme}>
              <ul className="m-0 space-y-2.5 pl-5">
                {constraints.map((c, i) => (
                  <li
                    key={i}
                    className={
                      theme === "dark"
                        ? "text-slate-400 marker:text-slate-600"
                        : "text-slate-600 marker:text-slate-400"
                    }
                  >
                    <code
                      className={`rounded-md px-1.5 py-0.5 text-[12px] leading-5 ${
                        theme === "dark"
                          ? "bg-white/[0.06] text-slate-200"
                          : "bg-slate-100 text-slate-800"
                      }`}
                      style={{ fontFamily: MONO }}
                    >
                      {c}
                    </code>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {problem.note && (
            <div
              className={`rounded-lg border-l-2 px-4 py-3 text-sm leading-6 ${
                theme === "dark"
                  ? "border-blue-400 bg-blue-400/[0.08] text-blue-100"
                  : "border-blue-500 bg-blue-50 text-blue-800"
              }`}
            >
              {problem.note}
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
