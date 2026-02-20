import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainQueryDashboardPage from "../features/internal-reports/pages/MainQueryDashboardPage";
import OpenEdxPage from "../features/internal-reports/pages/OpenEdxPage";
import CourseDetailsPage from "../features/internal-reports/pages/CourseDetailsPage";
import CourseGradesPage from "../features/internal-reports/pages/CourseGradesPage";
import CourseGradebookPage from "../features/internal-reports/pages/CourseGradebookPage";
import EventsPage from "../features/internal-reports/pages/EventsPage";
import EventDetailsPage from "../features/internal-reports/pages/EventDetailsPage";
import LoginPage from "../features/internal-reports/pages/LoginPage";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                {/* ================= MAIN DASHBOARD ================= */}
                <Route path="/" element={<MainQueryDashboardPage />} />
                <Route path="/dashboard" element={<MainQueryDashboardPage />} />

                {/* ================= OPEN EDX ================= */}
                <Route path="/open-edx" element={<OpenEdxPage />} />
                <Route
                    path="/open-edx/course/:courseId/details"
                    element={<CourseDetailsPage />}
                />
                <Route
                    path="/open-edx/course/:courseId/grades"
                    element={<CourseGradesPage />}
                />
                <Route
                    path="/open-edx/course/:courseId/gradebook"
                    element={<CourseGradebookPage />}
                />

                ================= EVENTS =================
                <Route path="/events" element={<EventsPage />} />
                <Route path="/events/:event_id" element={<EventDetailsPage />}
                />

                {/* ================= AUTH ================= */}
                <Route path="/login" element={<LoginPage />} />
            </Routes>
        </BrowserRouter>
    );
}