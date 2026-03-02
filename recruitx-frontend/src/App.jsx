import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";

import Landing from "./pages/Landing";
import Login from "./auth/Login";
import Register from "./auth/Register";

import StudentDashboard from "./dashboards/StudentDashboard";
import StudentJobs from "./dashboards/StudentJobs";
import PlacementDashboard from "./dashboards/PlacementDashboard";
import CompanyDashboard from "./dashboards/CompanyDashboard";
import PlacementCreateJob from "./dashboards/PlacementCreateJob";

import PlacementApplicants from "./dashboards/PlacementApplicants";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* LANDING */}
          <Route path="/" element={<Landing />} />

          {/* AUTH */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* STUDENT */}
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/jobs" element={<StudentJobs />} />

          {/* PLACEMENT */}
          <Route path="/placement" element={<PlacementDashboard />} />

          {/* COMPANY */}
          <Route path="/company" element={<CompanyDashboard />} />

          <Route path="/placement/create" element={<PlacementCreateJob />} />

          <Route path="/placement/applicants/:jobId" element={<PlacementApplicants />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
