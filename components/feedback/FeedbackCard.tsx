type FeedbackCardProps = {
  title: string;
  feedbackText: string;
  tipText: string;
  errorType: string;
};

export default function FeedbackCard({
  title,
  feedbackText,
  tipText,
  errorType,
}: FeedbackCardProps) {
  return (
    <div className="dashboard-card neu-card">
      <h3>{title}</h3>
      <p style={{ color: "var(--text-soft)", marginBottom: 10 }}>
        {feedbackText}
      </p>
      <p style={{ color: "var(--accent)", fontWeight: 700, marginBottom: 14 }}>
        Tip: {tipText}
      </p>
      <span className="neu-pill">{errorType}</span>
    </div>
  );
}