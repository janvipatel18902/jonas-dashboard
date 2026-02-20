export const OPEN_EDX_ENDPOINTS = {
  list_all_courses: { path: `/api/courses/v1/courses/` },

  get_user_by_email: {
    path: `/api/user/v1/accounts?email={email}`,
    build: (email: string) =>
      `/api/user/v1/accounts?email=${encodeURIComponent(email)}`,
  },

  get_all_course_grades: {
    path: `/api/grades/v1/courses/{course_id}/`,
    build: (courseId: string) => `/api/grades/v1/courses/${courseId}/`,
  },

  get_all_course_gradebook: {
    path: `/api/grades/v1/gradebook/{course_id}/`,
    build: (courseId: string) => `/api/grades/v1/gradebook/${courseId}/`,
  },

  get_course_details: {
    path: `/api/courseware/course/{course_id}`,
    build: (courseId: string) => `/api/courseware/course/${courseId}`,
  },
};
