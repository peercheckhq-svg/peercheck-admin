export const verificationLabels: Record<VerificationStatus, string> = {
  pending: "Pending", verified: "Approved", rejected: "Rejected",
};

export function proofLabel(type: VerificationCase["type"]) {
  return { payslip: "Payslip", other_document: "Other document", linkedin: "LinkedIn", email: "Work email" }[type];
}

export function relationship(value: boolean | null) {
  return value === null ? "Not provided" : value ? "Current employee" : "Former employee";
}

export function dateLabel(value: string | null, monthOnly = false) {
  if (!value) return "Not provided";
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value);
  if (Number.isNaN(date.getTime())) return "Not provided";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", ...(monthOnly ? {} : { day: "numeric" }) });
}

export function employmentPeriod(review: VerificationCase["review"]) {
  return `${dateLabel(review.startDate, true)} – ${review.currentEmployee ? "Present" : dateLabel(review.endDate, true)}`;
}

export function relativeDate(value: string | null) {
  if (!value) return "";
  const days = Math.floor((Date.now() - new Date(value).getTime()) / 86400000);
  if (!Number.isFinite(days)) return "";
  return new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }).format(-days, "day");
}

export const parseVerificationList = (response: Response): Promise<VerificationListResponse> => response.json();

export function queueParams(search: URLSearchParams | { get: (key: string) => string | null }) {
  const status = search.get("status");
  return {
    status: status === "verified" || status === "rejected" ? status : "pending",
    type: search.get("type") === "linkedin" ? "linkedin" : "documents",
    search: (search.get("search") ?? "").slice(0, 255),
    page: String(Math.max(1, Number(search.get("page")) || 1)),
    per_page: ["5", "10", "20"].includes(search.get("per_page") ?? "") ? search.get("per_page")! : "10",
  };
}
