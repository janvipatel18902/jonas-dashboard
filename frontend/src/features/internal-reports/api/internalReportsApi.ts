const BASE_URL = import.meta.env.VITE_API_URL;

/* ================= OPEN EDX ================= */

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

/* ================= ENVIRONMENT ================= */

export async function getEnvironment() {
    const res = await fetch(`${BASE_URL}/environment`);
    if (!res.ok) throw new Error("Failed to fetch environment");
    return res.json();
}

/* ================= UNIVERSITIES ================= */

export async function getUniversities() {
    const res = await fetch(`${BASE_URL}/universities`);
    if (!res.ok) throw new Error("Failed to fetch universities");
    return res.json();
}

/* ================= QUERY ================= */

export async function runQuery(body: {
    university_name_filter?: string | null;
    completed_c4f_at_from_filter?: string | null;
    completed_c4f_at_to_filter?: string | null;
}) {
    const res = await fetch(`${BASE_URL}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error("Query failed");

    return res.json();
}

/* ================= PROFESSIONAL ACCESS ================= */

export async function grantProfessionalAccess(body: {
    user_id: string;
    university_name?: string | null;
}) {
    const res = await fetch(
        `${BASE_URL}/users/professional-access/grant`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        }
    );

    if (!res.ok) throw new Error("Grant failed");

    return res.json();
}

/* ================= EVENTS ================= */

export async function getEvents(): Promise<{ data: any[] }> {
  const res = await fetch(`${BASE_URL}/events`);
  if (!res.ok) throw new Error("Failed to fetch events");

  const json = await res.json();

  // Jonas backend may return:
  // 1) [ ...events ]
  // 2) { data: [ ...events ] }
  // 3) { data: { data: [ ...events ] } } (less likely but safe)
  if (Array.isArray(json)) return { data: json };
  if (Array.isArray(json?.data)) return { data: json.data };
  if (Array.isArray(json?.data?.data)) return { data: json.data.data };

  return { data: [] };
}

