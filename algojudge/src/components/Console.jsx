import { useState } from "react";
import { X } from "lucide-react";

const Console = ({ output, running, onClose }) => {
  const [collapsed, setCollapsed] = useState(false);

  if (!running && !output) return null;

  const ok =
    output?.type === "success" ||
    (typeof output?.text === "string" &&
      output.text.includes("passed"));

  return (
    <div className="flex flex-col h-full bg-[#1E1E1E] border-t border-[#2C2C2C] font-mono text-sm">

      {/* HEADER */}
      <div
        onClick={() => setCollapsed((v) => !v)}
        className="h-11 flex items-center justify-between px-4 border-b border-[#2C2C2C] bg-[#1E1E1E] cursor-pointer"
      >
        <div className="flex items-center gap-3">

          {/* Title */}
          <span className="text-[11px] tracking-widest uppercase text-[#8B949E]">
            Console
          </span>

          {/* Status */}
          {!running && output && (
            <span
              className={`text-[10px] px-2 py-[2px] rounded-full font-semibold
                ${
                  ok
                    ? "text-[#3FB950] bg-[#3FB9501A]"
                    : "text-[#F85149] bg-[#F851491A]"
                }`}
            >
              {ok ? "✓ Passed" : "✗ Failed"}
            </span>
          )}

          {/* Running */}
          {running && (
            <span className="flex items-center gap-2 text-[11px] text-[#8B949E]">
              <span className="w-3 h-3 border-2 border-[#30363D] border-t-[#58A6FF] rounded-full animate-spin" />
              Running test cases…
            </span>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2">

          {/* Toggle */}
          <span className="text-xs text-[#8B949E]">
            {collapsed ? "▲" : "▼"}
          </span>

          {/* Close */}
          {onClose && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-1 text-[#8B949E] hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* BODY */}
      {!collapsed && (
        <div className="px-4 py-3 max-h-[130px] overflow-y-auto">
          {running ? (
            <span className="text-[#8B949E] text-sm">
              Executing…
            </span>
          ) : (
            <pre
              className={`whitespace-pre-wrap text-sm leading-relaxed ${
                ok ? "text-[#3FB950]" : "text-[#F85149]"
              }`}
            >
              {output?.text || "No output"}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

export default Console;