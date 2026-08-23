interface AdminReviewCompanySummary {
  id: string;
  name: string;
  slug: string;
}

interface AdminReviewListItem {
  id: string;
  title: string | null;
  status: string;
  deleted: boolean;
  company: AdminReviewCompanySummary | null;
  authorType: "guest" | "registered";
  hasSalaryReview: boolean;
  verificationType: string | null;
  verificationStatus: string | null;
  pendingReports: number;
  submittedAt: number | null;
  publishedAt: number | null;
  createdAt: number | null;
}

interface AdminReviewsPaginator {
  current_page: number;
  data: AdminReviewListItem[];
  first_page_url?: string;
  from?: number | null;
  last_page: number;
  last_page_url?: string;
  next_page_url?: string | null;
  path?: string;
  per_page: number;
  prev_page_url?: string | null;
  to?: number | null;
  total: number;
}

interface AdminReviewStatusCounts {
  pending_verification: number;
  submitted: number;
  verification_rejected: number;
  unpublished: number;
  reported: number;
}

interface AdminReviewsListResponse
  extends ApiSuccessResponse<AdminReviewsPaginator> {
  counts: AdminReviewStatusCounts;
}

interface AdminReviewReportSummary {
  id: string;
  reason: string;
  status: string;
  adminNotes: string | null;
  reporter: { id: string; email: string } | null;
  createdAt: number | null;
}

interface AdminReviewVerificationDetail {
  id: string;
  type: string;
  status: string;
  workEmail: string | null;
  linkedinUrl: string | null;
  rejectionReason: string | null;
  documents: Array<{
    id: string;
    original_name: string;
    mime_type: string;
    size: number;
  }>;
}

interface AdminReviewDetail extends AdminReviewListItem {
  pros: string | null;
  cons: string | null;
  suggestions: string | null;
  recommendToFriend: boolean | null;
  ceoApproval: boolean | null;
  companyFuture: boolean | null;
  currentEmployee: boolean | null;
  employmentType: string | null;
  workStyle: string | null;
  jobTitle: string | null;
  yearsExperience: string | number | null;
  author: { id: string; email: string } | null;
  ratings: AdminReviewRating[];
  salaryReview:
    | {
        id: string;
        base_salary: number | null;
        salary_per: string | null;
        currency: string | null;
        bonus: number | null;
        status: string;
      }
    | null;
  verification: AdminReviewVerificationDetail | null;
  reports: AdminReviewReportSummary[];
  moderationHistory: Array<{
    action: string;
    adminId: string | null;
    at: number;
    reason?: string;
  }>;
}

type AdminReviewDetailResponse = ApiSuccessResponse<AdminReviewDetail>;

interface AdminReviewReportsPaginator {
  current_page: number;
  data: Array<{
    id: string;
    reason: string;
    status: string;
    adminNotes: string | null;
    reporter: { id: string; email: string } | null;
    review: {
      id: string;
      title: string | null;
      status: string;
      company: AdminReviewCompanySummary | null;
    } | null;
    createdAt: number | null;
  }>;
  last_page: number;
  per_page: number;
  total: number;
}

type AdminReviewReportsListResponse =
  ApiSuccessResponse<AdminReviewReportsPaginator>;
