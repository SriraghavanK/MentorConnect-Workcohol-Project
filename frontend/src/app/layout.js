import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LayoutClient from "../components/LayoutClient";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata = {
  title: "MentorConnect | Premium Mentorship Platform",
  description: "Book mentorship sessions with top experts. Grow your career with MentorConnect.",
  keywords: "mentorship, career growth, professional development, expert guidance",
  authors: [{ name: "MentorConnect Team" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "MentorConnect | Premium Mentorship Platform",
    description: "Book mentorship sessions with top experts. Grow your career with MentorConnect.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "MentorConnect | Premium Mentorship Platform",
    description: "Book mentorship sessions with top experts. Grow your career with MentorConnect.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Book mentorship sessions with top experts. Grow your career with MentorConnect." />
        <meta name="keywords" content="mentorship, career growth, professional development, expert guidance" />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#ffffff" />
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; img-src * data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline'; font-src *; connect-src *; frame-src https://js.stripe.com;" />
        <link rel="canonical" href="https://mentorconnect.com/" />
        <link rel="icon" href="/favicon.ico" />
        <title>MentorConnect | Premium Mentorship Platform</title>
        {/* Open Graph */}
        <meta property="og:title" content="MentorConnect | Premium Mentorship Platform" />
        <meta property="og:description" content="Book mentorship sessions with top experts. Grow your career with MentorConnect." />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:url" content="https://mentorconnect.com/" />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="MentorConnect | Premium Mentorship Platform" />
        <meta name="twitter:description" content="Book mentorship sessions with top experts. Grow your career with MentorConnect." />
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-text`}>
        <LayoutClient>{children}</LayoutClient>
        <Script src="https://js.stripe.com/v3/" strategy="beforeInteractive" />
        <noscript>
          <div style={{background:'#fff',color:'#000',padding:'1em',textAlign:'center'}}>This site works best with JavaScript enabled.</div>
        </noscript>
      </body>
    </html>
  );
}