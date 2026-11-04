"use client";

import { useState } from "react";
import styles from "../styles/Verification.module.css";

export default function CompanyIdentity({ company }: { company: VerificationCase["review"]["company"] }) {
  const [failedLogo, setFailedLogo] = useState(false);
  return (
    <div className={styles.company}>
      {company?.logo && !failedLogo ? (
        // Logos are supplied by the API and can use different storage hosts.
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.logo} src={company.logo} alt="" onError={() => setFailedLogo(true)} />
      ) : <span className={styles.initial}>{(company?.name ?? "?").slice(0, 1)}</span>}
      <div><strong>{company?.name ?? "Unknown company"}</strong><span className={styles.secondary}>{company?.industry ?? "Industry not provided"}</span></div>
    </div>
  );
}
