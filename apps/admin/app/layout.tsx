import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Findr Admin",
  description: "Store layout editor for Findr",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white">{children}</body>
    </html>
  );
}
