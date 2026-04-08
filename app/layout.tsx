import "@/styles/globals.css";

export const metadata = {
  title: "AI Adaptive Learning",
  description: "E-Learning pelatihan software perkantoran berbasis AI adaptif",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}