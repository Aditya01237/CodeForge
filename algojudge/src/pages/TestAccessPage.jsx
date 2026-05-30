import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../api";

const MONO = "'JetBrains Mono', 'Fira Code', ui-monospace, monospace";

export default function TestAccessPage() {
  const navigate = useNavigate();

  const [testCode, setTestCode] = useState("");
  const [testPassword, setTestPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      // Current backend supports join by testCode.
      // Later backend can be changed to POST /api/tests/verify-access with password.
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
      setError(
        err.message ||
          "Invalid test ID or test is not active. Please check details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B12] text-white flex flex-col">
      <nav className="h-16 px-7 flex items-center justify-between border-b border-white/10 bg-[#0D1117]">
        <div className="text-xl font-bold text-[#58A6FF]" style={{ fontFamily: MONO }}>
          CodeForge
        </div>

        <button
          onClick={() => navigate("/")}
          className="text-sm text-gray-400 hover:text-white transition"
        >
          Practice Problems
        </button>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-5xl grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
          <section>
            <div
              className="text-xs uppercase tracking-[0.25em] text-[#58A6FF] mb-5"
              style={{ fontFamily: MONO }}
            >
              Secure Coding Test Access
            </div>

            <h1 className="text-5xl font-bold leading-tight mb-5">
              Enter your test and start coding.
            </h1>

            <p className="text-gray-400 text-lg leading-8 max-w-xl">
              Use the test ID and password shared by your faculty or organizer.
              College students can continue using roll number, while external
              participants can join using name/email.
            </p>

            <div className="mt-8 grid sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-2xl font-bold text-[#58A6FF]">01</div>
                <div className="text-sm text-gray-400 mt-1">Enter test ID</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-2xl font-bold text-[#58A6FF]">02</div>
                <div className="text-sm text-gray-400 mt-1">Verify identity</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-2xl font-bold text-[#58A6FF]">03</div>
                <div className="text-sm text-gray-400 mt-1">Start test</div>
              </div>
            </div>
          </section>

          <form
            onSubmit={handleContinue}
            className="rounded-3xl border border-white/10 bg-[#0D1117] shadow-2xl shadow-black/40 p-7"
          >
            <h2 className="text-2xl font-semibold mb-1">Join Coding Test</h2>
            <p className="text-sm text-gray-400 mb-6">
              Enter test credentials to continue.
            </p>

            <label className="block mb-4">
              <span className="text-xs uppercase tracking-widest text-gray-500 mb-2 block">
                Test ID
              </span>
              <input
                value={testCode}
                onChange={(e) => setTestCode(e.target.value.toUpperCase())}
                placeholder="ALGO-CT2"
                className="w-full h-12 rounded-xl bg-[#070B12] border border-white/10 px-4 outline-none focus:border-[#58A6FF] text-white"
                style={{ fontFamily: MONO }}
              />
            </label>

            <label className="block mb-5">
              <span className="text-xs uppercase tracking-widest text-gray-500 mb-2 block">
                Test Password
              </span>
              <input
                type="password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full h-12 rounded-xl bg-[#070B12] border border-white/10 px-4 outline-none focus:border-[#58A6FF] text-white"
              />
            </label>

            {error && (
              <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[#238BFF] hover:bg-[#1f7ae0] disabled:opacity-60 transition font-semibold"
            >
              {loading ? "Verifying..." : "Continue"}
            </button>

            <div className="mt-5 text-xs text-gray-500 leading-6">
              For now, password is stored in frontend and backend validates test
              ID. Later we will connect password validation to backend.
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}