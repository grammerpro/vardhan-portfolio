import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar"; // 👈 import the Navbar


export const metadata: Metadata = {
  title: "Vardhan's Portfolio",
  description: "Built with Next.js, Tailwind CSS, and 💙",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar /> {/* 👈 add this line */}
        <main className="pt-20">{children}</main> {/* push content below nav */}
      </body>
    </html>
  );
}
