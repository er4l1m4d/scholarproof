import type { Metadata } from "next";
import { Geist } from 'next/font/google';
import "./globals.css";
import { Toaster } from 'react-hot-toast';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geist.className}>
      <body className="antialiased">
        <Toaster position="top-center" />
        {children}
      </body>
    </html>
  );
}
