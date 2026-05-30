import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Moon,
  Sun,
  Save,
  KeyRound,
  Lock,
  CalendarClock,
  Users,
  Globe2,
  GraduationCap,
} from "lucide-react";
import { apiPost } from "../api";

const MONO = "'JetBrains Mono', 'Fira Code', ui-monospace, monospace";

const toLocalDateTimeValue = (date) => {
  const pad = (n) => String(n).padStart(2, "0");

  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());

  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

export default function FacultyCreateTestPage() {
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("cf_theme") || "dark";
  });

  const now = new Date();
  const defaultStart = toLocalDateTimeValue(now);
  const defaultEndDate = new Date(now.getTime() + 90 * 60 * 1000);
  const defaultEnd = toLocalDateTimeValue(defaultEndDate);

  const [form, setForm] = useState({
    title: "",
    testCode: "",
    testPassword: "",
    allowExternalParticipants: false,
    startTime: defaultStart,
    endTime: defaultEnd,
    durationMinutes: 90,
    createdByUserId: null,
  });

  const [createdTest, setCreatedTest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const updateField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const generateCode = () => {
    const random = Math.random().toString(36).slice(2, 6).toUpperCase();
    updateField("testCode", `ALGO-${random}`);
  };

  const generatePassword = () => {
    const random = Math.random().toString(36).slice(2, 8);
    updateField("testPassword", random);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCreatedTest(null);

    if (!form.title.trim()) {
      setError("Please enter test title.");
      return;
    }

    if (!form.testCode.trim()) {
      setError("Please enter test code.");
      return;
    }

    if (!form.testPassword.trim()) {
      setError("Please enter test password.");
      return;
    }

    if (!form.startTime || !form.endTime) {
      setError("Please select start and end time.");
      return;
    }

    if (new Date(form.endTime).getTime() <= new Date(form.startTime).getTime()) {
      setError("End time must be after start time.");
      return;
    }

    setLoading(true);

    try {
      const test = await apiPost("/faculty/tests", {
        ...form,
        testCode: form.testCode.trim().toUpperCase(),
        testPassword: form.testPassword.trim(),
        durationMinutes: Number(form.durationMinutes),
      });

      setCreatedTest(test);
    } catch (err) {
      setError(err.message || "Failed to create test.");
    } finally {
      setLoading(false);
    }
  };

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

          <div className="text-xl font-bold text-[#58A6FF]" style={{ fontFamily: MONO }}>
            CodeForge
          </div>
        </div>

        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className={`h-10 px-4 rounded-xl border flex items-center gap-2 text-sm font-semibold transition ${softButton}`}
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
          {isDark ? "Light" : "Dark"}
        </button>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div
            className="text-xs uppercase tracking-[0.25em] text-[#58A6FF] mb-3"
            style={{ fontFamily: MONO }}
          >
            Faculty Test Builder
          </div>

          <h1 className="text-4xl font-black mb-2">Create Coding Test</h1>

          <p className={muted}>
            Set test credentials, time window, and participant type.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={`rounded-3xl border p-7 ${cardClass}`}>
          <div className="grid md:grid-cols-2 gap-5">
            <label className="md:col-span-2">
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2 block" style={{ fontFamily: MONO }}>
                Test Title
              </span>
              <input
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="Algorithm Coding Test 1"
                className={`w-full h-12 rounded-xl border px-4 outline-none transition ${inputClass}`}
              />
            </label>

            <label>
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2 block" style={{ fontFamily: MONO }}>
                Test Code
              </span>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    value={form.testCode}
                    onChange={(e) => updateField("testCode", e.target.value.toUpperCase())}
                    placeholder="ALGO-CT1"
                    className={`w-full h-12 rounded-xl border pl-11 pr-4 outline-none transition ${inputClass}`}
                    style={{ fontFamily: MONO }}
                  />
                </div>

                <button
                  type="button"
                  onClick={generateCode}
                  className={`h-12 px-4 rounded-xl border font-semibold transition ${softButton}`}
                >
                  Generate
                </button>
              </div>
            </label>

            <label>
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2 block" style={{ fontFamily: MONO }}>
                Test Password
              </span>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    value={form.testPassword}
                    onChange={(e) => updateField("testPassword", e.target.value)}
                    placeholder="algo123"
                    className={`w-full h-12 rounded-xl border pl-11 pr-4 outline-none transition ${inputClass}`}
                  />
                </div>

                <button
                  type="button"
                  onClick={generatePassword}
                  className={`h-12 px-4 rounded-xl border font-semibold transition ${softButton}`}
                >
                  Generate
                </button>
              </div>
            </label>

            <label>
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2 block" style={{ fontFamily: MONO }}>
                Start Time
              </span>
              <div className="relative">
                <CalendarClock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="datetime-local"
                  value={form.startTime}
                  onChange={(e) => updateField("startTime", e.target.value)}
                  className={`w-full h-12 rounded-xl border pl-11 pr-4 outline-none transition ${inputClass}`}
                />
              </div>
            </label>

            <label>
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2 block" style={{ fontFamily: MONO }}>
                End Time
              </span>
              <div className="relative">
                <CalendarClock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="datetime-local"
                  value={form.endTime}
                  onChange={(e) => updateField("endTime", e.target.value)}
                  className={`w-full h-12 rounded-xl border pl-11 pr-4 outline-none transition ${inputClass}`}
                />
              </div>
            </label>

            <label>
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2 block" style={{ fontFamily: MONO }}>
                Duration Minutes
              </span>
              <input
                type="number"
                min="1"
                value={form.durationMinutes}
                onChange={(e) => updateField("durationMinutes", e.target.value)}
                className={`w-full h-12 rounded-xl border px-4 outline-none transition ${inputClass}`}
              />
            </label>

            <div>
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2 block" style={{ fontFamily: MONO }}>
                Participant Type
              </span>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updateField("allowExternalParticipants", false)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    form.allowExternalParticipants === false
                      ? "border-blue-400 bg-blue-500/10"
                      : softButton
                  }`}
                >
                  <GraduationCap className="text-[#58A6FF] mb-2" size={20} />
                  <div className="font-bold">College-only</div>
                  <div className={`text-xs mt-1 ${muted}`}>Roll no + name</div>
                </button>

                <button
                  type="button"
                  onClick={() => updateField("allowExternalParticipants", true)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    form.allowExternalParticipants === true
                      ? "border-blue-400 bg-blue-500/10"
                      : softButton
                  }`}
                >
                  <Globe2 className="text-[#58A6FF] mb-2" size={20} />
                  <div className="font-bold">External/Public</div>
                  <div className={`text-xs mt-1 ${muted}`}>Name + email + phone</div>
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-500">
              {error}
            </div>
          )}

          {createdTest && (
            <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-4 text-sm text-emerald-500">
              Test created successfully:{" "}
              <span className="font-mono">{createdTest.testCode}</span>
            </div>
          )}

          <div className="mt-7 flex flex-col sm:flex-row sm:justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate("/faculty")}
              className={`h-12 px-6 rounded-xl border font-semibold transition ${softButton}`}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="h-12 px-7 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold transition flex items-center justify-center gap-2"
            >
              <Save size={17} />
              {loading ? "Creating..." : "Create Test"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}