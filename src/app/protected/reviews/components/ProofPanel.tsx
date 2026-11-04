"use client";

import { useEffect, useRef, useState } from "react";
import useFetch from "@/hooks/useFetch";
import { API_ROUTES } from "@/routes/apiRoutes";
import { dateLabel, proofLabel } from "./verificationUtils";
import styles from "../styles/Verification.module.css";

const parseBlob = (response: Response) => response.blob();

function DocumentPreview({ verificationId, document }: { verificationId: string; document: VerificationDocument }) {
  const url = API_ROUTES.VERIFICATION_DOCUMENT(verificationId, document.id);
  const { data, error, isLoading, isIdle, refetch } = useFetch<Blob>(`${url}?preview=1`, { parser: parseBlob });
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  useEffect(() => {
    if (!data) return;
    const next = URL.createObjectURL(data);
    setObjectUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [data]);
  return <>
    <dl className={styles.fileMetadata}>
      <div><dt>File</dt><dd>{document.original_name}</dd></div>
      <div><dt>Format / size</dt><dd>{document.mime_type === "application/pdf" ? "PDF" : "Image"} · {Math.ceil(document.size / 1024).toLocaleString()} KB</dd></div>
      <div><dt>Uploaded</dt><dd>{dateLabel(document.uploadedAt)}</dd></div>
    </dl>
    <p className={styles.secondary}>Original submitted document. Automated redaction and proof assessment are not available.</p>
    {isLoading || isIdle ? <p role="status">Loading attached proof…</p> : error ? <div className={styles.error} role="alert">{error.message} <button type="button" onClick={() => refetch()}>Retry preview</button></div> : objectUrl ? document.mime_type === "application/pdf" ? (
      <iframe className={styles.document} src={objectUrl} title={`Attached proof: ${document.original_name}`} />
    ) : document.mime_type.startsWith("image/") ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img className={styles.documentImage} src={objectUrl} alt={`Submitted employment proof: ${document.original_name}`} onError={() => setImageError(true)} />
    ) : <p>Preview is unavailable for this file format.</p> : null}
    {imageError && <p className={styles.error} role="alert">This image could not be displayed. Download the file to inspect the original.</p>}
    <a className={styles.outlineLink} href={url}>Download attached proof</a>
    <p className={styles.secondary}>If your browser cannot display this file, use the download link.</p>
  </>;
}

export default function ProofPanel({ item, onClose }: { item: VerificationCase; onClose: () => void }) {
  const [documentId, setDocumentId] = useState(item.documents[0]?.id ?? "");
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus({ preventScroll: true });
    if (window.innerWidth <= 1100) panelRef.current?.scrollIntoView({ block: "start" });
    return () => previousFocus?.focus({ preventScroll: true });
  }, []);
  const documentFile = item.documents.find(document => document.id === documentId) ?? item.documents[0];
  return <aside ref={panelRef} className={styles.panel} aria-labelledby="proof-panel-heading" onKeyDown={event => { if (event.key === "Escape") onClose(); }}>
    <div className={styles.panelHeader}><h2 id="proof-panel-heading">Attached document view</h2><button ref={closeRef} className={styles.outlineLink} type="button" onClick={onClose}>Close panel</button></div>
    <p>{proofLabel(item.type)}</p>
    {item.documents.length > 1 && <><label htmlFor="proof-document">Attached file</label><select id="proof-document" value={documentId} onChange={event => setDocumentId(event.target.value)}>{item.documents.map(document => <option key={document.id} value={document.id}>{document.original_name}</option>)}</select></>}
    {documentFile ? <DocumentPreview key={documentFile.id} verificationId={item.id} document={documentFile} /> : <p>No document is attached to this verification.</p>}
  </aside>;
}
