import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../api";

export default function ProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet("/problems")
      .then(setProblems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-black text-white p-8">Loading problems...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-black text-red-400 p-8">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Problems</h1>

      <div className="space-y-3">
        {problems.map((problem) => (
          <Link
            key={problem.id}
            to={`/problems/${problem.id}`}
            className="block border border-[#2A2F3A] rounded-xl p-4 bg-[#111] hover:bg-[#171717]"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{problem.title}</h2>
                <p className="text-sm text-gray-400">{problem.difficulty}</p>
              </div>

              <span className="text-blue-400 text-sm">Solve →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}