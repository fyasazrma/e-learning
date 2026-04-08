export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Mahasiswa",
      role: "Pengguna Latihan Adaptif",
      text: "Sistem membantu saya memahami kesalahan saat latihan Excel. Feedback yang muncul terasa lebih jelas dan latihan berikutnya lebih sesuai kebutuhan saya.",
    },
    {
      name: "Dosen",
      role: "Pengelola Materi dan Latihan",
      text: "Platform ini memudahkan pemantauan progres mahasiswa. Alur materi, latihan, dan feedback terasa lebih terstruktur untuk pembelajaran software perkantoran.",
    },
    {
      name: "Admin",
      role: "Pengelola Sistem",
      text: "Manajemen user, topik, dan materi menjadi lebih rapi. Tampilan dashboard juga memudahkan pengelolaan data dalam satu sistem.",
    },
  ];

  return (
    <section className="section-space testimonials-section">
      <div className="page-container">
        <h2 className="section-title">Apa Kata Pengguna</h2>
        <p className="section-subtitle">
          Dirancang untuk pengalaman belajar yang lebih terarah, adaptif, dan
          mudah dipantau.
        </p>

        <div className="testimonials-grid">
          {testimonials.map((item) => (
            <div
              key={`${item.name}-${item.role}`}
              className="testimonial-card neu-card slide-up"
            >
              <div className="testimonial-avatar">{item.name.charAt(0)}</div>
              <p className="testimonial-text">“{item.text}”</p>
              <h3 className="testimonial-name">{item.name}</h3>
              <p className="testimonial-role">{item.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}