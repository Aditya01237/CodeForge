import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ProblemPage from "./pages/ProblemPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/problem/:id" element={<ProblemPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;