type ExerciseCardProps = {
  title: string;
  topic: string;
  instruction: string;
  level: string;
  status: string;
};

export default function ExerciseCard({
  title,
  topic,
  instruction,
  level,
  status,
}: ExerciseCardProps) {
  return (
    <div className="dashboard-card neu-card">
      <h3>{title}</h3>
      <p style={{ marginBottom: 10, color: "var(--accent)", fontWeight: 700 }}>
        {topic}
      </p>
      <p>{instruction}</p>

      <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <span className="neu-pill">{level}</span>
        <span className="neu-pill">{status}</span>
      </div>
    </div>
  );
}