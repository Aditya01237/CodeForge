import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import ProblemPage from "./pages/ProblemPage";

import TestAccessPage from "./pages/TestAccessPage";
import ParticipantIdentityPage from "./pages/ParticipantIdentityPage";
import TestLobbyPage from "./pages/TestLobbyPage";
import TestProblemsPage from "./pages/TestProblemsPage";

import FacultyDashboard from "./pages/FacultyDashboard";
import FacultyCreateTestPage from "./pages/FacultyCreateTestPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />

        <Route path="/problem/:id" element={<ProblemPage />} />
        <Route path="/problems/:id" element={<ProblemPage />} />

        <Route path="/test-access" element={<TestAccessPage />} />
        <Route path="/test/:testId/identity" element={<ParticipantIdentityPage />} />
        <Route path="/test/:testId/lobby" element={<TestLobbyPage />} />
        <Route path="/test/:testId/problems" element={<TestProblemsPage />} />

        <Route path="/faculty" element={<FacultyDashboard />} />
        <Route path="/faculty/tests/create" element={<FacultyCreateTestPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;