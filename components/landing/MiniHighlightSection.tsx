export default function MiniHighlightSection() {
  const items = [
    "Word Learning",
    "Excel Practice",
    "PowerPoint Training",
    "AI Feedback",
    "Adaptive Learning",
  ];

  return (
    <section style={{ padding: "0 0 28px" }}>
      <div className="page-container">
        <div
          className="neu-card"
          style={{
            padding: "18px 20px",
            display: "flex",
            gap: 14,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {items.map((item) => (
            <div
              key={item}
              className="neu-pill"
              style={{
                padding: "12px 18px",
                borderRadius: 999,
                fontWeight: 700,
                fontSize: "0.95rem",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}