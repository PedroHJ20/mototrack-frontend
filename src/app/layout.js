import "./globals.css";

export const metadata = {
  title: "MotoTrack",
  description: "Gerencie sua garagem e manutenções",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="bg-zinc-950 text-zinc-50">{children}</body>
    </html>
  );
}