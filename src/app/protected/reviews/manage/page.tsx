"use client";
import DynamicTable from "@/components/Tables/DynamicTable";
import MobileTable from "@/components/Tables/MobileTable";
import styles from "../styles/Reviews.module.css";
import Link from "next/link";
import useFetch from "@/hooks/useFetch";
import usePost from "@/hooks/usePost";
import { API_ROUTES } from "@/routes/apiRoutes";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Loader from "@/components/Loader/Loader";
import SearchInput from "@/components/Input/SearchInput";
import Button from "@/components/Button/Button";
import Modal from "@/components/Modal/Modal";
import { useWindow } from "@/hooks/useWindow";

type StatusTab =
  | "pending_verification"
  | "submitted"
  | "verification_rejected"
  | "unpublished"
  | "reported";

const parseListResponse = (response: Response): Promise<AdminReviewsListResponse> => response.json();
const parseDetailResponse = (response: Response): Promise<AdminReviewDetailResponse> => response.json();

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending_verification: "Pending verification",
  verification_rejected: "Rejected",
  submitted: "Published",
  unpublished: "Unpublished",
};

function Reviews() {
  const searchParams = useSearchParams();
  const { width } = useWindow();
  const [activeTab, setActiveTab] = useState<StatusTab>("pending_verification");
  const [queryParams, setQueryParams] = useState<Record<string, string>>({
    status: "pending_verification",
    search: "",
    page: "1",
    per_page: "10",
  });
  const [searchValue, setSearchValue] = useState("");
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(searchParams.get("review"));
  const [actionMode, setActionMode] = useState<"reject" | "delete" | null>(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setQueryParams((prev) => ({ ...prev, search: searchValue, page: "1" }));
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchValue]);

  const handleTabChange = (tab: StatusTab) => {
    setActiveTab(tab);
    setActionMode(null);
    setReason("");
    setQueryParams((prev) => ({
      ...prev,
      page: "1",
      status: tab === "reported" ? "" : tab,
      reported: tab === "reported" ? "1" : "",
    }));
  };

  const {
    data: listResponse,
    isLoading: isListLoading,
    error: listError,
    refetch: refetchList,
  } = useFetch<AdminReviewsListResponse>(API_ROUTES.REVIEWS(queryParams), {
    parser: parseListResponse,
    onError: (error) => {
      console.error("Admin reviews error:", error);
    },
  });

  const {
    data: detailResponse,
    isLoading: isDetailLoading,
    error: detailError,
    refetch: refetchDetail,
  } = useFetch<AdminReviewDetailResponse>(
    selectedReviewId ? API_ROUTES.REVIEW_DETAIL(selectedReviewId) : null,
    { parser: parseDetailResponse },
  );

  const refreshAfterAction = async () => {
    await Promise.all([refetchList(), refetchDetail()]);
  };

  const closeDetail = () => {
    setSelectedReviewId(null);
    setActionMode(null);
    setReason("");
  };

  const onMutationSuccess = async () => {
    setActionMode(null);
    setReason("");
    await refreshAfterAction();
  };

  const approveMut = usePost<ApiSuccessResponse<AdminReviewDetail>, unknown>(
    selectedReviewId ? API_ROUTES.REVIEW_APPROVE(selectedReviewId) : "",
    {
      method: "PATCH",
      onSuccess: onMutationSuccess,
      onError: (error) => console.error("Approve failed:", error),
    },
  );

  const rejectMut = usePost<
    ApiSuccessResponse<AdminReviewDetail>,
    { reason: string }
  >(selectedReviewId ? API_ROUTES.REVIEW_REJECT(selectedReviewId) : "", {
    method: "PATCH",
    onSuccess: onMutationSuccess,
    onError: (error) => console.error("Reject failed:", error),
  });

  const unpublishMut = usePost<ApiSuccessResponse<AdminReviewDetail>, unknown>(
    selectedReviewId ? API_ROUTES.REVIEW_UNPUBLISH(selectedReviewId) : "",
    {
      method: "PATCH",
      onSuccess: onMutationSuccess,
      onError: (error) => console.error("Unpublish failed:", error),
    },
  );

  const deleteMut = usePost<
    ApiSuccessResponse<unknown>,
    { reason: string }
  >(selectedReviewId ? API_ROUTES.REVIEW_DELETE(selectedReviewId) : "", {
    method: "DELETE",
    onSuccess: () => {
      setActionMode(null);
      setReason("");
      setSelectedReviewId(null);
      refetchList();
    },
    onError: (error) => console.error("Delete failed:", error),
  });

  const restoreMut = usePost<ApiSuccessResponse<AdminReviewDetail>, unknown>(
    selectedReviewId ? API_ROUTES.REVIEW_RESTORE(selectedReviewId) : "",
    {
      method: "PATCH",
      onSuccess: onMutationSuccess,
      onError: (error) => console.error("Restore failed:", error),
    },
  );

  const reviews = listResponse?.data?.data ?? [];
  const counts = listResponse?.counts;
  const detail = detailResponse?.data ?? null;
  const activeMutation =
    approveMut.isLoading ||
    rejectMut.isLoading ||
    unpublishMut.isLoading ||
    deleteMut.isLoading ||
    restoreMut.isLoading;

  const tabs: Array<{ key: StatusTab; label: string; count?: number }> = [
    {
      key: "pending_verification",
      label: "Pending verification",
      count: counts?.pending_verification,
    },
    { key: "submitted", label: "Published", count: counts?.submitted },
    {
      key: "verification_rejected",
      label: "Rejected",
      count: counts?.verification_rejected,
    },
    { key: "unpublished", label: "Unpublished", count: counts?.unpublished },
    { key: "reported", label: "Reported", count: counts?.reported },
  ];

  const formatDate = (ts: number | null | undefined) =>
    ts
      ? new Date(ts * 1000).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "—";

  const canApprove = Boolean(
    detail &&
      !detail.deleted &&
      ["pending_verification", "verification_rejected", "unpublished"].includes(
        detail.status,
      ),
  );
  const canReject = Boolean(
    detail &&
      !detail.deleted &&
      ["pending_verification", "verification_rejected"].includes(detail.status),
  );
  const canUnpublish = Boolean(detail && !detail.deleted && detail.status === "submitted");
  const canDelete = Boolean(detail && !detail.deleted);
  const canRestore = Boolean(detail && detail.deleted);

  const isReasonMissing =
    (actionMode === "reject" || actionMode === "delete") && reason.trim() === "";

  const confirmReasonAction = async () => {
    if (!selectedReviewId || isReasonMissing) return;
    if (actionMode === "reject") {
      await rejectMut.mutate({ reason: reason.trim() });
    } else if (actionMode === "delete") {
      await deleteMut.mutate({ reason: reason.trim() });
    }
  };

  const columns: TableColumn[] = [
    {
      key: "company",
      label: "Company",
      render: (review: AdminReviewListItem) => (
        <div className={styles.companyCell}>
          <div className={styles.initials}>
            {(review.company?.name ?? "?").charAt(0).toUpperCase()}
          </div>
          <span>{review.company?.name ?? "Unknown company"}</span>
        </div>
      ),
    },
    {
      key: "title",
      label: "Title",
      render: (review: AdminReviewListItem) => review.title || "—",
    },
    {
      key: "status",
      label: "Status",
      render: (review: AdminReviewListItem) => (
        <span className={`${styles.statusBadge} ${styles[review.status]}`}>
          {review.deleted ? "Deleted · " : ""}
          {STATUS_LABELS[review.status] ?? review.status}
        </span>
      ),
    },
    {
      key: "pendingReports",
      label: "Reports",
      render: (review: AdminReviewListItem) =>
        review.pendingReports > 0 ? (
          <span className={styles.reportFlag}>{review.pendingReports}</span>
        ) : (
          "0"
        ),
    },
    {
      key: "verification",
      label: "Verification",
      render: (review: AdminReviewListItem) =>
        review.verificationType
          ? `${review.verificationType} · ${review.verificationStatus ?? "n/a"}`
          : "—",
    },
    {
      key: "createdAt",
      label: "Created",
      render: (review: AdminReviewListItem) => formatDate(review.createdAt),
    },
    {
      key: "actions",
      label: "",
      render: (review: AdminReviewListItem) => (
        <button
          type="button"
          className={styles.linkButton}
          onClick={() => {
            setSelectedReviewId(review.id);
            setActionMode(null);
            setReason("");
          }}
        >
          View
        </button>
      ),
    },
  ];

  const skeletonRows = Array.from({ length: 10 }).map((_, index) => ({
    id: `skeleton-${index}`,
    title: "",
    status: "draft",
    deleted: false,
    company: null,
    authorType: "guest",
    hasSalaryReview: false,
    verificationType: null,
    verificationStatus: null,
    pendingReports: 0,
    submittedAt: null,
    publishedAt: null,
    createdAt: null,
  })) as unknown as AdminReviewListItem[];

  return (
    <div className={styles.reviews} data-review-area>
      <Link href="/protected/reviews">← Back to Review Verification</Link>
      <div className={styles.header}>
        <h3 className={styles.title}>Reviews</h3>
        <label><input type="checkbox" checked={queryParams.include_deleted === "1"} onChange={event => setQueryParams(previous => ({ ...previous, include_deleted: event.target.checked ? "1" : "0", page: "1" }))} /> Include deleted reviews</label>
        <SearchInput
          onChange={(value) => setSearchValue(value)}
          overrideStyles={width < 600 ? { width: "100%" } : undefined}
        />
      </div>

      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ""}`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
            {typeof tab.count === "number" && (
              <span className={styles.badge}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {listError && <p className={styles.errorText} role="alert">{listError.message} <button type="button" onClick={() => refetchList()}>Try again</button></p>}
      {width <= 768 ? (
        <MobileTable
          headerTitle="Review"
          showCheckbox={false}
          emptyTitle="No reviews found"
          emptyMessage="Reviews will appear here once submitted."
          itemsPerPage={listResponse?.data?.per_page ?? 10}
          serverPagination
          currentPage={listResponse?.data?.current_page ?? 1}
          totalPages={listResponse?.data?.last_page ?? 1}
          onPageChange={page => setQueryParams(previous => ({ ...previous, page: String(page) }))}
          isLoading={isListLoading}
          data={(isListLoading ? [] : reviews).map((review) => ({
            id: review.id,
            content: (
              <div className={styles.companyCell}>
                <div className={styles.initials}>
                  {(review.company?.name ?? "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 500 }}>
                    {review.company?.name ?? "Unknown company"}
                  </p>
                  <span className={`${styles.statusBadge} ${styles[review.status]}`}>
                    {STATUS_LABELS[review.status] ?? review.status}
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={() => {
                    setSelectedReviewId(review.id);
                    setActionMode(null);
                    setReason("");
                  }}
                >
                  View
                </button>
              </div>
            ),
          }))}
        />
      ) : (
        <DynamicTable
          columns={columns}
          data={isListLoading ? skeletonRows : reviews}
          serverPagination
          currentPage={listResponse?.data?.current_page ?? 1}
          perPage={listResponse?.data?.per_page ?? 10}
          totalPages={listResponse?.data?.last_page ?? 1}
          totalItems={listResponse?.data?.total}
          onPageChange={(nextPage) =>
            setQueryParams((prev) => ({ ...prev, page: String(nextPage) }))
          }
          onPerPageChange={(nextPerPage) =>
            setQueryParams((prev) => ({
              ...prev,
              page: "1",
              per_page: String(nextPerPage),
            }))
          }
          emptyMessage="No reviews found"
        />
      )}

      <Modal
        isOpen={Boolean(selectedReviewId)}
        onClose={closeDetail}
        header={<h2>Review details</h2>}
        contentClassName={styles.modalContent}
      >
        {detailError ? <p className={styles.errorText} role="alert">{detailError.message} <button type="button" onClick={() => refetchDetail()}>Try again</button></p> : isDetailLoading || !detail ? (
          <Loader variant="spinner" size="md" />
        ) : (
          <div className={styles.detail}>
            <div className={styles.actionBar}>
              {canApprove && (
                <Button
                  variant="primary"
                  disabled={activeMutation}
                  onClick={() => approveMut.mutate({})}
                >
                  {approveMut.isLoading ? "Publishing..." : "Approve & publish"}
                </Button>
              )}
              {canUnpublish && (
                <Button
                  variant="secondary"
                  disabled={activeMutation}
                  onClick={() => unpublishMut.mutate({})}
                >
                  {unpublishMut.isLoading ? "Unpublishing..." : "Unpublish"}
                </Button>
              )}
              {canReject && (
                <Button
                  variant="tertiary"
                  disabled={activeMutation}
                  onClick={() =>
                    setActionMode(actionMode === "reject" ? null : "reject")
                  }
                >
                  Reject
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="tertiary"
                  disabled={activeMutation}
                  onClick={() =>
                    setActionMode(actionMode === "delete" ? null : "delete")
                  }
                >
                  Delete
                </Button>
              )}
              {canRestore && (
                <Button
                  variant="primary"
                  disabled={activeMutation}
                  onClick={() => restoreMut.mutate({})}
                >
                  {restoreMut.isLoading ? "Restoring..." : "Restore"}
                </Button>
              )}
            </div>

            {(actionMode === "reject" || actionMode === "delete") && (
              <div className={styles.reasonBox}>
                <label className={styles.reasonLabel} htmlFor="moderation-reason">
                  {actionMode === "reject" ? "Rejection reason" : "Deletion reason"}{" "}
                  (required)
                </label>
                <textarea
                  id="moderation-reason"
                  className={styles.textarea}
                  value={reason}
                  maxLength={2000}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Explain the moderation decision..."
                />
                {isReasonMissing && (
                  <p className={styles.errorText}>A reason is required.</p>
                )}
                <div className={styles.actionsCell}>
                  <Button
                    variant="primary"
                    disabled={activeMutation}
                    onClick={confirmReasonAction}
                  >
                    Confirm {actionMode}
                  </Button>
                  <Button
                    variant="tertiary"
                    disabled={activeMutation}
                    onClick={() => {
                      setActionMode(null);
                      setReason("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <section>
              <h4 className={styles.sectionTitle}>Overview</h4>
              <dl className={styles.contentGrid}>
                <div className={styles.field}>
                  <dt>Company</dt>
                  <dd>{detail.company?.name ?? "—"}</dd>
                </div>
                <div className={styles.field}>
                  <dt>Status</dt>
                  <dd>{STATUS_LABELS[detail.status] ?? detail.status}</dd>
                </div>
                <div className={styles.field}>
                  <dt>Author</dt>
                  <dd>
                    {detail.authorType === "registered"
                      ? (detail.author?.email ?? "Registered user")
                      : "Guest submission"}
                  </dd>
                </div>
                <div className={styles.field}>
                  <dt>Job title</dt>
                  <dd>{detail.jobTitle || "—"}</dd>
                </div>
                <div className={styles.field}>
                  <dt>Employment</dt>
                  <dd>
                    {[detail.employmentType, detail.workStyle]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </dd>
                </div>
                <div className={styles.field}>
                  <dt>Ratings</dt>
                  <dd>
                    {detail.ratings.length > 0
                      ? detail.ratings
                          .map((r) => `${r.category ?? "Overall"}: ${r.rating}/5`)
                          .join(", ")
                      : "—"}
                  </dd>
                </div>
                {detail.salaryReview && (
                  <div className={styles.field}>
                    <dt>Salary data</dt>
                    <dd>
                      {detail.salaryReview.currency}{" "}
                      {detail.salaryReview.base_salary ?? "—"} /{" "}
                      {detail.salaryReview.salary_per ?? "—"}
                    </dd>
                  </div>
                )}
                <div className={styles.field}>
                  <dt>Created</dt>
                  <dd>{formatDate(detail.createdAt)}</dd>
                </div>
                <div className={styles.field}>
                  <dt>Published</dt>
                  <dd>{formatDate(detail.publishedAt)}</dd>
                </div>
              </dl>
            </section>

            <section>
              <h4 className={styles.sectionTitle}>Content</h4>
              <p className={styles.block}>{detail.title || "(no title)"}</p>
              <p className={styles.block}>
                <strong>Pros:</strong> {detail.pros || "—"}
              </p>
              <p className={styles.block}>
                <strong>Cons:</strong> {detail.cons || "—"}
              </p>
              {detail.suggestions && (
                <p className={styles.block}>
                  <strong>Suggestions:</strong> {detail.suggestions}
                </p>
              )}
            </section>

            {detail.verification && (
              <section>
                <h4 className={styles.sectionTitle}>Verification</h4>
                <dl className={styles.contentGrid}>
                  <div className={styles.field}>
                    <dt>Type / status</dt>
                    <dd>
                      {detail.verification.type} · {detail.verification.status}
                    </dd>
                  </div>
                  {detail.verification.workEmail && (
                    <div className={styles.field}>
                      <dt>Work email</dt>
                      <dd>{detail.verification.workEmail}</dd>
                    </div>
                  )}
                  {detail.verification.linkedinUrl && (
                    <div className={styles.field}>
                      <dt>LinkedIn</dt>
                      <dd>{detail.verification.linkedinUrl}</dd>
                    </div>
                  )}
                  {detail.verification.rejectionReason && (
                    <div className={styles.field}>
                      <dt>Verification rejection</dt>
                      <dd>{detail.verification.rejectionReason}</dd>
                    </div>
                  )}
                </dl>
                {detail.verification.documents.length > 0 && (
                  <ul className={styles.list}>
                    {detail.verification.documents.map((doc) => (
                      <li key={doc.id}>
                        {doc.original_name} ({Math.round(doc.size / 1024)} KB)
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            {detail.reports.length > 0 && (
              <section>
                <h4 className={styles.sectionTitle}>
                  Reports ({detail.pendingReports} pending)
                </h4>
                <ul className={styles.list}>
                  {detail.reports.map((report) => (
                    <li key={report.id}>
                      [{report.status}] {report.reason} —{" "}
                      {report.reporter?.email ?? "unknown reporter"}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {detail.moderationHistory.length > 0 && (
              <section>
                <h4 className={styles.sectionTitle}>Moderation history</h4>
                <ul className={styles.historyList}>
                  {detail.moderationHistory.map((entry, index) => (
                    <li key={`${entry.action}-${index}`}>
                      {entry.action} by admin #{entry.adminId ?? "unknown"} on{" "}
                      {formatDate(entry.at)}
                      {entry.reason ? ` — “${entry.reason}”` : ""}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {(rejectMut.error ||
              approveMut.error ||
              unpublishMut.error ||
              deleteMut.error ||
              restoreMut.error) && (
              <p className={styles.errorText}>
                {rejectMut.error?.message ??
                  approveMut.error?.message ??
                  unpublishMut.error?.message ??
                  deleteMut.error?.message ??
                  restoreMut.error?.message ??
                  "Action failed."}
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function ManageReviewsPage() {
  return <Suspense fallback={<p role="status">Loading review management…</p>}><Reviews /></Suspense>;
}
