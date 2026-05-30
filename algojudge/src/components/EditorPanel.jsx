import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { STARTERS } from "../data/codeTemplates";

const LANGS = ["C++", "Python", "Java"];
const FONTSIZES = [12, 13, 14, 15, 16, 18, 20, 22, 24];

const MIN_FONT = 12;
const MAX_FONT = 24;

const languageToMonaco = (lang) => {
  if (lang === "C++") return "cpp";
  if (lang === "Python") return "python";
  if (lang === "Java") return "java";
  return "cpp";
};

export default function EditorPanel({
  code,
  setCode,
  lang = "C++",
  onLangChange,
  theme = "dark",
}) {
  const [fontSize, setFontSize] = useState(() => {
    const saved = Number(localStorage.getItem("cf_editor_font_size"));
    return saved || 14;
  });

  const [openMenu, setOpenMenu] = useState(null);

  const [codeMap, setCodeMap] = useState(() => ({
    "C++": STARTERS["C++"] || "",
    Python: STARTERS["Python"] || "",
    Java: STARTERS["Java"] || "",
  }));

  const isDark = theme === "dark";

  useEffect(() => {
    localStorage.setItem("cf_editor_font_size", String(fontSize));
  }, [fontSize]);

  useEffect(() => {
    if (!code) {
      setCode(STARTERS[lang] || "");
    }
  }, []);

  const increaseFont = (e) => {
    e.stopPropagation();
    setFontSize((prev) => Math.min(prev + 1, MAX_FONT));
  };

  const decreaseFont = (e) => {
    e.stopPropagation();
    setFontSize((prev) => Math.max(prev - 1, MIN_FONT));
  };

  const changeFontSize = (size) => {
    setFontSize(size);
    setOpenMenu(null);
  };

  const switchLang = (nextLang) => {
    const currentCode = code || "";

    setCodeMap((prev) => ({
      ...prev,
      [lang]: currentCode,
    }));

    const nextCode =
      codeMap[nextLang] !== undefined
        ? codeMap[nextLang]
        : STARTERS[nextLang] || "";

    onLangChange?.(nextLang);
    setCode(nextCode);
    setOpenMenu(null);
  };

  const resetCode = (e) => {
    e.stopPropagation();

    const starter = STARTERS[lang] || "";

    setCodeMap((prev) => ({
      ...prev,
      [lang]: starter,
    }));

    setCode(starter);
  };

  const handleEditorWillMount = (monaco) => {
    monaco.editor.defineTheme("codeforgeDark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: "DCDCDC" },
        { token: "keyword", foreground: "C586C0" },
        { token: "type", foreground: "4EC9B0" },
        { token: "entity.name.function", foreground: "DCDCAA" },
        { token: "identifier", foreground: "9CDCFE" },
        { token: "number", foreground: "B5CEA8" },
        { token: "string", foreground: "CE9178" },
        { token: "comment", foreground: "6A9955", fontStyle: "italic" },
      ],
      colors: {
        "editor.background": "#0B0F14",
        "editor.foreground": "#DCDCDC",
        "editorLineNumber.foreground": "#6B7280",
        "editorLineNumber.activeForeground": "#E5E7EB",
        "editorCursor.foreground": "#58A6FF",
        "editor.selectionBackground": "#264F78",
        "editor.lineHighlightBackground": "#1E293B66",
        "editorGutter.background": "#0B0F14",
        "editorWidget.background": "#111827",
        "editorSuggestWidget.background": "#111827",
        "editorSuggestWidget.border": "#30363D",
        "editorIndentGuide.background1": "#1F2937",
        "editorIndentGuide.activeBackground1": "#58A6FF",
      },
    });

    monaco.editor.defineTheme("codeforgeLight", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "", foreground: "111827" },
        { token: "keyword", foreground: "7C3AED" },
        { token: "type", foreground: "0F766E" },
        { token: "entity.name.function", foreground: "B45309" },
        { token: "identifier", foreground: "1D4ED8" },
        { token: "number", foreground: "047857" },
        { token: "string", foreground: "B91C1C" },
        { token: "comment", foreground: "6B7280", fontStyle: "italic" },
      ],
      colors: {
        "editor.background": "#FFFFFF",
        "editor.foreground": "#111827",
        "editorLineNumber.foreground": "#94A3B8",
        "editorLineNumber.activeForeground": "#0F172A",
        "editorCursor.foreground": "#2563EB",
        "editor.selectionBackground": "#BFDBFE",
        "editor.lineHighlightBackground": "#F1F5F9",
        "editorGutter.background": "#FFFFFF",
        "editorWidget.background": "#FFFFFF",
        "editorSuggestWidget.background": "#FFFFFF",
        "editorSuggestWidget.border": "#CBD5E1",
        "editorIndentGuide.background1": "#E2E8F0",
        "editorIndentGuide.activeBackground1": "#2563EB",
      },
    });
  };

  const wrapperClass = isDark
    ? "bg-[#0B0F14] border-white/10"
    : "bg-white border-slate-200";

  const toolbarClass = isDark
    ? "bg-[#0D1117] border-white/10"
    : "bg-white border-slate-200";

  const buttonClass = isDark
    ? "border-white/10 bg-white/[0.04] text-slate-300 hover:text-white hover:border-[#58A6FF]/50 hover:bg-white/[0.08]"
    : "border-slate-200 bg-slate-50 text-slate-700 hover:text-slate-950 hover:border-blue-400 hover:bg-slate-100";

  const iconButtonClass = isDark
    ? "border-white/10 bg-white/[0.04] text-slate-400 hover:text-white hover:border-[#58A6FF]/50 hover:bg-white/[0.08]"
    : "border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-950 hover:border-blue-400 hover:bg-slate-100";

  const menuClass = isDark
    ? "bg-[#111827] border-white/10 shadow-black/40"
    : "bg-white border-slate-200 shadow-slate-200/70";

  const menuItemClass = (active) =>
    active
      ? "bg-blue-500/10 text-blue-500"
      : isDark
        ? "text-slate-300 hover:bg-white/5"
        : "text-slate-700 hover:bg-slate-50";

  const mutedText = isDark ? "text-slate-500" : "text-slate-500";

  return (
    <div
      className={`h-full flex flex-col border-l ${wrapperClass}`}
      onClick={() => setOpenMenu(null)}
    >
      {/* TOOLBAR */}
      <div
        className={`h-12 flex items-center justify-between px-4 border-b flex-shrink-0 ${toolbarClass}`}
      >
        {/* LEFT */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Language selector */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenu(openMenu === "lang" ? null : "lang");
              }}
              className={`h-8 min-w-[72px] px-3 rounded-lg border transition text-xs font-mono ${buttonClass}`}
            >
              {lang} ▾
            </button>

            {openMenu === "lang" && (
              <div
                className={`absolute left-0 mt-2 w-36 rounded-xl border shadow-2xl z-50 overflow-hidden ${menuClass}`}
              >
                {LANGS.map((item) => (
                  <button
                    key={item}
                    onClick={() => switchLang(item)}
                    className={`w-full text-left px-4 py-2.5 text-xs font-mono transition ${menuItemClass(
                      item === lang
                    )}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={`hidden md:block text-xs truncate ${mutedText}`}>
            Auto-saved locally per language
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2">
          {/* Reset */}
          <button
            onClick={resetCode}
            className={`h-8 px-3 rounded-lg border transition text-xs flex items-center gap-1.5 ${buttonClass}`}
            title="Reset code"
          >
            <RotateCcw size={13} />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Font controls */}
          <div
            className={`h-8 rounded-lg border flex items-center overflow-hidden ${
              isDark
                ? "border-white/10 bg-white/[0.04]"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <button
              onClick={decreaseFont}
              disabled={fontSize <= MIN_FONT}
              className={`h-8 w-8 flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed ${
                isDark
                  ? "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                  : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
              }`}
              title="Decrease font size"
            >
              <Minus size={14} />
            </button>

            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenu(openMenu === "font" ? null : "font");
                }}
                className={`h-8 min-w-[58px] px-2 border-x text-xs font-mono transition ${
                  isDark
                    ? "border-white/10 text-slate-300 hover:text-white"
                    : "border-slate-200 text-slate-700 hover:text-slate-950"
                }`}
              >
                {fontSize}px
              </button>

              {openMenu === "font" && (
                <div
                  className={`absolute right-0 mt-2 w-28 rounded-xl border shadow-2xl z-50 overflow-hidden ${menuClass}`}
                >
                  {FONTSIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => changeFontSize(size)}
                      className={`w-full text-left px-4 py-2.5 text-xs font-mono transition ${menuItemClass(
                        size === fontSize
                      )}`}
                    >
                      {size}px
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={increaseFont}
              disabled={fontSize >= MAX_FONT}
              className={`h-8 w-8 flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed ${
                isDark
                  ? "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                  : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
              }`}
              title="Increase font size"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* EDITOR */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={languageToMonaco(lang)}
          theme={isDark ? "codeforgeDark" : "codeforgeLight"}
          beforeMount={handleEditorWillMount}
          value={code}
          onChange={(value) => {
            const updated = value || "";

            setCode(updated);

            setCodeMap((prev) => ({
              ...prev,
              [lang]: updated,
            }));
          }}
          options={{
            fontSize,
            fontFamily: "JetBrains Mono, Fira Code, monospace",
            minimap: { enabled: false },
            automaticLayout: true,
            scrollBeyondLastLine: false,
            padding: { top: 14, bottom: 14 },
            lineHeight: Math.round(fontSize * 1.65),
            wordWrap: "on",
            smoothScrolling: true,
            cursorBlinking: "smooth",
            renderLineHighlight: "line",
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: true,
              indentation: true,
            },
          }}
        />
      </div>
    </div>
  );
}