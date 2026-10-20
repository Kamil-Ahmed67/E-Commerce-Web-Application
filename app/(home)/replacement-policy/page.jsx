import Link from 'next/link'
import React from 'react'

export default function ReplacementPolicy() {
    return (
        <div className="min-h-screen manrope pt-42 bg-gray-100 py-10 px-12">
            <div className="mx-auto bg-white rounded-lg shadow-md p-8">
                <nav className="text-sm text-gray-500 mb-6">
                    <Link href="/" className="hover:underline">Home</Link>{' '}
                    / <span className="text-blue-600 font-medium">Replacement & Refund Policy</span>
                </nav>

                <h1 className="text-3xl font-bold mb-8">Replacement & Refund Policy</h1>

                {/* General Statement */}
                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Our Policy</h2>
                    <p className="text-gray-700">
                        At Mingle Fashion, we strive to ensure complete customer satisfaction. If you&apos;re not satisfied with your purchase, we offer replacement or refund options under the following conditions.
                    </p>
                </section>

                {/* Eligibility */}
                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Eligibility for Replacement/Refund</h2>
                    <p className="text-gray-700">
                        You may request a replacement or refund within 7 days of receiving your order if:
                    </p>
                    <ul className="list-disc pl-5 text-gray-700 mt-2 space-y-1">
                        <li>You received a wrong/damaged/defective product</li>
                        <li>The product doesn&apos;t match the description on our website</li>
                        <li>The product size doesn&apos;t fit (tags must be intact)</li>
                    </ul>
                    <p className="text-gray-700 mt-4">
                        Note: Some products like innerwear and accessories are not eligible for replacement/refund due to hygiene reasons unless defective.
                    </p>
                </section>

                {/* Additional Exchange Info */}
                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Exchange Policy</h2>
                    <ul className="list-disc pl-5 text-gray-700 mt-2 space-y-1">
                        <li>Exchanges can only be done once per product.</li>
                        <li>Products with major quality defects or wrong product/size/color may be exchanged.</li>
                        <li>Exchanges for regular-priced items are allowed within 7 days of delivery.</li>
                        <li>Discounted products are not eligible for exchange or refund.</li>
                        <li>Exchanges must be physically returned to any of our outlets in Bangladesh within 30 days of purchase.</li>
                        <li>Replacement is subject to stock availability.</li>
                        <li>Shipping costs are non-refundable.</li>
                    </ul>
                </section>

                {/* Conditions */}
                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Conditions for Replacement/Refund</h2>
                    <ul className="list-disc pl-5 text-gray-700 mt-2 space-y-1">
                        <li>Item must be unused and in original packaging with all tags attached</li>
                        <li>Accompanied by the original invoice or proof of purchase</li>
                        <li>Not washed, altered, or damaged after delivery</li>
                    </ul>
                </section>

                {/* Replacement Process */}
                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Replacement Process</h2>
                    <ol className="list-decimal pl-5 text-gray-700 space-y-2">
                        <li>Contact customer support within 7 days of delivery at <a href="mailto:info@minglefashionbd.com" className="text-blue-600 underline">info@minglefashionbd.com</a> or call +880 1302-815322.</li>
                        <li>Provide order details and photos if the product is defective/wrong.</li>
                        <li>Once approved, return the product physically to any outlet in Bangladesh.</li>
                        <li>After verification, replacement will be dispatched (subject to availability) or refund processed.</li>
                    </ol>
                    <p className="text-gray-700 mt-2">Replacement delivery time: 3-7 working days after approval.</p>
                </section>

                {/* Refund Process */}
                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Refund Process</h2>
                    <ul className="list-disc pl-5 text-gray-700 mt-2 space-y-1">
                        <li>Refunds are processed only for Cancelled, Pending, or Returned orders; &quot;Shipped&quot; orders are not refundable.</li>
                        <li>Upon receiving your refund request, our team will verify product receipt and order details.</li>
                        <li>Refund timelines depend on order status, VAT adjustments, and payment method.</li>
                        <li>For SSL Commerz payments: refunds may take 15-20 working days after processing from our side.</li>
                        <li>For bKash or Nagad payments: refunds may take 15-20 working days after processing from our side.</li>
                        <li>Cash-on-Delivery (COD) refunds will be processed via bKash or bank transfer.</li>
                        <li>Original shipping costs are non-refundable.</li>
                        <li>An additional processing fee may apply.</li>
                        <li>Provide order number, order date, contact number (from which order was created), payment method, and other relevant information.</li>
                    </ul>
                </section>

                {/* Non-Returnable Items */}
                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Non-Returnable Items</h2>
                    <ul className="list-disc pl-5 text-gray-700 mt-2 space-y-1">
                        <li>Innerwear, socks, and other hygiene products</li>
                        <li>Cosmetics and beauty products</li>
                        <li>Customized or personalized items</li>
                        <li>Gift cards / vouchers</li>
                        <li>Products marked as &quot;Final Sale&quot;</li>
                    </ul>
                </section>

                {/* Contact */}
                <section>
                    <h2 className="text-xl font-semibold mb-2">Contact Us</h2>
                    <p className="text-gray-700">
                        For any questions regarding our Replacement & Refund Policy, contact us at <a href="mailto:mingle1@minglefashionbd.com" className="text-blue-600 underline">info@minglefashionbd.com</a> or call +880 1302-815322 during business hours (10AM-10PM, Thursday-Tuesday).
                    </p>
                    <p className="text-gray-700 mt-4">
                        Note: We reserve the right to modify this policy at any time. Updates will be posted on this page.
                    </p>
                </section>
            </div>
        </div>
    )
}
