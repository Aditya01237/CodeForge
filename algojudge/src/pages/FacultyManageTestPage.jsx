import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Database,
  FilePlus2,
  Moon,
  Plus,
  RefreshCcw,
  Save,
  Sun,
  Trash2,
} from "lucide-react";
import { apiDelete, apiGet, apiPost } from "../api";
import RichProblemBuilder from "../components/RichProblemBuilder";

const MONO = "'JetBrains Mono', 'Fira Code', ui-monospace, monospace";

const emptyCase = () => ({
  inputData: "",
  expectedOutput: "",
});

const defaultBlocks = () => [
  {
    id: crypto.randomUUID(),
    type: "paragraph",
    text: "",
  },
];

export default function FacultyManageTestPage() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("cf_theme") || "dark";
  });

  const [activeTab, setActiveTab] = useState("existing");

  const [test, setTest] = useState(null);
  const [problems, setProblems] = useState([]);
  const [attached, setAttached] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    title: "",
    difficulty: "Easy",
    inputFormat: "",
    outputFormat: "",
    constraintsText: "",
    reusable: false,
  });

  const [blocks, setBlocks] = useState(defaultBlocks);
  const [sampleCases, setSampleCases] = useState([emptyCase()]);
  const [hiddenCases, setHiddenCases] = useState([emptyCase()]);

  const isDark = theme === "dark";

  useEffect(() => {
    localStorage.setItem("cf_theme", theme);

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const pageClass = isDark
    ? "bg-[#070B12] text-white"
    : "bg-[#F8FAFC] text-slate-950";

  const navClass = isDark
    ? "bg-[#0D1117] border-white/10"
    : "bg-white border-slate-200";

  const cardClass = isDark
    ? "bg-[#111827] border-white/10"
    : "bg-white border-slate-200 shadow-sm";

  const inputClass = isDark
    ? "bg-[#070B12] border-white/10 text-white placeholder:text-slate-600 focus:border-[#58A6FF]"
    : "bg-white border-slate-200 text-slate-950 placeholder:text-slate-400 focus:border-blue-500";

  const softButton = isDark
    ? "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100";

  const muted = isDark ? "text-slate-400" : "text-slate-600";

  const attachedProblemIds = useMemo(() => {
    return new Set(attached.map((item) => item.problem?.id));
  }, [attached]);

  const availableProblems = useMemo(() => {
    return problems.filter((problem) => !attachedProblemIds.has(problem.id));
  }, [problems, attachedProblemIds]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const [testData, problemsData, attachedData] = await Promise.all([
        apiGet(`/faculty/tests/${testId}`),
        apiGet("/problems"),
        apiGet(`/tests/${testId}/problems`),
      ]);

      setTest(testData);
      setProblems(Array.isArray(problemsData) ? problemsData : []);
      setAttached(Array.isArray(attachedData) ? attachedData : []);
    } catch (err) {
      setError(err.message || "Failed to load test data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [testId]);

  const updateField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const attachExistingProblem = async (problemId) => {
    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      await apiPost(`/faculty/tests/${testId}/problems`, {
        problemId,
        problemOrder: attached.length + 1,
      });

      setSuccess("Problem attached to test.");
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to attach problem.");
    } finally {
      setActionLoading(false);
    }
  };

  const removeProblem = async (problemId) => {
    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      await apiDelete(`/faculty/tests/${testId}/problems/${problemId}`);
      setSuccess("Problem removed from test.");
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to remove problem.");
    } finally {
      setActionLoading(false);
    }
  };

  const updateCase = (type, index, key, value) => {
    const setter = type === "sample" ? setSampleCases : setHiddenCases;

    setter((prev) =>
      prev.map((tc, i) => (i === index ? { ...tc, [key]: value } : tc))
    );
  };

  const addCase = (type) => {
    const setter = type === "sample" ? setSampleCases : setHiddenCases;
    setter((prev) => [...prev, emptyCase()]);
  };

  const removeCase = (type, index) => {
    const setter = type === "sample" ? setSampleCases : setHiddenCases;

    setter((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const compactCases = (cases) => {
    return cases
      .map((tc) => ({
        inputData: tc.inputData || "",
        expectedOutput: tc.expectedOutput || "",
      }))
      .filter((tc) => tc.inputData.trim() || tc.expectedOutput.trim());
  };

  const createPlainDescription = () => {
    return blocks
      .filter((block) => block.type === "paragraph" || block.type === "note")
      .map((block) => block.text || "")
      .filter(Boolean)
      .join("\n\n");
  };

  const handleCreateAndAttach = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.title.trim()) {
      setError("Problem title is required.");
      return;
    }

    if (blocks.length === 0) {
      setError("Add at least one problem statement block.");
      return;
    }

    const sample = compactCases(sampleCases);
    const hidden = compactCases(hiddenCases);

    if (sample.length === 0) {
      setError("Add at least one sample test case.");
      return;
    }

    if (hidden.length === 0) {
      setError("Add at least one hidden test case.");
      return;
    }

    setActionLoading(true);

    try {
      await apiPost(`/faculty/tests/${testId}/problems/create-and-attach`, {
        title: form.title.trim(),
        difficulty: form.difficulty,
        description: createPlainDescription(),
        inputFormat: form.inputFormat,
        outputFormat: form.outputFormat,
        constraintsText: form.constraintsText,
        contentJson: JSON.stringify({
          version: 1,
          blocks,
        }),
        reusable: form.reusable,
        problemOrder: attached.length + 1,
        sampleTestCases: sample,
        hiddenTestCases: hidden,
      });

      setSuccess("New problem created and attached to this test.");

      setForm({
        title: "",
        difficulty: "Easy",
        inputFormat: "",
        outputFormat: "",
        constraintsText: "",
        reusable: false,
      });

      setBlocks(defaultBlocks());
      setSampleCases([emptyCase()]);
      setHiddenCases([emptyCase()]);
      setActiveTab("existing");

      await loadData();
    } catch (err) {
      setError(err.message || "Failed to create problem.");
    } finally {
      setActionLoading(false);
    }
  };

  const renderCaseEditor = (type, cases) => {
    return (
      <div className="space-y-4">
        {cases.map((tc, index) => (
          <div
            key={index}
            className={`rounded-2xl border p-4 ${
              isDark ? "border-white/10 bg-black/20" : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="text-xs uppercase tracking-[0.18em] text-[#58A6FF]"
                style={{ fontFamily: MONO }}
              >
                {type === "sample" ? "Sample" : "Hidden"} Case {index + 1}
              </div>

              <button
                type="button"
                onClick={() => removeCase(type, index)}
                className="h-8 w-8 rounded-lg border border-rose-400/20 bg-rose-500/10 text-rose-500 flex items-center justify-center"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <label>
                <span className={`text-xs block mb-2 ${muted}`}>Input</span>
                <textarea
                  value={tc.inputData}
                  onChange={(e) => updateCase(type, index, "inputData", e.target.value)}
                  rows={5}
                  placeholder="Input data"
                  className={`w-full rounded-xl border px-4 py-3 outline-none resize-y ${inputClass}`}
                  style={{ fontFamily: MONO }}
                />
              </label>

              <label>
                <span className={`text-xs block mb-2 ${muted}`}>Expected Output</span>
                <textarea
                  value={tc.expectedOutput}
                  onChange={(e) =>
                    updateCase(type, index, "expectedOutput", e.target.value)
                  }
                  rows={5}
                  placeholder="Expected output"
                  className={`w-full rounded-xl border px-4 py-3 outline-none resize-y ${inputClass}`}
                  style={{ fontFamily: MONO }}
                />
              </label>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => addCase(type)}
          className={`h-10 px-4 rounded-xl border text-sm font-semibold flex items-center gap-2 ${softButton}`}
        >
          <Plus size={15} />
          Add {type === "sample" ? "Sample" : "Hidden"} Case
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070B12] text-white p-8">
        Loading test manager...
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${pageClass}`}>
      <nav className={`h-16 px-6 flex items-center justify-between border-b ${navClass}`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/faculty")}
            className={`h-10 w-10 rounded-xl border flex items-center justify-center transition ${softButton}`}
          >
            <ArrowLeft size={17} />
          </button>

          <button
            onClick={() => navigate("/")}
            className="text-xl font-bold text-[#58A6FF]"
            style={{ fontFamily: MONO }}
          >
            CodeForge
          </button>

          <div className={`hidden md:block h-7 w-px ${isDark ? "bg-white/10" : "bg-slate-200"}`} />

          <div className="hidden md:block">
            <div className="font-bold">Manage Test Problems</div>
            <div className={`text-xs ${muted}`}>
              {test?.title || `Test #${testId}`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className={`h-10 px-4 rounded-xl border flex items-center gap-2 text-sm font-semibold transition ${softButton}`}
          >
            <RefreshCcw size={15} />
            Refresh
          </button>

          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`h-10 px-4 rounded-xl border flex items-center gap-2 text-sm font-semibold transition ${softButton}`}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
            {isDark ? "Light" : "Dark"}
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <section className="grid lg:grid-cols-[1fr_380px] gap-6 mb-6">
          <div className={`rounded-3xl border p-7 ${cardClass}`}>
            <div
              className="text-xs uppercase tracking-[0.25em] text-[#58A6FF] mb-3"
              style={{ fontFamily: MONO }}
            >
              Test Problem Manager
            </div>

            <h1 className="text-4xl font-black mb-3">
              {test?.title || "Coding Test"}
            </h1>

            <p className={`leading-7 ${muted}`}>
              Select existing problems from the problem bank or create a rich
              problem with text, math, code, and uploaded images.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <span className={`px-3 py-1 rounded-full border ${softButton}`}>
                Test Code:{" "}
                <span className="font-mono text-[#58A6FF]">
                  {test?.testCode || "—"}
                </span>
              </span>

              <span className={`px-3 py-1 rounded-full border ${softButton}`}>
                Attached Problems: {attached.length}
              </span>
            </div>
          </div>

          <div className={`rounded-3xl border p-6 ${cardClass}`}>
            <BookOpen className="text-[#58A6FF] mb-3" size={24} />
            <div className="text-3xl font-black">{attached.length}</div>
            <div className={`text-sm mt-1 ${muted}`}>Problems in this test</div>
          </div>
        </section>

        {error && (
          <div className="mb-5 rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-500">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">
            {success}
          </div>
        )}

        <section className={`rounded-3xl border p-5 mb-6 ${cardClass}`}>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab("existing")}
              className={`h-11 px-5 rounded-xl border text-sm font-bold flex items-center gap-2 transition ${
                activeTab === "existing"
                  ? "border-blue-400 bg-blue-500/10 text-[#58A6FF]"
                  : softButton
              }`}
            >
              <Database size={16} />
              Select Existing Problems
            </button>

            <button
              onClick={() => setActiveTab("create")}
              className={`h-11 px-5 rounded-xl border text-sm font-bold flex items-center gap-2 transition ${
                activeTab === "create"
                  ? "border-blue-400 bg-blue-500/10 text-[#58A6FF]"
                  : softButton
              }`}
            >
              <FilePlus2 size={16} />
              Create New Problem
            </button>
          </div>
        </section>

        <section className="grid lg:grid-cols-[1fr_420px] gap-6">
          <div className={`rounded-3xl border overflow-hidden ${cardClass}`}>
            {activeTab === "existing" ? (
              <div>
                <div className={`px-6 py-5 border-b ${isDark ? "border-white/10" : "border-slate-200"}`}>
                  <h2 className="text-2xl font-black">Problem Bank</h2>
                  <p className={`text-sm mt-1 ${muted}`}>
                    Choose from existing problems and attach them to this test.
                  </p>
                </div>

                {availableProblems.length === 0 ? (
                  <div className={`p-10 text-center ${muted}`}>
                    No more problems available to attach.
                  </div>
                ) : (
                  <div>
                    {availableProblems.map((problem) => (
                      <div
                        key={problem.id}
                        className={`grid md:grid-cols-[1fr_120px_120px] gap-4 px-6 py-5 border-b items-center ${
                          isDark
                            ? "border-white/5 hover:bg-white/[0.03]"
                            : "border-slate-100 hover:bg-slate-50"
                        } transition`}
                      >
                        <div>
                          <div className="font-bold text-lg">{problem.title}</div>
                          <div className={`text-sm mt-1 ${muted}`}>
                            ID: {problem.id} · {problem.reusable === false ? "Test-only" : "Reusable"}
                          </div>
                        </div>

                        <span
                          className={`inline-flex justify-center rounded-full border px-3 py-1 text-xs font-bold ${
                            isDark
                              ? "border-white/10 bg-white/[0.04] text-slate-300"
                              : "border-slate-200 bg-slate-50 text-slate-700"
                          }`}
                        >
                          {problem.difficulty || "—"}
                        </span>

                        <button
                          disabled={actionLoading}
                          onClick={() => attachExistingProblem(problem.id)}
                          className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold transition flex items-center justify-center gap-2"
                        >
                          <Plus size={15} />
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleCreateAndAttach} className="p-6 space-y-7">
                <div>
                  <h2 className="text-2xl font-black">Create New Problem</h2>
                  <p className={`text-sm mt-1 ${muted}`}>
                    Build a rich problem and attach it directly to this test.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <label className="md:col-span-2">
                    <span
                      className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2 block"
                      style={{ fontFamily: MONO }}
                    >
                      Problem Title
                    </span>

                    <input
                      value={form.title}
                      onChange={(e) => updateField("title", e.target.value)}
                      placeholder="Maximum Subarray Sum"
                      className={`w-full h-12 rounded-xl border px-4 outline-none transition ${inputClass}`}
                    />
                  </label>

                  <label>
                    <span
                      className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2 block"
                      style={{ fontFamily: MONO }}
                    >
                      Difficulty
                    </span>

                    <select
                      value={form.difficulty}
                      onChange={(e) => updateField("difficulty", e.target.value)}
                      className={`w-full h-12 rounded-xl border px-4 outline-none transition ${inputClass}`}
                    >
                      <option>Easy</option>
                      <option>Medium</option>
                      <option>Hard</option>
                    </select>
                  </label>

                  <label>
                    <span
                      className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2 block"
                      style={{ fontFamily: MONO }}
                    >
                      Save Mode
                    </span>

                    <select
                      value={form.reusable ? "GLOBAL" : "TEST_ONLY"}
                      onChange={(e) => updateField("reusable", e.target.value === "GLOBAL")}
                      className={`w-full h-12 rounded-xl border px-4 outline-none transition ${inputClass}`}
                    >
                      <option value="TEST_ONLY">Only for this test</option>
                      <option value="GLOBAL">Add to problem bank also</option>
                    </select>
                  </label>
                </div>

                <div>
                  <div
                    className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-3"
                    style={{ fontFamily: MONO }}
                  >
                    Problem Statement Builder
                  </div>

                  <RichProblemBuilder blocks={blocks} setBlocks={setBlocks} theme={theme} />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <label>
                    <span
                      className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2 block"
                      style={{ fontFamily: MONO }}
                    >
                      Input Format
                    </span>

                    <textarea
                      value={form.inputFormat}
                      onChange={(e) => updateField("inputFormat", e.target.value)}
                      rows={5}
                      placeholder="First line contains n..."
                      className={`w-full rounded-xl border px-4 py-3 outline-none resize-y ${inputClass}`}
                    />
                  </label>

                  <label>
                    <span
                      className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2 block"
                      style={{ fontFamily: MONO }}
                    >
                      Output Format
                    </span>

                    <textarea
                      value={form.outputFormat}
                      onChange={(e) => updateField("outputFormat", e.target.value)}
                      rows={5}
                      placeholder="Print the answer..."
                      className={`w-full rounded-xl border px-4 py-3 outline-none resize-y ${inputClass}`}
                    />
                  </label>

                  <label>
                    <span
                      className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2 block"
                      style={{ fontFamily: MONO }}
                    >
                      Constraints
                    </span>

                    <textarea
                      value={form.constraintsText}
                      onChange={(e) => updateField("constraintsText", e.target.value)}
                      rows={5}
                      placeholder="1 <= n <= 10^5"
                      className={`w-full rounded-xl border px-4 py-3 outline-none resize-y ${inputClass}`}
                      style={{ fontFamily: MONO }}
                    />
                  </label>
                </div>

                <div>
                  <div
                    className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-3"
                    style={{ fontFamily: MONO }}
                  >
                    Sample Test Cases
                  </div>

                  {renderCaseEditor("sample", sampleCases)}
                </div>

                <div>
                  <div
                    className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-3"
                    style={{ fontFamily: MONO }}
                  >
                    Hidden Test Cases
                  </div>

                  {renderCaseEditor("hidden", hiddenCases)}
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold transition flex items-center gap-2"
                >
                  <Save size={17} />
                  {actionLoading ? "Saving..." : "Save & Attach Problem"}
                </button>
              </form>
            )}
          </div>

          <aside className={`rounded-3xl border overflow-hidden ${cardClass}`}>
            <div className={`px-5 py-4 border-b ${isDark ? "border-white/10" : "border-slate-200"}`}>
              <h2 className="text-xl font-black">Attached Problems</h2>
              <p className={`text-sm mt-1 ${muted}`}>
                Problems currently inside this test.
              </p>
            </div>

            {attached.length === 0 ? (
              <div className={`p-8 text-center ${muted}`}>
                No problems attached yet.
              </div>
            ) : (
              <div>
                {attached.map((item, index) => (
                  <div
                    key={item.id}
                    className={`px-5 py-4 border-b ${
                      isDark ? "border-white/5" : "border-slate-100"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs text-slate-500"
                            style={{ fontFamily: MONO }}
                          >
                            #{String(index + 1).padStart(2, "0")}
                          </span>

                          <CheckCircle2 size={15} className="text-emerald-500" />
                        </div>

                        <div className="font-bold mt-1">
                          {item.problem?.title || "Untitled Problem"}
                        </div>

                        <div className={`text-xs mt-1 ${muted}`}>
                          ID: {item.problem?.id} · {item.problem?.difficulty || "—"}
                        </div>
                      </div>

                      <button
                        onClick={() => removeProblem(item.problem?.id)}
                        disabled={actionLoading}
                        className="h-9 w-9 rounded-xl border border-rose-400/20 bg-rose-500/10 text-rose-500 flex items-center justify-center disabled:opacity-60"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </section>
      </main>
    </div>
  );
}