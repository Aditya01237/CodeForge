import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../api";
import { ArrowRight, KeyRound, Lock, ShieldCheck, Home, Sun, Moon } from "lucide-react";

const MONO = "'JetBrains Mono', 'Fira Code', ui-monospace, monospace";

export default function TestAccessPage() {
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => localStorage.getItem("cf_theme") || "dark");
  const [testCode, setTestCode] = useState("");
  const [testPassword, setTestPassword] = useState("");
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

  const handleContinue = async (e) => {
    e.preventDefault();
    setError("");

    if (!testCode.trim()) {
      setError("Please enter test ID.");
      return;
    }

    if (!testPassword.trim()) {
      setError("Please enter test password.");
      return;
    }

    setLoading(true);

    try {
      // Current backend validates only testCode.
      // Later we will replace this with POST /api/tests/verify-access.
      const test = await apiGet(`/tests/join/${testCode.trim()}`);

      localStorage.setItem(
        "cf_test_access",
        JSON.stringify({
          testId: test.id,
          testCode: test.testCode,
          testPassword,
          title: test.title,
          durationMinutes: test.durationMinutes,
          startTime: test.startTime,
          endTime: test.endTime,
        })
      );

      navigate(`/test/${test.id}/identity`);
    } catch (err) {
      setError("Invalid test ID, or the test is not active yet.");
    } finally {
      setLoading(false);
    }
  };

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

  const muted = isDark ? "text-slate-400" : "text-slate-600";

  const softButton = isDark
    ? "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100";

  return (
    <div className={`min-h-screen ${pageClass}`}>
      <nav className={`h-16 px-6 flex items-center justify-between border-b ${navClass}`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className={`h-10 w-10 rounded-xl border flex items-center justify-center transition ${softButton}`}
          >
            <Home size={17} />
          </button>

          <button
            onClick={() => navigate("/")}
            className="text-xl font-bold text-[#58A6FF]"
            style={{ fontFamily: MONO }}
          >
            CodeForge
          </button>
        </div>

        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className={`h-10 px-4 rounded-xl border flex items-center gap-2 text-sm font-semibold transition ${softButton}`}
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
          {isDark ? "Light" : "Dark"}
        </button>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8 items-center">
          <section>
            <div
              className="text-xs uppercase tracking-[0.25em] text-[#58A6FF] mb-5"
              style={{ fontFamily: MONO }}
            >
              Secure Test Entry
            </div>

            <h1 className="text-5xl lg:text-6xl font-black leading-tight mb-5">
              Join your coding test.
              <br />
              <span className="text-[#58A6FF]">No signup needed.</span>
            </h1>

            <p className={`text-lg leading-8 max-w-2xl ${muted}`}>
              Enter the test ID and password shared by faculty. College students
              continue with roll number, while external participants can use
              name or email.
            </p>

            <div className="grid sm:grid-cols-3 gap-4 mt-8">
              {[
                ["01", "Enter test ID"],
                ["02", "Verify identity"],
                ["03", "Start test"],
              ].map(([num, label]) => (
                <div key={num} className={`rounded-2xl border p-5 ${cardClass}`}>
                  <div className="text-2xl font-bold text-[#58A6FF]">{num}</div>
                  <div className={`text-sm mt-2 ${muted}`}>{label}</div>
                </div>
              ))}
            </div>
          </section>

          <form onSubmit={handleContinue} className={`rounded-3xl border p-7 ${cardClass}`}>
            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-[#58A6FF] flex items-center justify-center mb-5">
              <ShieldCheck size={24} />
            </div>

            <h2 className="text-3xl font-bold mb-2">Enter Test</h2>
            <p className={`text-sm leading-6 mb-6 ${muted}`}>
              Use credentials given by your faculty or organizer.
            </p>

            <label className="block mb-4">
              <span
                className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2 block"
                style={{ fontFamily: MONO }}
              >
                Test ID
              </span>

              <div className="relative">
                <KeyRound size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  value={testCode}
                  onChange={(e) => setTestCode(e.target.value.toUpperCase())}
                  placeholder="ALGO-CT2"
                  className={`w-full h-12 rounded-xl border pl-11 pr-4 outline-none transition ${inputClass}`}
                  style={{ fontFamily: MONO }}
                />
              </div>
            </label>

            <label className="block mb-5">
              <span
                className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2 block"
                style={{ fontFamily: MONO }}
              >
                Test Password
              </span>

              <div className="relative">
                <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  placeholder="Enter password"
                  className={`w-full h-12 rounded-xl border pl-11 pr-4 outline-none transition ${inputClass}`}
                />
              </div>
            </label>

            {error && (
              <div className="mb-4 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-500">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold transition flex items-center justify-center gap-2"
            >
              {loading ? "Verifying..." : "Continue"}
              {!loading && <ArrowRight size={17} />}
            </button>

            <p className="text-xs text-slate-500 mt-4 leading-5">
              For now password is stored for the flow. Backend password
              validation will be added next.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}