import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const MONO = "'JetBrains Mono', 'Fira Code', ui-monospace, monospace";

export default function ParticipantIdentityPage() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [type, setType] = useState("STUDENT");

  const [rollNumber, setRollNumber] = useState("");
  const [studentName, setStudentName] = useState("");

  const [externalName, setExternalName] = useState("");
  const [externalEmail, setExternalEmail] = useState("");
  const [externalId, setExternalId] = useState("");

  const [error, setError] = useState("");

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

  const handleStart = (e) => {
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
        name: studentName.trim() || "",
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
    return (
      <div className="min-h-screen bg-[#070B12] text-white p-8">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070B12] text-white">
      <nav className="h-16 px-7 flex items-center justify-between border-b border-white/10 bg-[#0D1117]">
        <div className="text-xl font-bold text-[#58A6FF]" style={{ fontFamily: MONO }}>
          CodeForge
        </div>

        <button
          onClick={() => navigate("/test-access")}
          className="text-sm text-gray-400 hover:text-white transition"
        >
          Change Test
        </button>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-[0.25em] text-[#58A6FF] mb-3">
            Participant Identity
          </div>
          <h1 className="text-4xl font-bold mb-2">{test.title}</h1>
          <p className="text-gray-400">
            Test ID: <span className="text-white font-mono">{test.testCode}</span>
          </p>
        </div>

        <form
          onSubmit={handleStart}
          className="rounded-3xl border border-white/10 bg-[#0D1117] p-7"
        >
          <h2 className="text-2xl font-semibold mb-5">Who is giving this test?</h2>

          <div className="grid md:grid-cols-2 gap-4 mb-7">
            <button
              type="button"
              onClick={() => setType("STUDENT")}
              className={`text-left rounded-2xl border p-5 transition ${
                type === "STUDENT"
                  ? "border-[#58A6FF] bg-[#58A6FF]/10"
                  : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
              }`}
            >
              <div className="font-semibold text-lg mb-1">College Student</div>
              <div className="text-sm text-gray-400">
                Use college roll number for test tracking.
              </div>
            </button>

            <button
              type="button"
              onClick={() => setType("EXTERNAL")}
              className={`text-left rounded-2xl border p-5 transition ${
                type === "EXTERNAL"
                  ? "border-[#58A6FF] bg-[#58A6FF]/10"
                  : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
              }`}
            >
              <div className="font-semibold text-lg mb-1">External Participant</div>
              <div className="text-sm text-gray-400">
                Use name/email for public or external tests.
              </div>
            </button>
          </div>

          {type === "STUDENT" ? (
            <div className="grid md:grid-cols-2 gap-4">
              <label>
                <span className="text-xs uppercase tracking-widest text-gray-500 mb-2 block">
                  College Roll No.
                </span>
                <input
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                  placeholder="MT2025015"
                  className="w-full h-12 rounded-xl bg-[#070B12] border border-white/10 px-4 outline-none focus:border-[#58A6FF]"
                  style={{ fontFamily: MONO }}
                />
              </label>

              <label>
                <span className="text-xs uppercase tracking-widest text-gray-500 mb-2 block">
                  Name Optional
                </span>
                <input
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Aditya Pareek"
                  className="w-full h-12 rounded-xl bg-[#070B12] border border-white/10 px-4 outline-none focus:border-[#58A6FF]"
                />
              </label>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              <label>
                <span className="text-xs uppercase tracking-widest text-gray-500 mb-2 block">
                  Name
                </span>
                <input
                  value={externalName}
                  onChange={(e) => setExternalName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="w-full h-12 rounded-xl bg-[#070B12] border border-white/10 px-4 outline-none focus:border-[#58A6FF]"
                />
              </label>

              <label>
                <span className="text-xs uppercase tracking-widest text-gray-500 mb-2 block">
                  Email Optional
                </span>
                <input
                  value={externalEmail}
                  onChange={(e) => setExternalEmail(e.target.value)}
                  placeholder="rahul@example.com"
                  className="w-full h-12 rounded-xl bg-[#070B12] border border-white/10 px-4 outline-none focus:border-[#58A6FF]"
                />
              </label>

              <label className="md:col-span-2">
                <span className="text-xs uppercase tracking-widest text-gray-500 mb-2 block">
                  Custom Identifier Optional
                </span>
                <input
                  value={externalId}
                  onChange={(e) => setExternalId(e.target.value)}
                  placeholder="company-id / phone / custom-id"
                  className="w-full h-12 rounded-xl bg-[#070B12] border border-white/10 px-4 outline-none focus:border-[#58A6FF]"
                />
              </label>
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="mt-7 flex justify-end">
            <button
              type="submit"
              className="h-12 px-8 rounded-xl bg-[#238BFF] hover:bg-[#1f7ae0] transition font-semibold"
            >
              Continue to Lobby
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}