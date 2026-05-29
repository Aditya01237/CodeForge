import { useState } from "react";
import Editor from "@monaco-editor/react";
import { STARTERS } from "../data/codeTemplates";

const LANGS = ["C++", "Python", "Java"];
const FONTSIZES = [12, 13, 14, 15, 16, 18, 20];

export default function EditorPanel({ code, setCode, onLangChange }) {
  const [lang, setLang] = useState("C++");
  const [fontSize, setFontSize] = useState(14);
  const [openMenu, setOpenMenu] = useState(null); // "lang" | "font"
  const [codeMap, setCodeMap] = useState(STARTERS);

  const switchLang = (l) => {
    setLang(l);
    onLangChange?.(l);
    setCode(codeMap[l] || STARTERS[l]);
    setOpenMenu(null);
  };

  const getLanguageKey = (lang) => {
    if (lang === "C++") return "cpp";
    if (lang === "Python") return "python";
    if (lang === "Java") return "java";
    return "cpp";
  };

  const monacoLang = getLanguageKey(lang);

  const handleEditorWillMount = (monaco) => {
    monaco.editor.defineTheme("leetcodeDark", {
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
        "editor.background": "#1E1E1E",
        "editor.foreground": "#DCDCDC",
        "editorLineNumber.foreground": "#858585",
        "editorLineNumber.activeForeground": "#DCDCDC",
        "editorCursor.foreground": "#AEAFAD",
        "editor.selectionBackground": "#264F78",
        "editor.lineHighlightBackground": "#2A2A2A",
        "editorGutter.background": "#1E1E1E",
      },
    });
  };

  return (
    <div
      className="flex flex-col border-t-[0.5px] border-l-[0.5px] border-b-[0.5px] border-gray-500 h-full bg-[#1E1E1E] rounded-tl-lg"
      onClick={() => setOpenMenu(null)}
    >
      {/* TOOLBAR */}
      <div className="h-11 flex items-center justify-between px-4 border-b border-[#2A2F3A] flex-shrink-0">
        {/* LEFT — Language selector */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenu(openMenu === "lang" ? null : "lang");
            }}
            className="text-xs font-mono px-3 py-1.5 rounded border border-[#30363D] text-[#8B949E] hover:text-white"
          >
            {lang} ▾
          </button>

          {openMenu === "lang" && (
            <div className="absolute mt-2 w-32 bg-[#1E1E1E] border border-[#30363D] rounded-md z-50">
              {LANGS.map((l) => (
                <button
                  key={l}
                  onClick={() => switchLang(l)}
                  className="w-full text-left px-4 py-2 text-xs text-teal-50 font-mono hover:bg-[#21262D]"
                >
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Font size selector */}
        {/* RIGHT — Reset + Font size */}
        <div className="flex items-center gap-2">
          {/* 🔁 RESET BUTTON */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const starter = STARTERS[lang] || "";
              setCodeMap((prev) => ({ ...prev, [lang]: starter }));
              setCode(starter);
            }}
            className="text-xs px-3 py-1.5 rounded border border-[#30363D] text-[#8B949E] hover:text-white hover:border-[#58A6FF]"
          >
            ↺
          </button>

          {/* FONT SIZE DROPDOWN */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenu(openMenu === "font" ? null : "font");
              }}
              className="text-xs font-mono px-3 py-1.5 rounded border border-[#30363D] text-[#8B949E]"
            >
              {fontSize}px ▾
            </button>

            {openMenu === "font" && (
              <div className="absolute right-0 mt-2 w-28 bg-[#1E1E1E] border border-[#30363D] rounded-md z-50">
                {FONTSIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setFontSize(s);
                      setOpenMenu(null);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-teal-50 font-mono hover:bg-[#21262D]"
                  >
                    {s}px
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MONACO EDITOR — fills remaining height */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={monacoLang}
          theme="leetcodeDark"
          beforeMount={handleEditorWillMount}
          value={codeMap[lang] || ""}
          onChange={(value) => {
            const updated = value || "";
            setCodeMap((prev) => ({ ...prev, [lang]: updated }));
            setCode(updated);
          }}
          options={{
            fontSize,
            fontFamily: "JetBrains Mono",
            minimap: { enabled: false },
            automaticLayout: true,
            scrollBeyondLastLine: false,
            padding: { top: 12 },
            lineHeight: 22,
          }}
        />
      </div>
    </div>
  );
}
