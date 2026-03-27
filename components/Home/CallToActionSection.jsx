'use client';

import Link from 'next/link';

export default function CallToActionSection() {
  return (
    <section 
      className="bg-center manrope  bg-cover bg-no-repeat"
      style={{ backgroundImage: "url('/images/banner/bms-footer2.jpg')" }}
    >
      <div className="py-20 px-4 sm:px-6 lg:px-8 text-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Shop?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Join thousands of satisfied customers enjoying our premium products and exceptional service.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/shop"
            className="bg-[#32BBAB] hover:bg-[#5b9790] text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 inline-block"
          >
            Browse Products
          </Link>
          <Link
            href="/contact"
            className="bg-transparent hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-full border border-white text-lg transition duration-300 inline-block"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}