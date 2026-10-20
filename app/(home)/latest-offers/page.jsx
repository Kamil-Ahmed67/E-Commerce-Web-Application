import Link from "next/link";
import { getProducts } from "@/lib/server/shopData";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";

export const metadata = {
    title: "Latest Offers | Mingle In Style",
    description: "Shop the latest deals and discounts at Mingle In Style.",
};

export default async function LatestOffersPage() {
    return (
        <section className="pt-[var(--header-height)] pb-16 bg-[#f3f4f6] min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-4">
                    <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Latest Offers', href: null }]} />
                </div>

                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Latest Offers</h1>
                    <p className="text-gray-500 text-base max-w-xl mx-auto">
                        Discover our best deals and exclusive discounts. Limited time only — grab yours before they&apos;re gone!
                    </p>
                </div>

                {/* Coming Soon / Placeholder */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-20 text-center">
                    <div className="text-6xl mb-6">🏷️</div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-3">Big Savings Coming Soon</h2>
                    <p className="text-gray-500 max-w-md mx-auto mb-8">
                        We&apos;re preparing amazing offers for you. Stay tuned for exclusive deals on your favourite brands.
                    </p>
                    <Link
                        href="/shop"
                        className="inline-block px-8 py-3 bg-[#32BBAB] text-white font-medium rounded-sm hover:bg-[#279487] transition-colors"
                    >
                        Browse All Products
                    </Link>
                </div>
            </div>
        </section>
    );
}
