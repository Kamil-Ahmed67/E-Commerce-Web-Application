'use client';
import { Suspense } from "react";
import { CartProvider } from "../../provider/CartProvider";
import { AuthProvider } from "../../provider/AuthProvider";
import dynamic from "next/dynamic";
const Navbar = dynamic(() => import("./Navbar"), {
  ssr: false,
  loading: () => <div className="h-16 bg-black animate-pulse" />,
});

export default function Header({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        <Suspense fallback={<div className="h-16 bg-gray-100 animate-pulse" />}>
          <Navbar />
        </Suspense>

        {children}
      </CartProvider>
    </AuthProvider>
  );
}
