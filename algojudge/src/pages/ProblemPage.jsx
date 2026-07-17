import { useState, useRef, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../api";

import TopBar from "../components/TopBar";
import ProblemPanel from "../components/ProblemPanel";
import EditorPanel from "../components/EditorPanel";
import BottomPanel from "../components/BottomPanel";
import ContestFullscreenGuard from "../components/ContestFullscreenGuard";
import { STARTERS } from "../data/codeTemplates";
import { getCodeStorageKey } from "../utils/editorStorage";

export default function ProblemPage() {
  const { id } = useParams();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("cf_theme") || "dark";
  });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const mode = searchParams.get("mode") || "practice";
  const testId = searchParams.get("testId");

  const [problem, setProblem] = useState(null);
  const [sampleTests, setSampleTests] = useState([]);
  const [loadingProblem, setLoadingProblem] = useState(true);
  const [problemError, setProblemError] = useState("");

  const containerRef = useRef(null);
  const rightRef = useRef(null);

  const draggingVertical = useRef(false);
  const draggingHorizontal = useRef(false);
  const loadingSavedCode = useRef(false);

  const [lang, setLang] = useState("C++");
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState(null);

  const [leftWidth, setLeftWidth] = useState(38);
  const [bottomHeight, setBottomHeight] = useState(220);

  const [code, setCode] = useState("");
  const [input, setInput] = useState("");

  const MIN_EDITOR_HEIGHT = 200;
  const RESIZER_HEIGHT = 6;

  useEffect(() => {
    localStorage.setItem("cf_theme", theme);
  }, [theme]);

  const getLanguageKey = (selectedLang) => {
    if (selectedLang === "C++") return "cpp";
    if (selectedLang === "Python") return "python";
    if (selectedLang === "Java") return "java";
    return "cpp";
  };

  const getCurrentParticipantId = () => {
    if (mode !== "test") return null;

    try {
      const participant = JSON.parse(
        localStorage.getItem("cf_participant") || "null",
      );

      return participant?.participantId || null;
    } catch {
      return null;
    }
  };

  const isTestExpired = () => {
    if (mode !== "test") return false;

    const raw = localStorage.getItem("cf_test_access");
    if (!raw) return true;

    try {
      const test = JSON.parse(raw);
      if (!test.endTime) return false;

      return Date.now() >= new Date(test.endTime).getTime();
    } catch {
      return true;
    }
  };

  useEffect(() => {
    setLoadingProblem(true);
    setProblemError("");
    setOutput(null);

    apiGet(`/problems/${id}`)
      .then((data) => {
        setProblem(data);
      })
      .catch((err) => {
        setProblemError(err.message || "Failed to load problem");
      })
      .finally(() => {
        setLoadingProblem(false);
      });
  }, [id]);

  useEffect(() => {
    if (!problem?.id) return;

    apiGet(`/problems/${problem.id}/testcases/sample`)
      .then((tests) => {
        const safeTests = Array.isArray(tests) ? tests : [];
        setSampleTests(safeTests);

        if (safeTests.length > 0) {
          setInput(safeTests[0].inputData || "");
        } else {
          setInput("");
        }
      })
      .catch(() => {
        setSampleTests([]);
        setInput("");
      });
  }, [problem]);

  useEffect(() => {
    const storageKey = getCodeStorageKey({
      problemId: id,
      language: lang,
      mode,
      testId,
    });
    const savedCode = localStorage.getItem(storageKey);

    loadingSavedCode.current = true;
    setCode(savedCode ?? STARTERS[lang] ?? "");
  }, [id, lang, mode, testId]);

  useEffect(() => {
    if (loadingSavedCode.current) {
      loadingSavedCode.current = false;
      return;
    }

    localStorage.setItem(
      getCodeStorageKey({ problemId: id, language: lang, mode, testId }),
      code,
    );
  }, [code, id, lang, mode, testId]);

  const handleRun = async () => {
    if (isTestExpired()) {
      setOutput({
        status: "Error",
        message: "Test time is over. Submissions are closed.",
      });

      if (testId) {
        navigate(`/test/${testId}/problems`);
      }

      return;
    }

    if (!problem?.id) return;

    setRunning(true);
    setOutput(null);

    try {
      const data = await apiPost("/run", {
        code,
        language: getLanguageKey(lang),
        input,
        problemId: problem.id,
      });

      setOutput(data);
    } catch (err) {
      setOutput({
        status: "Error",
        message: err.message || "Server error ❌",
      });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (isTestExpired()) {
      setOutput({
        status: "Error",
        message: "Test time is over. Submissions are closed.",
      });

      if (testId) {
        navigate(`/test/${testId}/problems`);
      }

      return;
    }

    if (!problem?.id) return;

    const participantId = getCurrentParticipantId();

    if (mode === "test" && (!testId || !participantId)) {
      setOutput({
        status: "Error",
        message: "Participant session missing. Please enter the test again.",
      });
      return;
    }

    setRunning(true);
    setOutput(null);

    try {
      const payload = {
        code,
        language: getLanguageKey(lang),
        problemId: problem.id,
      };

      if (mode === "test") {
        payload.testId = Number(testId);
        payload.participantId = participantId;
      }

      const data = await apiPost("/submit", payload);

      setOutput(data);
    } catch (err) {
      setOutput({
        status: "Error",
        message: err.message || "Server error ❌",
      });
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (draggingVertical.current && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const percent = ((e.clientX - rect.left) / rect.width) * 100;

        if (percent > 28 && percent < 58) {
          setLeftWidth(percent);
        }
      }

      if (draggingHorizontal.current && rightRef.current) {
        const rect = rightRef.current.getBoundingClientRect();
        const newBottomHeight = rect.bottom - e.clientY;
        const minBottom = 120;
        const maxBottom = rect.height - MIN_EDITOR_HEIGHT - RESIZER_HEIGHT;

        setBottomHeight(
          Math.max(minBottom, Math.min(newBottomHeight, maxBottom)),
        );
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
  }, []);

  if (loadingProblem) {
    return (
      <div className="min-h-screen bg-[#070B12] text-white p-8">
        Loading problem...
      </div>
    );
  }

  if (problemError) {
    return (
      <div className="min-h-screen bg-[#070B12] text-red-400 p-8">
        {problemError}
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-[#070B12] text-white p-8">
        Problem not found
      </div>
    );
  }

  const pageBg = theme === "dark" ? "bg-[#070B12]" : "bg-[#F8FAFC]";
  const dividerBg = theme === "dark" ? "bg-white/10" : "bg-slate-200";

  return (
    <div className={`flex flex-col h-screen overflow-hidden ${pageBg}`}>
      {mode === "test" && <ContestFullscreenGuard testId={testId} />}

      <TopBar
        problem={problem}
        lang={lang}
        onRun={handleRun}
        onSubmit={handleSubmit}
        running={running}
        theme={theme}
        setTheme={setTheme}
      />

      <div ref={containerRef} className="flex flex-1 overflow-hidden">
        <div
          style={{ width: `${leftWidth}%`, minWidth: 360 }}
          className="overflow-hidden"
        >
          <ProblemPanel
            problem={problem}
            sampleTests={sampleTests}
            theme={theme}
          />
        </div>

        <div
          onMouseDown={() => (draggingVertical.current = true)}
          className={`w-[6px] cursor-col-resize flex-shrink-0 ${dividerBg}`}
        />

        <div
          ref={rightRef}
          className="flex flex-col overflow-hidden"
          style={{ width: `${100 - leftWidth}%` }}
        >
          <div
            style={{
              height: `calc(100% - ${bottomHeight}px - ${RESIZER_HEIGHT}px)`,
            }}
            className="overflow-hidden flex-shrink-0"
          >
            <EditorPanel
              problem={problem}
              code={code}
              setCode={setCode}
              lang={lang}
              onLangChange={setLang}
              theme={theme}
            />
          </div>

          <div
            onMouseDown={() => (draggingHorizontal.current = true)}
            className={`h-[6px] cursor-row-resize flex-shrink-0 ${dividerBg}`}
          />

          <div
            style={{ height: bottomHeight }}
            className="overflow-hidden flex-shrink-0"
          >
            <BottomPanel
              problem={problem}
              output={output}
              running={running}
              input={input}
              setInput={setInput}
              theme={theme}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
