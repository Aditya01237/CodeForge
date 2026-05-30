import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet } from "../api";

const MONO = "'JetBrains Mono', 'Fira Code', ui-monospace, monospace";

export default function TestLobbyPage() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [participant, setParticipant] = useState(null);
  const [problems, setProblems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const testRaw = localStorage.getItem("cf_test_access");
    const participantRaw = localStorage.getItem("cf_participant");

    if (!testRaw) {
      navigate("/test-access");
      return;
    }

    if (!participantRaw) {
      navigate(`/test/${testId}/identity`);
      return;
    }

    setTest(JSON.parse(testRaw));
    setParticipant(JSON.parse(participantRaw));

    apiGet(`/tests/${testId}/problems`)
      .then(setProblems)
      .catch((err) => setError(err.message || "Failed to load test problems"));
  }, [testId, navigate]);

  if (!test || !participant) {
    return (
      <div className="min-h-screen bg-[#070B12] text-white p-8">
        Loading lobby...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070B12] text-white">
      <nav className="h-16 px-7 flex items-center justify-between border-b border-white/10 bg-[#0D1117]">
        <div className="text-xl font-bold text-[#58A6FF]" style={{ fontFamily: MONO }}>
          CodeForge
        </div>

        <div className="text-sm text-gray-400">
          {participant.participantType === "STUDENT"
            ? participant.rollNumber
            : participant.name}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="rounded-3xl border border-white/10 bg-[#0D1117] overflow-hidden">
          <div className="p-7 border-b border-white/10">
            <div className="text-xs uppercase tracking-[0.25em] text-[#58A6FF] mb-3">
              Test Lobby
            </div>

            <h1 className="text-4xl font-bold mb-3">{test.title}</h1>

            <div className="flex flex-wrap gap-3 text-sm">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                Test ID: <span className="font-mono">{test.testCode}</span>
              </span>

              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                Duration: {test.durationMinutes || 90} min
              </span>

              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                Problems: {problems.length}
              </span>

              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                Languages: C++, Python, Java
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_360px] gap-0">
            <section className="p-7">
              <h2 className="text-xl font-semibold mb-4">Rules</h2>

              <div className="space-y-3 text-gray-300">
                <div className="flex gap-3">
                  <span className="text-[#58A6FF]">›</span>
                  <span>Use Run to test your code on sample test cases.</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#58A6FF]">›</span>
                  <span>Submit will be evaluated on hidden test cases.</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#58A6FF]">›</span>
                  <span>Java submissions must use public class Main.</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#58A6FF]">›</span>
                  <span>Do not refresh or close the test window during test.</span>
                </div>
              </div>

              {error && (
                <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}
            </section>

            <aside className="p-7 bg-[#090D14] border-l border-white/10">
              <h2 className="text-xl font-semibold mb-4">Participant</h2>

              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-500 uppercase text-xs tracking-widest">
                    Type
                  </div>
                  <div>{participant.participantType}</div>
                </div>

                {participant.rollNumber && (
                  <div>
                    <div className="text-gray-500 uppercase text-xs tracking-widest">
                      Roll Number
                    </div>
                    <div className="font-mono">{participant.rollNumber}</div>
                  </div>
                )}

                {participant.name && (
                  <div>
                    <div className="text-gray-500 uppercase text-xs tracking-widest">
                      Name
                    </div>
                    <div>{participant.name}</div>
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate(`/test/${testId}/problems`)}
                className="mt-8 w-full h-12 rounded-xl bg-[#238BFF] hover:bg-[#1f7ae0] transition font-semibold"
              >
                Start Test
              </button>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}