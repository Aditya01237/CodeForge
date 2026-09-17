import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import ProblemPage from "./pages/ProblemPage";
import ProblemsPage from "./pages/ProblemsPage";

import TestAccessPage from "./pages/TestAccessPage";
import ParticipantIdentityPage from "./pages/ParticipantIdentityPage";
import TestLobbyPage from "./pages/TestLobbyPage";
import TestProblemsPage from "./pages/TestProblemsPage";

import FacultyDashboard from "./pages/FacultyDashboard";
import FacultyCreateTestPage from "./pages/FacultyCreateTestPage";
import FacultyManageTestPage from "./pages/FacultyManageTestPage";
import FacultyResultsPage from "./pages/FacultyResultsPage";
import LiveLeaderboardPage from "./pages/LiveLeaderboardPage";
import InterviewHubPage from "./pages/InterviewHubPage";
import InterviewRoomPage from "./pages/InterviewRoomPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Student / Public */}
        <Route path="/" element={<Dashboard />} />

        <Route path="/practice" element={<ProblemsPage />} />
        <Route path="/problems" element={<ProblemsPage />} />

        <Route path="/problem/:id" element={<ProblemPage />} />
        <Route path="/problems/:id" element={<ProblemPage />} />

        <Route path="/test-access" element={<TestAccessPage />} />
        <Route
          path="/test/:testId/identity"
          element={<ParticipantIdentityPage />}
        />
        <Route path="/test/:testId/lobby" element={<TestLobbyPage />} />
        <Route path="/test/:testId/problems" element={<TestProblemsPage />} />
        <Route
          path="/test/:testId/leaderboard"
          element={<LiveLeaderboardPage />}
        />

        {/* Interview practice */}
        <Route path="/interview" element={<InterviewHubPage />} />
        <Route
          path="/interview/room/:roomCode"
          element={<InterviewRoomPage />}
        />

        {/* Faculty */}
        <Route path="/faculty" element={<FacultyDashboard />} />
        <Route path="/faculty/tests/create" element={<FacultyCreateTestPage />} />

        <Route
          path="/faculty/tests/:testId/problems"
          element={<FacultyManageTestPage />}
        />

        <Route
          path="/faculty/tests/:testId/manage"
          element={<FacultyManageTestPage />}
        />

        <Route
          path="/faculty/tests/:testId/results"
          element={<FacultyResultsPage />}
        />
        <Route
          path="/faculty/tests/:testId/live"
          element={<LiveLeaderboardPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
