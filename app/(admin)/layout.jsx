'use client';

import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { Geist, Geist_Mono } from 'next/font/google';

import '../globals.css';
import { BrandProvider } from '@/provider/BrandProvider';
import { AuthContext, AuthProvider } from '@/provider/AuthProvider';
const Sidebar = dynamic(() => import('@/components/Admin/Sidebar'), { ssr: false });
const Navbar = dynamic(() => import('@/components/Admin/Navbar'), { ssr: false });
const Footer = dynamic(() => import('@/components/Admin/Footer'));

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

const InlineLoader = () => (
  <div className="fixed left-0 top-0 z-50 flex h-screen w-screen items-center justify-center bg-white">
    <div className="h-16 w-16 animate-spin rounded-full border-t-4 border-b-4 border-[#32BBAB]" />
  </div>
);

function AuthChecker({ children }) {
  const { loginData } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const cookieLoginData = document.cookie
      .split('; ')
      .find(row => row.startsWith('loginData='))
      ?.split('=')[1];

    const parsedData = cookieLoginData
      ? JSON.parse(decodeURIComponent(cookieLoginData))
      : null;

    if (!parsedData && !loginData) {
      const callbackUrl = window.location.pathname + window.location.search;
      router.push(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    } else if ((parsedData || loginData)?.UserRole !== 'Admin') {
      router.push('/');
    }
  }, [loginData, router]);

  if (!loginData || loginData.UserRole !== 'Admin') {
    return <InlineLoader />;
  }

  return <>{children}</>;
}

export default function AdminLayout({ children }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-theme="light"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <Head>
        <title>Admin Dashboard | Mingle Fashion</title>
        <meta
          name="description"
          content="Administrative dashboard for managing your application"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <body className="font-sans">
        {loading ? (
          <InlineLoader />
        ) : (
          <AuthProvider>
            <AuthChecker>
              <BrandProvider>
                <section className="flex">
                  <aside className="hidden sm:block">
                    <Sidebar />
                  </aside>

                  <div className="flex-1">
                    <header className="sticky top-0 z-50">
                      <Navbar />
                    </header>

                    <main className="bg-[#ECF0F4] min-h-[calc(120vh-232px)]">
                      {children}
                    </main>

                    <footer>
                      <Footer />
                    </footer>
                  </div>
                </section>
              </BrandProvider>
            </AuthChecker>
          </AuthProvider>
        )}

        <Toaster position="top-center" reverseOrder={false} />
      </body>
    </html>
  );
}
