import "./globals.css";

export const metadata = {
  title: "VyaparMitra",
  description: "Aapka Business Digital Mitra",
};

export default function RootLayout({ children }) {
  return (
    <html lang="hi">
      <body>{children}</body>
    </html>
  );
}