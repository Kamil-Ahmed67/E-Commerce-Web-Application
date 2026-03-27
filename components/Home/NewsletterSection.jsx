'use client';

import Image from 'next/image';

export default function NewsletterSection() {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');

    // Add your newsletter subscription logic here
    console.log('Subscribing email:', email);
  };

  return (
    <section className="py-16 overflow-hidden">
      <div className="max-w-292.5 mx-auto px-4 sm:px-8 xl:px-0">
        <div className="relative overflow-hidden rounded-xl min-h-50">
          <Image
            src="/images/shapes/news.png"
            alt="Newsletter background"
            fill
            className="absolute object-cover rounded-xl"
          />
          <div className="absolute right-0 top-0 w-full max-w-130.75 h-full bg-linear-to-r from-transparent to-[#32BBAB] opacity-90"
            style={{ clipPath: 'polygon(20% 0%, 100% 0%, 100% 100%, 0% 100%)' }}
          />
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 px-4 sm:px-8 xl:px-12 py-11">
            <div className="max-w-122.75 w-full">
              <h2 className="max-w-99.75 text-white font-bold text-lg sm:text-xl xl:text-2xl mb-3">
                Don&apos;t Miss Out Latest Collections & Offers
              </h2>
              <p className="text-white">
                Register to receive news about the latest offers & discount codes
              </p>
            </div>
            <div className="max-w-119.25 w-full">
              <form onSubmit={handleSubmit} suppressHydrationWarning>
                <div className="flex flex-col sm:flex-row gap-4" suppressHydrationWarning>
                  <input
                    suppressHydrationWarning
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    autoComplete="email"
                    className="w-full bg-white bg-opacity-90 text-gray-700 border border-gray-200 outline-none rounded-sm placeholder:text-gray-600 py-3 px-5 focus:ring-2 focus:ring-[#32BBAB]"
                    required
                  />
                  <button
                    suppressHydrationWarning
                    type="submit"
                    className="inline-flex justify-center py-3 px-7 text-white bg-gray-800 font-medium rounded-sm transition-all duration-200 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#32BBAB]"
                  >
                    Subscribe
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}