import Link from 'next/link'
import React from 'react'

export default function DeliveryTimeline() {
    return (
        <div className="min-h-screen manrope pt-42 bg-gray-100 py-10 px-12">
            <div className="mx-auto bg-white rounded-lg shadow-md p-8">
                <nav className="text-sm text-gray-500 mb-6">
                    <Link href="/" className="hover:underline">
                        Home
                    </Link>{' '}
                    / <span className="text-teal-600 font-medium">Delivery Timeline Policy</span>
                </nav>

                <h1 className="text-3xl font-bold mb-8">Delivery Timeline Policy</h1>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Our Delivery Commitment</h2>
                    <p className="text-gray-700">
                        At Mingle Fashion, we strive to deliver your orders as quickly and efficiently as possible. This policy outlines our standard delivery timelines and what you can expect when ordering from us.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Standard Delivery Timelines</h2>
                    <p className="text-gray-700">
                        Our standard delivery times are:
                    </p>
                    <ul className="list-disc pl-5 text-gray-700 mt-2 space-y-1">
                        <li><strong>Dhaka City:</strong> 1-3 business days</li>
                        <li><strong>Other Divisional Cities:</strong> 3-5 business days</li>
                        <li><strong>District Areas:</strong> 5-7 business days</li>
                        <li><strong>Remote Areas:</strong> 7-10 business days</li>
                    </ul>
                    <p className="text-gray-700 mt-4">
                        Note: Business days exclude Fridays and public holidays.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Order Processing Time</h2>
                    <p className="text-gray-700">
                        All orders are processed within:
                    </p>
                    <ul className="list-disc pl-5 text-gray-700 mt-2 space-y-1">
                        <li><strong>Regular Hours (9AM-6PM):</strong> Within 24 hours</li>
                        <li><strong>After Hours:</strong> Next business day</li>
                        <li><strong>Weekends & Holidays:</strong> Next business day</li>
                    </ul>
                    <p className="text-gray-700 mt-4">
                        You will receive a confirmation email with tracking information once your order has been shipped.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Express Delivery Option</h2>
                    <p className="text-gray-700">
                        For urgent deliveries, we offer express shipping:
                    </p>
                    <ul className="list-disc pl-5 text-gray-700 mt-2 space-y-1">
                        <li><strong>Dhaka City:</strong> Same day delivery (if ordered before 12PM)</li>
                        <li><strong>Other Cities:</strong> 24-48 hours</li>
                    </ul>
                    <p className="text-gray-700 mt-4">
                        Additional charges apply for express delivery. Available at checkout.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Factors Affecting Delivery</h2>
                    <p className="text-gray-700">
                        Occasionally, delivery may be delayed due to:
                    </p>
                    <ul className="list-disc pl-5 text-gray-700 mt-2 space-y-1">
                        <li>Public holidays or weekends</li>
                        <li>Inclement weather or natural disasters</li>
                        <li>Customs clearance (for international orders)</li>
                        <li>Unforeseen circumstances beyond our control</li>
                    </ul>
                    <p className="text-gray-700 mt-4">
                        We will notify you promptly if there are any delays affecting your order.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Tracking Your Order</h2>
                    <p className="text-gray-700">
                        You can track your order through:
                    </p>
                    <ul className="list-disc pl-5 text-gray-700 mt-2 space-y-1">
                        <li>The tracking link provided in your shipping confirmation email</li>
                        <li>Your account order history on our website</li>
                        <li>By contacting our customer support team</li>
                    </ul>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Failed Deliveries</h2>
                    <p className="text-gray-700">
                        If delivery fails due to incorrect address or recipient unavailability:
                    </p>
                    <ul className="list-disc pl-5 text-gray-700 mt-2 space-y-1">
                        <li>We will attempt delivery 2 more times</li>
                        <li>After 3 failed attempts, the order will be returned to us</li>
                        <li>Additional shipping charges may apply for resending the order</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">Contact Us</h2>
                    <p className="text-gray-700">
                        For any questions about our Delivery Timeline Policy, please contact us at <a href="mailto:mingle1@minglefashionbd.com" className="text-blue-600 underline">mingle1@minglefashionbd.com</a> or call +880 1332546940 during business hours (9AM-6PM, Saturday-Thursday).
                    </p>
                    <p className="text-gray-700 mt-4">
                        Note: We reserve the right to modify this policy at any time. Any changes will be posted on this page.
                    </p>
                </section>
            </div>
        </div>
    )
}
