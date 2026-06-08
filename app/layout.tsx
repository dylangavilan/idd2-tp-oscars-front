import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { getSession } from "@/lib/session";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const fraunces = Fraunces({
  variable: "--font-heading-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Premios Oscar - IDD2",
  description: "Sistema de gestion de Premios Oscar",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[24rem] bg-[radial-gradient(circle_at_top,rgba(227,179,79,0.18),transparent_55%)]" />
        <Navbar user={user} />
        <main className="relative z-10 flex-1">
          <div className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
            <div className="w-full rounded-[2rem] border border-white/35 bg-card/72 p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.65)] backdrop-blur-xl sm:p-7">
              {children}
            </div>
          </div>
        </main>
        <Toaster
          toastOptions={{
            classNames: {
              toast:
                "border border-border/70 bg-card/95 text-card-foreground shadow-xl backdrop-blur-md",
              title: "font-medium",
              description: "text-muted-foreground",
            },
          }}
        />
      </body>
    </html>
  );
}
