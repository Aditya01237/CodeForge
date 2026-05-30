import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet } from "../api";

const MONO = "'JetBrains Mono', 'Fira Code', ui-monospace, monospace";

export default function TestProblemsPage() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [participant, setParticipant] = useState(null);
  const [testProblems, setTestProblems] = useState([]);
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
      .then(setTestProblems)
      .catch((err) => setError(err.message || "Failed to load problems"));
  }, [testId, navigate]);

  if (!test || !participant) {
    return (
      <div className="min-h-screen bg-[#070B12] text-white p-8">
        Loading test...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070B12] text-white">
      <nav className="h-16 px-7 flex items-center justify-between border-b border-white/10 bg-[#0D1117]">
        <div className="flex items-center gap-6">
          <div className="text-xl font-bold text-[#58A6FF]" style={{ fontFamily: MONO }}>
            CodeForge
          </div>

          <div className="hidden md:block text-sm text-gray-400">
            {test.title}
          </div>
        </div>

        <div className="text-sm text-gray-400">
          {participant.participantType === "STUDENT"
            ? participant.rollNumber
            : participant.name}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-9">
        <div className="mb-7 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-[#58A6FF] mb-3">
              Coding Test
            </div>
            <h1 className="text-4xl font-bold">{test.title}</h1>
            <p className="text-gray-400 mt-2">
              Solve all assigned problems. Submissions will be checked on hidden test cases.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0D1117] px-5 py-3">
            <div className="text-xs text-gray-500 uppercase tracking-widest">
              Duration
            </div>
            <div className="text-xl font-bold text-[#58A6FF]">
              {test.durationMinutes || 90} min
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="rounded-3xl border border-white/10 bg-[#0D1117] overflow-hidden">
          <div className="grid grid-cols-[70px_1fr_120px_120px] px-5 py-4 text-xs uppercase tracking-widest text-gray-500 border-b border-white/10">
            <span>#</span>
            <span>Problem</span>
            <span>Difficulty</span>
            <span>Action</span>
          </div>

          {testProblems.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              No problems attached to this test.
            </div>
          ) : (
            testProblems.map((item, index) => {
              const problem = item.problem;

              return (
                <div
                  key={item.id}
                  className="grid grid-cols-[70px_1fr_120px_120px] px-5 py-4 items-center border-b border-white/5 hover:bg-white/[0.03] transition"
                >
                  <span className="font-mono text-gray-500">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div>
                    <div className="font-semibold">{problem?.title}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Problem ID: {problem?.id}
                    </div>
                  </div>

                  <span className="text-sm text-[#58A6FF]">
                    {problem?.difficulty || "—"}
                  </span>

                  <button
                    onClick={() =>
                      navigate(`/problem/${problem.id}?mode=test&testId=${testId}`)
                    }
                    className="h-9 rounded-lg bg-[#238BFF] hover:bg-[#1f7ae0] transition text-sm font-semibold"
                  >
                    Solve
                  </button>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}