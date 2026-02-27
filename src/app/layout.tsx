import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Future Sketch Workshop",
  description: "Visualize your app's future in 1, 3, or 5 years",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
