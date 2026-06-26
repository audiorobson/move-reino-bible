import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Move Reino Bible",
  description: "Estudo bíblico profundo assistido por IA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
