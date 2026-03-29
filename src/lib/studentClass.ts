/** Reads class from the same localStorage shape used across student flows. */
export function getStudentClass(): string | null {
  try {
    const raw = localStorage.getItem("student");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { student?: { class?: string }; class?: string };
    return parsed?.student?.class ?? parsed?.class ?? null;
  } catch {
    return null;
  }
}

export function isCompetitiveClass(): boolean {
  return getStudentClass() === "competitive";
}
