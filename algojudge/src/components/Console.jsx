import { useState } from "react";
import { X } from "lucide-react";

const Console = ({ output, running, onClose }) => {
  const [collapsed, setCollapsed] = useState(false);

  if (!running && !output) return null;

  const status = output?.status;

  const ok = status === "Accepted";

  return (
    <div className="flex flex-col h-full bg-[#1E1E1E] border-t border-[#2C2C2C] font-mono text-sm">

      {/* HEADER */}
      <div
        onClick={() => setCollapsed((v) => !v)}
        className="h-11 flex items-center justify-between px-4 border-b cursor-pointer"
      >
        <div className="flex items-center gap-3">

          <span className="text-[11px] text-[#8B949E]">Console</span>

          {!running && output && (
            <span
              className={`text-[10px] px-2 py-[2px] rounded-full ${
                ok ? "text-green-400" : "text-red-400"
              }`}
            >
              {ok ? "✓ Accepted" : status}
            </span>
          )}

          {running && (
            <span className="text-[#8B949E]">
              Running...
            </span>
          )}
        </div>

        {onClose && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* BODY */}
      {!collapsed && (
        <div className="px-4 py-3 max-h-[130px] overflow-y-auto">

          {running && <div>Executing...</div>}

          {!running && output?.status && (
            <div>Status: {output.status}</div>
          )}

        </div>
      )}
    </div>
  );
};

export default Console;