import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { ConvexClientProvider } from "@/providers/convex-client-provider";
import { ClerkProvider } from "@clerk/nextjs";

const inter =Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "SoapBoard",
  description: "Realtime Collaborative Boards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="hydrated">
      <body>
        <ClerkProvider>
        <ConvexClientProvider>
        {children}
        </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
