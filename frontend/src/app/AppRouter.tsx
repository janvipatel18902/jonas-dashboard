import { BrowserRouter, Routes, Route } from "react-router-dom";
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
                <Route path="/" element={<OpenEdxPage />} />
                <Route path="/open-edx" element={<OpenEdxPage />} />
                <Route path="/open-edx/course/:course_id/details" element={<CourseDetailsPage />} />
                <Route path="/open-edx/course/:course_id/grades" element={<CourseGradesPage />} />
                <Route path="/open-edx/course/:course_id/gradebook" element={<CourseGradebookPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/events/:event_id" element={<EventDetailsPage />} />

                <Route path="/login" element={<LoginPage />} />
            </Routes>
        </BrowserRouter>
    );
}
