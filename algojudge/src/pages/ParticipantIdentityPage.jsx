import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiPost } from "../api";
import {
  Home,
  Moon,
  Sun,
  GraduationCap,
  Mail,
  BadgeCheck,
  ArrowLeft,
  Phone,
  UserRound,
} from "lucide-react";

const MONO = "'JetBrains Mono', 'Fira Code', ui-monospace, monospace";

export default function ParticipantIdentityPage() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("cf_theme") || "dark";
  });

  const [test, setTest] = useState(null);

  // College-only fields
  const [rollNumber, setRollNumber] = useState("");
  const [studentName, setStudentName] = useState("");

  // External/public fields
  const [externalName, setExternalName] = useState("");
  const [externalEmail, setExternalEmail] = useState("");
  const [externalPhone, setExternalPhone] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isDark = theme === "dark";
  const isExternalTest = test?.allowExternalParticipants === true;

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

    try {
      const parsed = JSON.parse(raw);

      if (String(parsed.testId) !== String(testId)) {
        navigate("/test-access");
        return;
      }

      setTest(parsed);
    } catch {
      navigate("/test-access");
    }
  }, [testId, navigate]);

  const handleContinue = async (e) => {
    e.preventDefault();
    setError("");

    let participantPayload;

    if (isExternalTest) {
      if (!externalName.trim()) {
        setError("Please enter your name.");
        return;
      }

      if (!externalEmail.trim()) {
        setError("Please enter your email.");
        return;
      }

      if (!externalPhone.trim()) {
        setError("Please enter your phone number.");
        return;
      }

      participantPayload = {
        participantType: "EXTERNAL",
        rollNumber: "",
        name: externalName.trim(),
        email: externalEmail.trim(),
        // Backend does not have phone column yet.
        // So we store phone inside identifier for now.
        identifier: externalPhone.trim(),
      };
    } else {
      if (!rollNumber.trim()) {
        setError("Please enter your college roll number.");
        return;
      }

      if (!studentName.trim()) {
        setError("Please enter your name.");
        return;
      }

      participantPayload = {
        participantType: "STUDENT",
        rollNumber: rollNumber.trim().toUpperCase(),
        name: studentName.trim(),
        email: "",
        identifier: rollNumber.trim().toUpperCase(),
      };
    }

    setLoading(true);

    try {
      const participant = await apiPost(
        `/tests/${testId}/participants`,
        participantPayload
      );

      localStorage.setItem(
        "cf_participant",
        JSON.stringify({
          participantId: participant.participantId,
          participantType: participant.participantType,
          rollNumber: participant.rollNumber,
          name: participant.name,
          email: participant.email,
          identifier: participant.identifier,
          status: participant.status,
        })
      );

      localStorage.setItem(
        "cf_participant_id",
        String(participant.participantId)
      );

      navigate(`/test/${testId}/lobby`);
    } catch (err) {
      setError(err.message || "Failed to register participant.");
    } finally {
      setLoading(false);
    }
  };

  if (!test) {
    return (
      <div className="min-h-screen bg-[#070B12] text-white p-8">
        Loading...
      </div>
    );
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

  return (
    <div className={`min-h-screen ${pageClass}`}>
      <nav
        className={`h-16 px-6 flex items-center justify-between border-b ${navClass}`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/test-access")}
            className={`h-10 w-10 rounded-xl border flex items-center justify-center transition ${softButton}`}
            title="Back"
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
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className={`hidden sm:flex h-10 px-4 rounded-xl border items-center gap-2 text-sm font-semibold transition ${softButton}`}
          >
            <Home size={15} />
            Home
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

        <form
          onSubmit={handleContinue}
          className={`rounded-3xl border p-7 ${cardClass}`}
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-7">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-[#58A6FF] flex items-center justify-center">
                  {isExternalTest ? (
                    <UserRound size={24} />
                  ) : (
                    <GraduationCap size={24} />
                  )}
                </div>

                <div>
                  <h2 className="text-2xl font-bold">
                    {isExternalTest
                      ? "Participant Details"
                      : "Student Details"}
                  </h2>

                  <p className={`text-sm mt-1 ${muted}`}>
                    {isExternalTest
                      ? "Enter name, email, and phone to continue."
                      : "Enter roll number and name to continue."}
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                isDark
                  ? "border-white/10 bg-white/[0.03] text-slate-300"
                  : "border-slate-200 bg-slate-50 text-slate-700"
              }`}
            >
              Duration:{" "}
              <span className="font-semibold text-[#58A6FF]">
                {test.durationMinutes || 90} min
              </span>
            </div>
          </div>

          {isExternalTest ? (
            <div className="grid md:grid-cols-2 gap-4">
              <label>
                <span
                  className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2 block"
                  style={{ fontFamily: MONO }}
                >
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
                <span
                  className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2 block"
                  style={{ fontFamily: MONO }}
                >
                  Email
                </span>

                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    value={externalEmail}
                    onChange={(e) => setExternalEmail(e.target.value)}
                    placeholder="rahul@example.com"
                    className={`w-full h-12 rounded-xl border pl-11 pr-4 outline-none transition ${inputClass}`}
                  />
                </div>
              </label>

              <label className="md:col-span-2">
                <span
                  className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2 block"
                  style={{ fontFamily: MONO }}
                >
                  Phone
                </span>

                <div className="relative">
                  <Phone
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <input
                    value={externalPhone}
                    onChange={(e) => setExternalPhone(e.target.value)}
                    placeholder="9876543210"
                    className={`w-full h-12 rounded-xl border pl-11 pr-4 outline-none transition ${inputClass}`}
                  />
                </div>
              </label>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              <label>
                <span
                  className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2 block"
                  style={{ fontFamily: MONO }}
                >
                  College Roll No.
                </span>

                <input
                  value={rollNumber}
                  onChange={(e) =>
                    setRollNumber(e.target.value.toUpperCase())
                  }
                  placeholder="MT2025015"
                  className={`w-full h-12 rounded-xl border px-4 outline-none transition ${inputClass}`}
                  style={{ fontFamily: MONO }}
                />
              </label>

              <label>
                <span
                  className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2 block"
                  style={{ fontFamily: MONO }}
                >
                  Name
                </span>

                <input
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Aditya Pareek"
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

          <div className="mt-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate("/test-access")}
              className={`h-12 px-6 rounded-xl border font-semibold transition ${softButton}`}
            >
              Change Test
            </button>

            <button
              type="submit"
              disabled={loading}
              className="h-12 px-7 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold transition flex items-center justify-center gap-2"
            >
              <BadgeCheck size={17} />
              {loading ? "Registering..." : "Continue to Lobby"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}