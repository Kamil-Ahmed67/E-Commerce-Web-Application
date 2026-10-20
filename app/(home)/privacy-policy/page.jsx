import Link from 'next/link'
import React from 'react'

export default function Privacy() {
    return (
        <div className="min-h-screen manrope pt-42 bg-gray-100 py-10 px-12">
            <div className=" mx-auto bg-white rounded-lg shadow-md p-8">
                <nav className="text-sm text-gray-500 mb-6">
                    <Link href="/" className="hover:underline">
                        Home
                    </Link>{' '}
                    / <span className="text-blue-600 font-medium">Privacy Policy</span>
                </nav>

                <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Who Are We?</h2>
                    <p className="text-gray-700">
                        Mingle Fashion is a new name in the Fashion Era of Bangladesh. Our aim is to serve our customers with the best quality products at a very reasonable price.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">What Do We Do with Your Information?</h2>
                    <p className="text-gray-700">
                        Our E-commerce website may collect various type of required information if you want to place an order for the desired product you want to buy from us using the website. When you purchase something from our online store through the website, as part of the buying and selling process, we collect the personal information you give us such as your name, address and email address.
                    </p>
                    <p className="text-gray-700 mt-4">
                        We will receive, store and process your data for preparing your purchase order on our E-commerce site and will save it for any possible future allegation. We usually collect personal information such as your title, name, gender, date of birth, email address, postal address, delivery address (if different), telephone number, mobile number, payment procedure and another similar kind of information.
                    </p>
                    <p className="text-gray-700 mt-4">
                        When you browse our store, we also automatically receive your computer’s internet protocol (IP) address in order to provide us with information that helps us learn about your browser and operating system. With your permission, we may send you emails about our store, new products, and other updates.
                    </p>
                    <p className="text-gray-700 mt-4">
                        However, if you use a credit or debit card for your purchases we will collect your card-related information and your signature in order to process your payment. We may also collect your suggestions, complaints or enquiries through emails or complaint/suggestion forms.
                    </p>
                </section>
                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Third Party Policy</h2>
                    <p className="text-gray-700">
                        We may pass your details to other companies affiliated with us only for the purpose of providing you better service. We may pass your details to our agents and subcontractors to help with analyzing data and providing us with marketing or customer service assistance.
                    </p>
                    <p className="text-gray-700 mt-4">
                        We may also use third parties to assist us with delivering products to you and to help us to collect payments from you. In general, the third-party providers contacted by us will only collect, use and disclose your information to the extent necessary to allow them to perform the services they provide to us.
                    </p>
                    <p className="text-gray-700 mt-4">
                        However, certain third-party service providers, such as payment gateways and other payment transaction processors, have their own privacy policies in respect to the information we are required to provide to them for your purchase-related transactions.
                    </p>
                </section>
                <section className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">Security of Your Information</h2>
                    <p className="text-gray-700">
                        To protect your personal information, we take reasonable precautions and follow industry best practices to make sure that it is not inappropriately lost, misused, accessed, disclosed, altered or destroyed.
                    </p>
                    <p className="text-gray-700 mt-4">
                        If you make shopping with your credit card, the information will be encrypted using secure socket layer technology (SSL). Although no method of transmission over the Internet or electronic storage is 100% secure, we follow all PCI-DSS requirements and implement additional generally accepted industry standards.
                    </p>
                    <p className="text-gray-700 mt-4">
                        We may disclose your personal information if we are required by law to do so or if you violate our Terms of Service. Visit our Terms and Conditions page to learn more about our complete terms of service.
                    </p>
                </section>
                <section>
                    <h2 className="text-xl font-semibold mb-2">Your Right to Withdraw & Change</h2>
                    <p className="text-gray-700">
                        If you change your mind, you may withdraw your consent for us to contact you. For the continued collection,
                        use or disclosure of your information and if you would like to access, correct,
                        amend or delete any personal information which we have about you, register a complaint,
                        or simply want more information, contact us at <a href="mailto:info@minglefashionbd.com" className="text-blue-600 underline">info@minglefashionbd.com</a>.
                    </p>
                </section>
            </div>
        </div>
    )
}
