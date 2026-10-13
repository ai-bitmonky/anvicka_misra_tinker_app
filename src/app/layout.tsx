import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? "https://" + process.env.VERCEL_PROJECT_PRODUCTION_URL : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Tinker",
  description: "Describe a web page in your own words. Tinker writes the code, shows the page straight away, and lets you change anything by asking.",
  applicationName: "Tinker",
  appleWebApp: { capable: true, title: "Tinker", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
  icons: { icon: [{ url: "/favicon.ico", sizes: "any" }, { url: "/icon.svg", type: "image/svg+xml" }], apple: "/icons/apple-touch-icon.png" },
  openGraph: { title: "Tinker", description: "Build a web page by describing it. No coding needed.", images: ["/og.png"] },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
  other: { "mobile-web-app-capable": "yes" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#0B0B0E",
  colorScheme: "dark",
};

/* Runs before first paint: the real screen width corrects the server's user-agent guess for CSS,
   and the start screen stays hidden while a saved project is restored, so nothing flashes. */
const BOOT = `(function(){var d=document.documentElement;try{var m=matchMedia("(max-width: 999.98px)").matches;d.classList.remove("mob","desk");d.classList.add(m?"mob":"desk");d.setAttribute("data-device",m?"mobile":"desktop")}catch(e){}try{var s=localStorage.getItem("tinker:v1");if(s&&JSON.parse(s).state.phase==="work")d.classList.add("restoring")}catch(e){}})();`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const device = h.get("x-device") === "mobile" ? "mobile" : "desktop";
  return (
    <html lang="en" className={device === "mobile" ? "mob" : "desk"} data-device={device} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Instrument+Serif:ital@1&family=JetBrains+Mono:wght@400;500&display=swap" />
      </head>
      <body suppressHydrationWarning>
        <div className="noise" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
