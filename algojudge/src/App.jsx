import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import ProblemPage from "./pages/ProblemPage";
import TestAccessPage from "./pages/TestAccessPage";
import ParticipantIdentityPage from "./pages/ParticipantIdentityPage";
import TestLobbyPage from "./pages/TestLobbyPage";
import TestProblemsPage from "./pages/TestProblemsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />

        {/* Practice problem route */}
        <Route path="/problem/:id" element={<ProblemPage />} />
        <Route path="/problems/:id" element={<ProblemPage />} />

        {/* Test access flow */}
        <Route path="/test-access" element={<TestAccessPage />} />
        <Route path="/test/:testId/identity" element={<ParticipantIdentityPage />} />
        <Route path="/test/:testId/lobby" element={<TestLobbyPage />} />
        <Route path="/test/:testId/problems" element={<TestProblemsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;