import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Home, Moon, Sun, UserRound, GraduationCap, Mail, BadgeCheck } from "lucide-react";

const MONO = "'JetBrains Mono', 'Fira Code', ui-monospace, monospace";

export default function ParticipantIdentityPage() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => localStorage.getItem("cf_theme") || "dark");
  const [test, setTest] = useState(null);
  const [type, setType] = useState("STUDENT");

  const [rollNumber, setRollNumber] = useState("");
  const [studentName, setStudentName] = useState("");

  const [externalName, setExternalName] = useState("");
  const [externalEmail, setExternalEmail] = useState("");
  const [externalId, setExternalId] = useState("");

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

  useEffect(() => {
    const raw = localStorage.getItem("cf_test_access");

    if (!raw) {
      navigate("/test-access");
      return;
    }

    const parsed = JSON.parse(raw);

    if (String(parsed.testId) !== String(testId)) {
      navigate("/test-access");
      return;
    }

    setTest(parsed);
  }, [testId, navigate]);

  const handleContinue = (e) => {
    e.preventDefault();
    setError("");

    let participant;

    if (type === "STUDENT") {
      if (!rollNumber.trim()) {
        setError("Please enter your college roll number.");
        return;
      }

      participant = {
        participantType: "STUDENT",
        rollNumber: rollNumber.trim(),
        name: studentName.trim(),
        email: "",
        identifier: rollNumber.trim(),
      };
    } else {
      if (!externalName.trim()) {
        setError("Please enter your name.");
        return;
      }

      participant = {
        participantType: "EXTERNAL",
        rollNumber: "",
        name: externalName.trim(),
        email: externalEmail.trim(),
        identifier: externalId.trim() || externalEmail.trim() || externalName.trim(),
      };
    }

    localStorage.setItem("cf_participant", JSON.stringify(participant));
    navigate(`/test/${testId}/lobby`);
  };

  if (!test) {
    return <div className="min-h-screen bg-[#070B12] text-white p-8">Loading...</div>;
  }

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

  const typeCard = (active) =>
    active
      ? "border-blue-400 bg-blue-500/10"
      : isDark
        ? "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
        : "border-slate-200 bg-white hover:bg-slate-50";

  return (
    <div className={`min-h-screen ${pageClass}`}>
      <nav className={`h-16 px-6 flex items-center justify-between border-b ${navClass}`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/test-access")}
            className={`h-10 w-10 rounded-xl border flex items-center justify-center transition ${softButton}`}
          >
            <Home size={17} />
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
            Participant Identity
          </div>

          <h1 className="text-4xl font-black mb-2">{test.title}</h1>

          <p className={muted}>
            Test ID:{" "}
            <span className="font-mono text-[#58A6FF]">{test.testCode}</span>
          </p>
        </div>

        <form onSubmit={handleContinue} className={`rounded-3xl border p-7 ${cardClass}`}>
          <h2 className="text-2xl font-bold mb-5">Who is giving this test?</h2>

          <div className="grid md:grid-cols-2 gap-4 mb-7">
            <button
              type="button"
              onClick={() => setType("STUDENT")}
              className={`text-left rounded-2xl border p-5 transition ${typeCard(type === "STUDENT")}`}
            >
              <GraduationCap className="text-[#58A6FF] mb-4" size={26} />
              <div className="font-bold text-lg mb-1">College Student</div>
              <div className={`text-sm leading-6 ${muted}`}>
                Use college roll number for attendance and result tracking.
              </div>
            </button>

            <button
              type="button"
              onClick={() => setType("EXTERNAL")}
              className={`text-left rounded-2xl border p-5 transition ${typeCard(type === "EXTERNAL")}`}
            >
              <UserRound className="text-[#58A6FF] mb-4" size={26} />
              <div className="font-bold text-lg mb-1">External Participant</div>
              <div className={`text-sm leading-6 ${muted}`}>
                Use name/email for public contests or mock assessments.
              </div>
            </button>
          </div>

          {type === "STUDENT" ? (
            <div className="grid md:grid-cols-2 gap-4">
              <label>
                <span className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2 block" style={{ fontFamily: MONO }}>
                  College Roll No.
                </span>
                <input
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                  placeholder="MT2025015"
                  className={`w-full h-12 rounded-xl border px-4 outline-none transition ${inputClass}`}
                  style={{ fontFamily: MONO }}
                />
              </label>

              <label>
                <span className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2 block" style={{ fontFamily: MONO }}>
                  Name Optional
                </span>
                <input
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Aditya Pareek"
                  className={`w-full h-12 rounded-xl border px-4 outline-none transition ${inputClass}`}
                />
              </label>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              <label>
                <span className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2 block" style={{ fontFamily: MONO }}>
                  Name
                </span>
                <input
                  value={externalName}
                  onChange={(e) => setExternalName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className={`w-full h-12 rounded-xl border px-4 outline-none transition ${inputClass}`}
                />
              </label>

              <label>
                <span className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2 block" style={{ fontFamily: MONO }}>
                  Email Optional
                </span>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    value={externalEmail}
                    onChange={(e) => setExternalEmail(e.target.value)}
                    placeholder="rahul@example.com"
                    className={`w-full h-12 rounded-xl border pl-11 pr-4 outline-none transition ${inputClass}`}
                  />
                </div>
              </label>

              <label className="md:col-span-2">
                <span className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2 block" style={{ fontFamily: MONO }}>
                  Custom Identifier Optional
                </span>
                <input
                  value={externalId}
                  onChange={(e) => setExternalId(e.target.value)}
                  placeholder="company-id / phone / custom-id"
                  className={`w-full h-12 rounded-xl border px-4 outline-none transition ${inputClass}`}
                />
              </label>
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-500">
              {error}
            </div>
          )}

          <div className="mt-7 flex justify-end">
            <button
              type="submit"
              className="h-12 px-7 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition flex items-center gap-2"
            >
              <BadgeCheck size={17} />
              Continue to Lobby
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}