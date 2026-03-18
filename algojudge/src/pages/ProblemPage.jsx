import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { problems } from "../data/problems";

import TopBar from "../components/TopBar";
import ProblemPanel from "../components/ProblemPanel";
import EditorPanel from "../components/EditorPanel";
import BottomPanel from "../components/BottomPanel";
import { STARTERS } from "../data/codeTemplates";

export default function ProblemPage() {
  const { id } = useParams();
  const problem = problems.find((p) => p.id === Number(id));

  const containerRef = useRef(null);

  const draggingVertical = useRef(false);
  const draggingHorizontal = useRef(false);

  const [lang, setLang] = useState("C++");
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState(null);

  const [leftWidth, setLeftWidth] = useState(44);
  const [bottomHeight, setBottomHeight] = useState(220);

  const [code, setCode] = useState("");
  const [input, setInput] = useState(""); // 🔥 NEW

  const MIN_EDITOR_HEIGHT = 200;

  // 🔥 RUN CODE (NOW SENDS INPUT ALSO)
  const handleRun = async () => {
    setRunning(true);
    console.log("SENDING CODE:", code);
    console.log("SENDING INPUT:", input);

    try {
      const res = await fetch("http://localhost:8080/api/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code,
          language: "cpp",
          problemId: problem.id
        })
      });

      const data = await res.json();
      console.log(data);

      setOutput(data);
    } catch (err) {
      console.log(err);
      setOutput({
        type: "error",
        text: "Server error ❌",
      });
    }

    setRunning(false);
  };

  const handleSubmit = async () => {
  setRunning(true);

  try {
    const res = await fetch("http://localhost:8080/api/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: code,
        language: "cpp",
        problemId: problem.id
      })
    });

    const data = await res.json();
    console.log("SUBMIT RESPONSE:", data);

    setOutput(data);

  } catch (err) {
    console.log(err);
    setOutput({
      status: "Error",
      output: "Server error ❌"
    });
  }

  setRunning(false);
};

  // 🔥 LOAD STARTER + SAMPLE INPUT
  useEffect(() => {
    setCode(STARTERS[lang] || "");

    if (problem?.sampleInput) {
      setInput(problem.sampleInput);
    }

    const onMouseMove = (e) => {
      // VERTICAL
      if (draggingVertical.current && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const percent = ((e.clientX - rect.left) / rect.width) * 100;

        if (percent > 15 && percent < 85) {
          setLeftWidth(percent);
        }
      }

      // HORIZONTAL
      if (draggingHorizontal.current) {
        const newHeight = window.innerHeight - e.clientY;

        if (
          newHeight > 120 &&
          newHeight < window.innerHeight - MIN_EDITOR_HEIGHT
        ) {
          setBottomHeight(newHeight);
        }
      }
    };

    const onMouseUp = () => {
      draggingVertical.current = false;
      draggingHorizontal.current = false;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [lang, problem]);

  if (!problem) return <div>Problem not found</div>;

  return (
    <div className="flex flex-col h-screen bg-[#000000]">
      {/* TOP BAR */}
      <TopBar
        problem={problem}
        lang={lang}
        onRun={handleRun}
        onSubmit={handleSubmit}
        running={running}
      />

      <div ref={containerRef} className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL */}
        <div
          className="overflow-hidden"
          style={{ width: `${leftWidth}%`, minWidth: 280 }}
        >
          <ProblemPanel problem={problem} />
        </div>

        {/* VERTICAL RESIZER */}
        <div
          onMouseDown={() => (draggingVertical.current = true)}
          className="w-[6px] cursor-col-resize bg-[#000000]"
        />

        {/* RIGHT SIDE */}
        <div className="flex flex-col" style={{ width: `${100 - leftWidth}%` }}>
          {/* EDITOR */}
          <div
            className="flex-1 overflow-hidden border-b border-[#2A2F3A]"
            style={{ minHeight: MIN_EDITOR_HEIGHT }}
          >
            <EditorPanel
              problem={problem}
              code={code}
              setCode={setCode}
              onLangChange={setLang}
            />
          </div>

          {/* HORIZONTAL RESIZER */}
          <div
            onMouseDown={() => (draggingHorizontal.current = true)}
            className="h-[6px] cursor-row-resize bg-[#000000]"
          />

          {/* BOTTOM PANEL */}
          <div style={{ height: bottomHeight }}>
            <BottomPanel
              problem={problem}
              output={output}
              running={running}
              input={input} // 🔥 NEW
              setInput={setInput} // 🔥 NEW
            />
          </div>
        </div>
      </div>
    </div>
  );
}
