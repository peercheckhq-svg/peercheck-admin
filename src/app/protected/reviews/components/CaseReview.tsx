"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import useFetch from "@/hooks/useFetch";
import usePost from "@/hooks/usePost";
import { API_ROUTES } from "@/routes/apiRoutes";
import Button from "@/components/Button/Button";
import Modal from "@/components/Modal/Modal";
import CompanyIdentity from "./CompanyIdentity";
import ProofPanel from "./ProofPanel";
import EmploymentEvidence from "./EmploymentEvidence";
import ReviewContent from "./ReviewContent";
import { dateLabel, queueParams, verificationLabels } from "./verificationUtils";
import styles from "../styles/Verification.module.css";

const confirmationLabels = {
  company: "The proof relates to the company being reviewed.",
  relationship: "The proof supports the claimed employment relationship.",
  rolePeriod: "The role and employment period are sufficiently supported.",
  readable: "The evidence is readable and sufficient to make a decision.",
};

export default function CaseReview({ id }: { id: string }) {
  const search = useSearchParams();
  const params = queueParams(search);
  const requestParams = search.has("status") ? params : {};
  const { data: item, error, isLoading, isIdle, refetch } = useFetch<VerificationCase>(API_ROUTES.VERIFICATION_DETAIL(id, requestParams), { keepPreviousData: true });
  const [preview, setPreview] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const proofTrigger = useRef<HTMLButtonElement>(null);
  const [confirmations, setConfirmations] = useState({ company: false, relationship: false, rolePeriod: false, readable: false });
  const approve = usePost<unknown, { confirmations: typeof confirmations }>(API_ROUTES.VERIFICATION_ACTION(id, "approve"), { method: "PATCH" });
  const reject = usePost<unknown, { reason: string }>(API_ROUTES.VERIFICATION_ACTION(id, "reject"), { method: "PATCH" });
  const busy = approve.isLoading || reject.isLoading || isLoading;

  const decide = async (action: "approve" | "reject") => {
    if (busy || (action === "approve" && !Object.values(confirmations).every(Boolean)) || (action === "reject" && !reason.trim())) return;
    setMessage("");
    const result = action === "approve" ? await approve.mutate({ confirmations }) : await reject.mutate({ reason: reason.trim() });
    if (result) {
      setRejectOpen(false);
      setReason("");
      setMessage(action === "approve" ? "Verification approved and review published." : "Verification rejected. The reason has been recorded.");
    }
    await refetch();
  };

  if ((isLoading || isIdle) && !item) return <div className={styles.page} role="status">Loading verification case…</div>;
  if (error || !item) return <div className={styles.page}><Link href="/protected/reviews">← Back to verification</Link><div className={styles.error} role="alert">{error?.message ?? "Case not found."} <button type="button" onClick={() => refetch()}>Try again</button></div></div>;

  const queue = { ...params, page: item.navigation?.position ? String(Math.ceil(item.navigation.position / Number(params.per_page))) : params.page, status: search.has("status") ? params.status : item.status, type: search.has("type") ? params.type : (item.type === "linkedin" ? "linkedin" : "documents") };
  const queueQuery = new URLSearchParams(queue).toString();
  const backHref = `/protected/reviews?${queueQuery}`;
  const review = item.review;
  const pending = item.status === "pending" && review.status === "pending_verification";
  const closePreview = () => { setPreview(false); proofTrigger.current?.focus({ preventScroll: true }); };
  const navHref = (nextId: string) => `/protected/reviews/${nextId}?${queueQuery}`;

  return <div className={styles.page} data-review-area data-review-proof={preview ? "open" : "closed"}>
    <Link className={styles.back} href={backHref}>← Go back to {verificationLabels[queue.status as VerificationStatus].toLowerCase()} overview</Link>
    {message && <p className={styles.notice} role="status">{message}</p>}
    <div className={preview ? styles.split : ""}>
      <div className={styles.caseContent}>
        <header className={styles.caseHeader}>
          <div><CompanyIdentity company={review.company} /><div className={styles.caseMeta}><span className={`${styles.badge} ${styles[item.status]}`}>{pending ? "Under review" : verificationLabels[item.status]}</span><span>{item.id}</span><button type="button" onClick={async () => { try { await navigator.clipboard.writeText(item.id); setCopied(true); } catch { setMessage("Unable to copy. Select and copy the case ID above."); } }} aria-label="Copy case ID">{copied ? "Copied" : "Copy"}</button><span>· {dateLabel(review.submittedAt ?? item.createdAt)}</span></div></div>
          {item.documents.length > 0 && <button ref={proofTrigger} type="button" className={styles.outlineLink} aria-expanded={preview} onClick={() => preview ? closePreview() : setPreview(true)}>{preview ? "Close attached file" : "Preview attached file"}</button>}
        </header>
        <EmploymentEvidence review={review} />
        {item.linkedinUrl && <p><a className={styles.outlineLink} href={item.linkedinUrl} target="_blank" rel="noopener noreferrer">Open submitted LinkedIn profile ↗</a></p>}
        {pending && <section className={styles.section} aria-labelledby="confirm-heading"><h2 className={styles.sectionTitle} id="confirm-heading">What to confirm</h2><div className={styles.checklist}>{(Object.keys(confirmationLabels) as Array<keyof typeof confirmations>).map(key => <label key={key}><input type="checkbox" checked={confirmations[key]} disabled={busy} onChange={event => setConfirmations(previous => ({ ...previous, [key]: event.target.checked }))} />{confirmationLabels[key]}</label>)}<p id="approval-help" className={styles.secondary}>Complete all four checks to approve and publish this review. If the evidence is insufficient, reject verification with a reason.</p></div></section>}
        {!pending && <section className={styles.section}><h2 className={styles.sectionTitle}>Verification decision</h2><div className={styles.reviewText}><p>{verificationLabels[item.status]} · {dateLabel(item.verifiedAt ?? item.rejectedAt)}{item.reviewedBy ? ` · Admin ${item.reviewedBy}` : ""}</p>{item.rejectionReason && <p>Reason: {item.rejectionReason}</p>}<p>Review publication status: {review.status.replaceAll("_", " ")}</p></div></section>}
        <ReviewContent review={review} />
        {review.moderationHistory.length > 0 && <section className={styles.section}><h2 className={styles.sectionTitle}>Moderation history</h2><ul className={styles.history}>{review.moderationHistory.map((entry, index) => <li key={index}><strong>{entry.action}</strong> · {dateLabel(new Date(entry.at * 1000).toISOString())} · Admin {entry.adminId ?? "unknown"}{entry.reason && <p>{entry.reason}</p>}{entry.confirmations && Object.keys(entry.confirmations).length > 0 && <p className={styles.secondary}>Manual evidence checks recorded.</p>}</li>)}</ul></section>}
        <Link className={styles.textLink} href={`/protected/reviews/manage?review=${review.id}`}>Open moderation tools for this review →</Link>
        {(approve.error || reject.error) && <p className={styles.error} role="alert">{approve.error?.message ?? reject.error?.message}</p>}
        <footer className={styles.footer}>
          <nav className={styles.queueNav} aria-label="Verification queue navigation">{item.navigation?.previous ? <Link href={navHref(item.navigation.previous)}>← Prev</Link> : <span>← Prev</span>}<span>{item.navigation?.position ? `${item.navigation.position} of ${item.navigation.total}` : `${item.navigation?.total ?? 0} in queue`}</span>{item.navigation?.next ? <Link href={navHref(item.navigation.next)}>Next →</Link> : <span>Next →</span>}</nav>
          {pending && <div className={styles.footerActions}><button type="button" className={styles.rejectButton} disabled={busy} onClick={() => { reject.reset(); setRejectOpen(true); }}>Reject Verification</button><Button variant="primary" disabled={busy || !Object.values(confirmations).every(Boolean)} aria-describedby="approval-help" onClick={() => decide("approve")}>{approve.isLoading ? "Approving…" : "Approve Review"}</Button></div>}
        </footer>
      </div>
      {preview && <ProofPanel item={item} onClose={closePreview} />}
    </div>
    <Modal isOpen={rejectOpen} onClose={() => { if (!busy) setRejectOpen(false); }} ariaLabel="Reject verification" closeOnEscape={!busy} closeOnBackdropClick={!busy} hideCloseButton={busy} header={<h2>Reject verification</h2>}>
      <form className={styles.reasonForm} onSubmit={event => { event.preventDefault(); decide("reject"); }}><label htmlFor="verification-reason">Rejection reason (required)</label><textarea id="verification-reason" required maxLength={2000} value={reason} onChange={event => setReason(event.target.value)} disabled={busy} placeholder="Explain why the evidence does not support this employment claim." />{reject.error && <p className={styles.error} role="alert">{reject.error.message}</p>}<div className={styles.footerActions}><Button variant="primary" type="submit" disabled={busy || !reason.trim()}>{reject.isLoading ? "Rejecting…" : "Confirm rejection"}</Button><Button variant="secondary" type="button" disabled={busy} onClick={() => setRejectOpen(false)}>Cancel</Button></div></form>
    </Modal>
  </div>;
}
