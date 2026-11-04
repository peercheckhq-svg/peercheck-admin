type VerificationStatus = "pending" | "verified" | "rejected";

interface VerificationDocument {
  id: string;
  original_name: string;
  mime_type: string;
  size: number;
  uploadedAt: string | null;
}

interface VerificationCase {
  id: string;
  type: "payslip" | "other_document" | "linkedin" | "email";
  status: VerificationStatus;
  workEmail: string | null;
  linkedinUrl: string | null;
  rejectionReason: string | null;
  reviewedBy: string | null;
  verifiedAt: string | null;
  rejectedAt: string | null;
  createdAt: string | null;
  documents: VerificationDocument[];
  review: {
    id: string;
    status: string;
    company: (AdminReviewCompanySummary & { logo: string | null; industry: string | null }) | null;
    jobTitle: string | null;
    currentEmployee: boolean | null;
    department: string | null;
    location: string;
    employmentType: string | null;
    startDate: string | null;
    endDate: string | null;
    submittedAt: string | null;
    title: string | null;
    pros: string | null;
    cons: string | null;
    suggestions: string | null;
    ratings: Array<{ category: string | null; rating: number }>;
    moderationHistory: Array<{ action: string; adminId: string | null; at: number; reason?: string | null; confirmations?: Record<string, boolean> }>;
  };
  navigation?: { previous: string | null; next: string | null; position: number | null; total: number };
}

interface VerificationListResponse {
  data: { data: VerificationCase[]; current_page: number; per_page: number; last_page: number; total: number };
  counts: Record<VerificationStatus, number>;
}
