const BASE_URL = "http://localhost:3000";

export async function getCourses() {
    const res = await fetch(`${BASE_URL}/open-edx/courses`);
    if (!res.ok) throw new Error("Failed to fetch courses");
    return res.json();
}

export async function getCourseDetails(courseId: string) {
    const res = await fetch(`${BASE_URL}/open-edx/courses/${courseId}`);
    if (!res.ok) throw new Error("Failed to fetch course details");
    return res.json();
}

export async function getCourseGradebook(courseId: string) {
    const res = await fetch(
        `${BASE_URL}/open-edx/courses/${courseId}/gradebook`
    );
    if (!res.ok) throw new Error("Failed to fetch gradebook");
    return res.json();
}

export async function getCourseGrades(courseId: string) {
    const res = await fetch(
        `${BASE_URL}/open-edx/courses/${courseId}/grades`
    );
    if (!res.ok) throw new Error("Failed to fetch grades");
    return res.json();
}
