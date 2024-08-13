import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Provider from "@/components/Provider";

import "react-loading-skeleton/dist/skeleton.css"
import 'simplebar-react/dist/simplebar.min.css'

import { Toaster } from "@/components/ui/toaster";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chat with Your PDF - AI-Powered PDF Assistant",
  description:
    "Interact with your PDF documents using our AI-powered assistant. Upload, chat, and get instant insights from your PDFs with ease.",
  keywords: [
    "PDF chat",
    "AI PDF assistant",
    "chat with PDF",
    "SaaS PDF tool",
    "interactive PDF",
    "PDF insights",
    "document analysis",
    "AI chat",
  ],
  
  icons: {
    icon: "/f.png", // Path to your favicon
  },

  // openGraph: {
  //   title: "Chat with Your PDF - AI-Powered PDF Assistant",
  //   description:
  //     "Experience a new way of interacting with your documents. Our AI-powered tool allows you to chat with your PDFs and get instant answers.",
  //   url: "https://www.yourdomain.com",
  //   type: "website",
  //   images: [
  //     {
  //       url: "https://www.yourdomain.com/og-image.png",
  //       width: 1200,
  //       height: 630,
  //       alt: "Chat with Your PDF - AI-Powered PDF Assistant",
  //     },
  //   ],
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Provider>
        <body className={cn('min-h-screen font-sans antialiased grainy',inter.className)}>
          <Toaster/>
          <Navbar/>
          {children}
        </body>
      </Provider>
    </html>
  );
}
