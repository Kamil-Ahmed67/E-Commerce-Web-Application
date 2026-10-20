// app/layout.jsx
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { getPixelConfigs } from '@/lib/server/getPixelConfigs';
import CookieConsentWrapper from '@/components/CookieConsentWrapper/CookieConsentWrapper';
import RouteTracker from '@/components/RouteTracker/RouteTracker';
import { AuthProvider } from '@/provider/AuthProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: 'Mingle',
  description: 'Mingle In Style',
};

export default async function ResetPasswordLayout({ children }) {
  const pixelConfigs = await getPixelConfigs();

  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50`}
      >
        <CookieConsentWrapper configs={pixelConfigs} />
        <AuthProvider>
          <RouteTracker />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}