import styles from "../styles/Verification.module.css";

export default function ReviewContent({ review }: { review: VerificationCase["review"] }) {
  const content = [
    ["What was good?", review.pros],
    ["What could be better?", review.cons],
    ["Advice to future employees", review.suggestions],
  ];

  return (
    <>
      <div className={styles.contentHeading}>
        <h2>Review Content</h2>
        <p className={styles.secondary}>
          Provided for context and content review. Employment verification should
          be based on the submitted claim and proof.
        </p>
        {review.title && <p>{review.title}</p>}
      </div>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Ratings</h2>
        <div className={styles.ratings}>
          {review.ratings.length ? (
            review.ratings.map((rating, index) => {
              const stars = Math.min(5, Math.max(0, Math.round(rating.rating)));
              return (
                <div className={styles.rating} key={`${rating.category}-${index}`}>
                  <span>{rating.category ?? "Overall"}</span>
                  <span aria-label={`${rating.rating} out of 5`}>
                    <span className={styles.stars} aria-hidden="true">
                      {"★".repeat(stars)}{"☆".repeat(5 - stars)}
                    </span>{" "}
                    {rating.rating.toFixed(1)}
                  </span>
                </div>
              );
            })
          ) : <p>No ratings provided.</p>}
        </div>
      </section>
      {content.map(([title, text]) => (
        <section className={styles.section} key={title}>
          <details open>
            <summary>{title}</summary>
            <p className={styles.reviewText}>{text || "Not provided"}</p>
          </details>
        </section>
      ))}
    </>
  );
}
