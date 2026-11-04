import { employmentPeriod, relationship } from "./verificationUtils";
import styles from "../styles/Verification.module.css";

export default function EmploymentEvidence({ review }: { review: VerificationCase["review"] }) {
  const fields = [
    ["Company", review.company?.name ?? "Not provided"],
    ["Relationship", relationship(review.currentEmployee)],
    ["Job title", review.jobTitle ?? "Not provided"],
    ["Department", review.department ?? "Not provided"],
    ["Employment type", review.employmentType ?? "Not provided"],
    ["Location", review.location || "Not provided"],
    ["Employment period", employmentPeriod(review)],
  ];

  return (
    <>
      <section className={styles.section} aria-labelledby="claim-heading">
        <h2 className={styles.sectionTitle} id="claim-heading">Submitted Employment Claim</h2>
        <dl className={styles.claim}>
          {fields.slice(1).map(([label, value]) => (
            <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
          ))}
        </dl>
      </section>
      <section className={styles.comparison} aria-labelledby="comparison-heading">
        <h2 id="comparison-heading">Proof Comparison</h2>
        <p>Confirm the submitted claim against the attached evidence. Automated field detection is not available.</p>
        <div className={styles.section}>
          <div className={styles.comparisonScroll}>
            <table>
              <thead>
                <tr>
                  <th scope="col">Field</th>
                  <th scope="col">Submitted claim</th>
                  <th scope="col">Detected in proof</th>
                  <th scope="col">Assessment</th>
                </tr>
              </thead>
              <tbody>
                {fields.map(([label, value]) => (
                  <tr key={label}>
                    <th scope="row" className={styles.fieldHeading}>{label}</th>
                    <td>{value}</td>
                    <td>Detection unavailable</td>
                    <td><span className={`${styles.badge} ${styles.pending}`}>Not assessed</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.hint}>Use the confirmation checklist to record your manual evidence assessment.</p>
        </div>
      </section>
    </>
  );
}
