type SectionTitleProps = {
  title: string;
  subtitle?: string;
};

export default function SectionTitle({
  title,
  subtitle,
}: SectionTitleProps) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <h2 style={{ fontSize: "1.6rem", marginBottom: "8px" }}>{title}</h2>
      {subtitle && (
        <p style={{ color: "var(--text-soft)", lineHeight: 1.7 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}