import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/QueryProvider";
import { Providers } from "./ChakraProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FAQ DS Checker Integration",
  description: "FAQ DS Checker Integration",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <div>
            <Providers>{children}</Providers>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
