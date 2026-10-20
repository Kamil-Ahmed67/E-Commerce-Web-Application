import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { CartProvider } from "@/provider/CartProvider";
import { WishlistProvider } from "@/provider/WishlistProvider";
import { AuthProvider } from "@/provider/AuthProvider";
import Header from "@/components/Header/HeaderMain";
import Footer from "@/components/Footer/Footer";
import FloatingLauncher from "@/components/FloatingLauncher/FloatingLauncher";
import { getPixelConfigs } from '@/lib/server/getPixelConfigs';
import CookieConsentWrapper from '@/components/CookieConsentWrapper/CookieConsentWrapper';
import RouteTracker from '@/components/RouteTracker/RouteTracker';
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

const SITE_URL = 'https://mingleinstylebd.com';
const LOGO_URL = `${SITE_URL}/images/logo/mingle-style.png`;

export async function generateMetadata() {
  return {
    title: 'Mingle In Style',
    description: 'Mingle In Style — your destination for fashion.',
    metadataBase: new URL(SITE_URL),
    openGraph: {
      title: 'Mingle In Style',
      description: 'Mingle In Style — your destination for fashion.',
      url: SITE_URL,
      siteName: 'Mingle In Style',
      images: [
        {
          url: LOGO_URL,
          width: 866,
          height: 316,
          alt: 'Mingle In Style Logo',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Mingle In Style',
      description: 'Mingle In Style — your destination for fashion.',
      images: [LOGO_URL],
    },
    alternates: {
      types: {
        'application/rss+xml': [
          { url: `${SITE_URL}/product-feed.xml`, title: 'Mingle In Style Product Feed' },
        ],
      },
    },
    other: {
      'facebook-domain-verification': 'flizhy2vfsxveemy9ru8s4k3vggnzp',
    },
  };
}

export default async function RootLayout({ children }) {
  const pixelConfigs = await getPixelConfigs();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`storefront ${geistSans.variable} ${geistMono.variable} antialiased`}>
        <CookieConsentWrapper configs={pixelConfigs} />
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
          <AuthProvider>
            <RouteTracker />
            <CartProvider>
              <WishlistProvider>
                <Header>
                  {children}
                  <FloatingLauncher />
                </Header>
                <Footer />
                <Toaster position="top-center" reverseOrder={false} />
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
