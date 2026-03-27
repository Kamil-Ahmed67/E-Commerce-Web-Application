import React from 'react';
import Link from 'next/link';

export default function TermsAndConditions() {
    return (
        <div className="min-h-screen pt-34 bg-gray-100 py-10 px-12">
            <div className="mx-auto bg-white rounded-lg shadow-md p-8">
                <nav className="text-sm text-gray-500 mb-6">
                    <Link href="/" className="hover:underline">
                        Home
                    </Link>{' '}
                    / <span className="text-blue-600 font-medium">Terms & Conditions</span>
                </nav>

                <h1 className="text-3xl font-bold mb-8">Terms & Conditions</h1>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Introduction</h2>
                    <p className="text-gray-700">
                        Welcome to Mingle Fashion. These Terms & Conditions outline the rules and regulations for the use of our website and services. By accessing this website, we assume you accept these terms and conditions in full.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Intellectual Property Rights</h2>
                    <p className="text-gray-700">
                        Unless otherwise stated, Mingle Fashion and/or its licensors own the intellectual property rights for all material on this website. All intellectual property rights are reserved.
                    </p>
                    <p className="text-gray-700 mt-4">
                        You may view and/or print pages from this website for your own personal use subject to restrictions set in these terms and conditions.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">User Responsibilities</h2>
                    <p className="text-gray-700">
                        You must not:
                    </p>
                    <ul className="list-disc pl-5 text-gray-700 mt-2 space-y-1">
                        <li>Republish material from this website</li>
                        <li>Sell, rent or sub-license material from the website</li>
                        <li>Reproduce, duplicate or copy material from this website</li>
                        <li>Redistribute content from this website (unless content is specifically made for redistribution)</li>
                        <li>Use this website in any way that causes damage to the website or impairs its availability</li>
                    </ul>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Ordering & Payments</h2>
                    <p className="text-gray-700">
                        By placing an order through our website, you warrant that you are legally capable of entering into binding contracts and that the information you provide is accurate and complete.
                    </p>
                    <p className="text-gray-700 mt-4">
                        We accept various payment methods including credit/debit cards and mobile banking. All payments are processed securely. Prices are subject to change without notice.
                    </p>
                    <p className="text-gray-700 mt-4">
                        We reserve the right to refuse or cancel any order at any time for reasons including but not limited to product availability, errors in product or pricing information, or suspected fraud.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Delivery & Returns</h2>
                    <p className="text-gray-700">
                        Delivery times are estimates only and are not guaranteed. We are not responsible for any delays caused by third-party delivery services or circumstances beyond our control.
                    </p>
                    <p className="text-gray-700 mt-4">
                        Our return policy allows for returns within 7 days of receiving your order, provided the items are unused, in their original packaging, and with all tags attached. Some items may be exempt from returns.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Limitation of Liability</h2>
                    <p className="text-gray-700">
                        Mingle Fashion will not be liable for any indirect, special, incidental, or consequential damages arising out of the use of or inability to use the materials on this website.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Governing Law</h2>
                    <p className="text-gray-700">
                        These terms and conditions are governed by and construed in accordance with the laws of Bangladesh, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">Changes to Terms</h2>
                    <p className="text-gray-700">
                        We reserve the right to modify these terms at any time. Your continued use of the website following any changes constitutes your acceptance of the new terms. For any questions regarding these terms, please contact us at <a href="mailto:info@minglefashionbd.com" className="text-blue-600 underline">info@minglefashionbd.com</a>.
                    </p>
                </section>
            </div>
        </div>
    );
}