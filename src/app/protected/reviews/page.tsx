"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import useFetch from "@/hooks/useFetch";
import { API_ROUTES } from "@/routes/apiRoutes";
import MetricCard from "@/components/Cards/MetricCard";
import DynamicTable from "@/components/Tables/DynamicTable";
import MobileTable from "@/components/Tables/MobileTable";
import CompanyIdentity from "./components/CompanyIdentity";
import { dateLabel, parseVerificationList, proofLabel, queueParams, relationship, relativeDate, verificationLabels } from "./components/verificationUtils";
import styles from "./styles/Verification.module.css";

function VerificationOverview() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = queueParams(searchParams);
  const { data, isLoading, isIdle, error, refetch } = useFetch<VerificationListResponse>(API_ROUTES.VERIFICATIONS(params), { parser: parseVerificationList });
  const loading = isLoading || isIdle;
  const update = (changes: Record<string, string>) => {
    const next = new URLSearchParams({ ...params, ...changes });
    router.replace(`/protected/reviews?${next}`, { scroll: false });
  };
  const caseHref = (id: string) => `/protected/reviews/${id}?${new URLSearchParams(params)}`;
  const columns: TableColumn[] = [
    { key: "company", label: "Company", render: (item: VerificationCase) => <CompanyIdentity company={item.review.company} /> },
    { key: "id", label: "Case ID", render: (item: VerificationCase) => <Link className={styles.caseId} href={caseHref(item.id)} title={item.id}>{item.id}</Link> },
    { key: "claim", label: "Employment claim", render: (item: VerificationCase) => <div>{item.review.jobTitle ?? "Job title not provided"}<span className={styles.secondary}>{relationship(item.review.currentEmployee)}</span></div> },
    { key: "proof", label: "Proof", render: (item: VerificationCase) => <div>{proofLabel(item.type)}<span className={styles.secondary}>{item.documents[0]?.mime_type === "application/pdf" ? "PDF" : item.documents[0]?.mime_type.startsWith("image/") ? "Image" : "Profile link"}</span></div> },
    { key: "submitted", label: "Submitted", render: (item: VerificationCase) => <div>{dateLabel(item.review.submittedAt ?? item.createdAt)}<span className={styles.secondary}>{relativeDate(item.review.submittedAt ?? item.createdAt)}</span></div> },
    { key: "actions", label: "", render: (item: VerificationCase) => <Link className={styles.textLink} href={caseHref(item.id)} aria-label={`Review ${item.review.company?.name ?? "company"} case`}>Review →</Link> },
  ];
  const counts = data?.counts;
  const metrics = [
    ["Total Reviews", counts ? counts.pending + counts.verified + counts.rejected : "—"],
    ["Pending", counts?.pending ?? "—"], ["Approved", counts?.verified ?? "—"], ["Rejected", counts?.rejected ?? "—"],
  ] as const;

  return (
    <div className={styles.page} data-review-area>
      <header className={styles.pageHeader}>
        <div><h1>Review Verification</h1><p>Review employment evidence before workplace reviews are published.</p></div>
        <Link className={styles.outlineLink} href="/protected/reviews/manage">Manage all reviews</Link>
      </header>
      <div className={styles.metrics}>{metrics.map(([title, value]) => <MetricCard key={title} title={title} value={value} icon={null} type={null} isLoading={loading} />)}</div>
      <div className={styles.toolbar}>
        <nav className={styles.tabs} aria-label="Verification status">
          {(Object.keys(verificationLabels) as VerificationStatus[]).map(status => <button key={status} type="button" aria-current={params.status === status ? "page" : undefined} className={params.status === status ? styles.activeTab : ""} onClick={() => update({ status, page: "1" })}>{verificationLabels[status]}</button>)}
        </nav>
        <form className={styles.filters} onSubmit={event => { event.preventDefault(); const fields = new FormData(event.currentTarget); update({ search: String(fields.get("search") ?? ""), page: "1" }); }}>
          <label className={styles.srOnly} htmlFor="verification-type">Proof queue</label>
          <select id="verification-type" value={params.type} onChange={event => update({ type: event.target.value, page: "1" })}><option value="documents">Document proofs</option><option value="linkedin">LinkedIn proofs</option></select>
          <label className={styles.srOnly} htmlFor="verification-search">Search company or review</label>
          <input key={params.search} id="verification-search" name="search" defaultValue={params.search} maxLength={255} placeholder="Search company or review" type="search" />
          <button type="submit" className={styles.outlineLink}>Search</button>
        </form>
      </div>
      {error ? <div className={styles.error} role="alert">{error.message} <button type="button" onClick={() => refetch()}>Try again</button></div> : (
        <div className={styles.tableWrap} aria-busy={loading}>
          <div className={styles.desktopTable}>
          <DynamicTable columns={columns} data={data?.data.data ?? []} isLoading={loading} serverPagination currentPage={data?.data.current_page ?? Number(params.page)} perPage={data?.data.per_page ?? 10} totalPages={data?.data.last_page ?? 1} totalItems={data?.data.total} onPageChange={page => update({ page: String(page) })} onPerPageChange={perPage => update({ per_page: String(perPage), page: "1" })} emptyTitle="No verification cases found" emptyMessage="Try another status or search. Submitted proof will appear here." />
          </div>
          <div className={styles.mobileTable}>
            <MobileTable headerTitle="Verification cases" data={(data?.data.data ?? []).map(item => ({ id: item.id, content: <div className={styles.mobileCase}><CompanyIdentity company={item.review.company} /><p>{item.review.jobTitle ?? "Job title not provided"} · {relationship(item.review.currentEmployee)}</p><p>{proofLabel(item.type)} · {dateLabel(item.review.submittedAt ?? item.createdAt)}</p><Link className={styles.textLink} href={caseHref(item.id)}>Review case →</Link></div> }))} isLoading={loading} serverPagination currentPage={data?.data.current_page ?? Number(params.page)} totalPages={data?.data.last_page ?? 1} onPageChange={page => update({ page: String(page) })} itemsPerPage={Number(params.per_page)} emptyTitle="No verification cases found" emptyMessage="Try another status or search." />
          </div>
        </div>
      )}
      <p className={styles.secondary}>Counts reflect the selected proof queue and search. Approved refers to employment verification.</p>
    </div>
  );
}

export default function ReviewsPage() {
  return <Suspense fallback={<p role="status">Loading verification queue…</p>}><VerificationOverview /></Suspense>;
}
