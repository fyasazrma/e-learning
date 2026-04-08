type MaterialCardProps = {
  title: string;
  topic: string;
  description: string;
  level: string;
  duration: string;
};

export default function MaterialCard({
  title,
  topic,
  description,
  level,
  duration,
}: MaterialCardProps) {
  return (
    <div className="dashboard-card neu-card">
      <h3>{title}</h3>
      <p style={{ marginBottom: 10, color: "var(--accent)", fontWeight: 700 }}>
        {topic}
      </p>
      <p>{description}</p>

      <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <span className="neu-pill">{level}</span>
        <span className="neu-pill">{duration}</span>
      </div>
    </div>
  );
}