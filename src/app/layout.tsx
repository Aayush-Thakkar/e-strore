import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anandam | Royal Sarees, Suits, Lehengas & Indo-Western",
  description:
    "Exquisite handwoven Sarees, bespoke designer Suits, royal bridal Lehengas, and contemporary Indo-Western ensembles. Timeless Indian heritage and royal craftsmanship.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col bg-[#FDFBF7] text-[#241416] selection:bg-[#722F37] selection:text-white">
        {children}
      </body>
    </html>
  );
}
