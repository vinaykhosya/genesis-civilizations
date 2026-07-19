import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Genesis — Laboratory of Emergent Civilizations",
  description: "A scientific instrument for studying how life shapes itself under pressure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
