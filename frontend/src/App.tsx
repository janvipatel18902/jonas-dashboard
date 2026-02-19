// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import OpenEdxPage from "./features/internal-reports/pages/OpenEdxPage";
import CourseDetailsPage from "./features/internal-reports/pages/CourseDetailsPage";
import CourseGradebookPage from "./features/internal-reports/pages/CourseGradebookPage";
import CourseGradesPage from "./features/internal-reports/pages/CourseGradesPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/open-edx" />} />

        {/* Courses List */}
        <Route path="/open-edx" element={<OpenEdxPage />} />

        {/* Course Pages */}
        <Route
          path="/open-edx/course/:courseId/details"
          element={<CourseDetailsPage />}
        />
        <Route
          path="/open-edx/course/:courseId/gradebook"
          element={<CourseGradebookPage />}
        />
        <Route
          path="/open-edx/course/:courseId/grades"
          element={<CourseGradesPage />}
        />

        {/* Fallback */}
        <Route path="*" element={<div>404 - Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
