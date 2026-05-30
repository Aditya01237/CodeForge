import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet } from "../api";
import {
  Home,
  Moon,
  Sun,
  Clock,
  Code2,
  UserRound,
  PlayCircle,
  Mail,
  Phone,
  GraduationCap,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

const MONO = "'JetBrains Mono', 'Fira Code', ui-monospace, monospace";

export default function TestLobbyPage() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("cf_theme") || "dark";
  });

  const [test, setTest] = useState(null);
  const [participant, setParticipant] = useState(null);
  const [problems, setProblems] = useState([]);
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

    try {
      const parsedTest = JSON.parse(testRaw);
      const parsedParticipant = JSON.parse(participantRaw);

      if (String(parsedTest.testId) !== String(testId)) {
        navigate("/test-access");
        return;
      }

      setTest(parsedTest);
      setParticipant(parsedParticipant);
    } catch {
      navigate("/test-access");
      return;
    }

    apiGet(`/tests/${testId}/problems`)
      .then((data) => setProblems(Array.isArray(data) ? data : []))
      .catch(() => setError("Failed to load test problems."));
  }, [testId, navigate]);

  if (!test || !participant) {
    return (
      <div className="min-h-screen bg-[#070B12] text-white p-8">
        Loading lobby...
      </div>
    );
  }

  const isExternal = participant.participantType === "EXTERNAL";

  const participantName = isExternal
    ? participant.name
    : participant.name || participant.rollNumber;

  const pageClass = isDark
    ? "bg-[#070B12] text-white"
    : "bg-[#F8FAFC] text-slate-950";

  const navClass = isDark
    ? "bg-[#0D1117] border-white/10"
    : "bg-white border-slate-200";

  const cardClass = isDark
    ? "bg-[#111827] border-white/10"
    : "bg-white border-slate-200 shadow-sm";

  const softButton = isDark
    ? "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100";

  const muted = isDark ? "text-slate-400" : "text-slate-600";

  const sidePanel = isDark
    ? "border-white/10 bg-[#090D14]"
    : "border-slate-200 bg-slate-50";

  const ruleCard = isDark
    ? "border-white/10 bg-white/[0.03]"
    : "border-slate-200 bg-white";

  return (
    <div className={`min-h-screen ${pageClass}`}>
      {/* NAVBAR */}
      <nav
        className={`h-16 px-6 flex items-center justify-between border-b ${navClass}`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/test/${testId}/identity`)}
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

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className={`rounded-3xl border overflow-hidden ${cardClass}`}>
          {/* HEADER */}
          <div
            className={`p-8 border-b ${
              isDark ? "border-white/10" : "border-slate-200"
            }`}
          >
            <div
              className="text-xs uppercase tracking-[0.25em] text-[#58A6FF] mb-3"
              style={{ fontFamily: MONO }}
            >
              Test Lobby
            </div>

            <h1 className="text-4xl font-black mb-3">{test.title}</h1>

            <p className={`max-w-2xl leading-7 mb-5 ${muted}`}>
              Review the test rules and your participant details before
              starting. Once you start, you will be taken to the problem list.
            </p>

            <div className="flex flex-wrap gap-3 text-sm">
              <span className={`px-3 py-1 rounded-full border ${softButton}`}>
                Test ID:{" "}
                <span className="font-mono text-[#58A6FF]">
                  {test.testCode}
                </span>
              </span>

              <span className={`px-3 py-1 rounded-full border ${softButton}`}>
                Duration: {test.durationMinutes || 90} min
              </span>

              <span className={`px-3 py-1 rounded-full border ${softButton}`}>
                Problems: {problems.length}
              </span>

              <span className={`px-3 py-1 rounded-full border ${softButton}`}>
                Languages: C++, Python, Java
              </span>

              <span className={`px-3 py-1 rounded-full border ${softButton}`}>
                Type: {isExternal ? "External/Public" : "College-only"}
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_380px]">
            {/* RULES */}
            <section className="p-8">
              <h2 className="text-2xl font-bold mb-5">
                Rules before starting
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  {
                    icon: <Code2 size={18} />,
                    title: "Run vs Submit",
                    desc: "Run checks sample cases. Submit evaluates hidden test cases.",
                  },
                  {
                    icon: <ShieldCheck size={18} />,
                    title: "Hidden Tests",
                    desc: "Final result depends on hidden test cases, not only samples.",
                  },
                  {
                    icon: <Clock size={18} />,
                    title: "Timer",
                    desc: "Complete the test within the given duration.",
                  },
                  {
                    icon: <UserRound size={18} />,
                    title: "Identity",
                    desc: "Your submissions will be mapped to the details shown here.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className={`rounded-2xl border p-5 ${ruleCard}`}
                  >
                    <div className="text-[#58A6FF] mb-3">{item.icon}</div>
                    <div className="font-bold mb-1">{item.title}</div>
                    <div className={`text-sm leading-6 ${muted}`}>
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-7 space-y-3">
                {[
                  "Do not refresh or close the test page during the test.",
                  "Java submissions must use public class Main.",
                  "Do not share your test credentials with others.",
                  "Only your latest/best submission will be considered later based on faculty policy.",
                ].map((rule) => (
                  <div key={rule} className={`flex gap-3 ${muted}`}>
                    <span className="text-[#58A6FF]">›</span>
                    <span>{rule}</span>
                  </div>
                ))}
              </div>

              {error && (
                <div className="mt-6 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-500">
                  {error}
                </div>
              )}
            </section>

            {/* SUMMARY */}
            <aside className={`p-8 border-l ${sidePanel}`}>
              <h2 className="text-xl font-bold mb-5">Test Summary</h2>

              <div className="space-y-5 text-sm">
                <div className="flex items-start gap-3">
                  {isExternal ? (
                    <UserRound className="text-[#58A6FF] mt-0.5" size={18} />
                  ) : (
                    <GraduationCap
                      className="text-[#58A6FF] mt-0.5"
                      size={18}
                    />
                  )}

                  <div>
                    <div className="text-slate-500 uppercase text-xs tracking-widest">
                      Participant
                    </div>
                    <div className="font-semibold mt-1">
                      {participantName || "Participant"}
                    </div>
                  </div>
                </div>

                {!isExternal && (
                  <div className="flex items-start gap-3">
                    <GraduationCap
                      className="text-[#58A6FF] mt-0.5"
                      size={18}
                    />

                    <div>
                      <div className="text-slate-500 uppercase text-xs tracking-widest">
                        Roll Number
                      </div>
                      <div className="font-mono font-semibold mt-1">
                        {participant.rollNumber}
                      </div>
                    </div>
                  </div>
                )}

                {isExternal && (
                  <>
                    <div className="flex items-start gap-3">
                      <Mail className="text-[#58A6FF] mt-0.5" size={18} />

                      <div>
                        <div className="text-slate-500 uppercase text-xs tracking-widest">
                          Email
                        </div>
                        <div className="font-semibold mt-1 break-all">
                          {participant.email || "—"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="text-[#58A6FF] mt-0.5" size={18} />

                      <div>
                        <div className="text-slate-500 uppercase text-xs tracking-widest">
                          Phone
                        </div>
                        <div className="font-semibold mt-1">
                          {participant.identifier || "—"}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex items-start gap-3">
                  <Clock className="text-[#58A6FF] mt-0.5" size={18} />

                  <div>
                    <div className="text-slate-500 uppercase text-xs tracking-widest">
                      Duration
                    </div>
                    <div className="font-semibold mt-1">
                      {test.durationMinutes || 90} minutes
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Code2 className="text-[#58A6FF] mt-0.5" size={18} />

                  <div>
                    <div className="text-slate-500 uppercase text-xs tracking-widest">
                      Problems
                    </div>
                    <div className="font-semibold mt-1">
                      {problems.length}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate(`/test/${testId}/problems`)}
                className="mt-8 w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition flex items-center justify-center gap-2"
              >
                <PlayCircle size={18} />
                Start Test
              </button>

              <button
                onClick={() => navigate(`/test/${testId}/identity`)}
                className={`mt-3 w-full h-11 rounded-xl border font-semibold transition ${softButton}`}
              >
                Edit Details
              </button>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}