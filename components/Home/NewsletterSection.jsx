'use client';

import Image from 'next/image';

export default function NewsletterSection() {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    console.log('Subscribing:', {
      email: formData.get('email'),
      phone: formData.get('phone'),
      location: formData.get('location'),
    });
  };

  return (
    <section className="py-6 px-4 overflow-hidden border-t border-gray-100">
      <div className="relative overflow-hidden rounded-sm">
        <Image
          src="/images/shapes/news.png"
          alt="Newsletter background"
          fill
          className="absolute object-cover"
        />
        <div className="absolute right-0 top-0 w-full max-w-130.75 h-full bg-linear-to-r from-transparent to-[#32BBAB] opacity-90"
          style={{ clipPath: 'polygon(20% 0%, 100% 0%, 100% 100%, 0% 100%)' }}
        />
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-4 sm:px-8 py-6">
          <div className="w-full lg:w-1/2">
            <h2 className="text-white font-bold text-base sm:text-lg xl:text-xl">
              Subscribe to receive news about the latest offers & discount codes
            </h2>
          </div>
          <div className="w-full lg:w-1/2">
            <form onSubmit={handleSubmit} suppressHydrationWarning className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  suppressHydrationWarning
                  type="email"
                  name="email"
                  placeholder="Email address"
                  autoComplete="email"
                  className="w-full bg-white bg-opacity-90 text-gray-700 border border-gray-200 outline-none rounded-sm placeholder:text-gray-500 py-2 px-3 text-sm focus:ring-2 focus:ring-[#32BBAB]"
                  required
                />
                <input
                  suppressHydrationWarning
                  type="tel"
                  name="phone"
                  placeholder="Phone number"
                  autoComplete="tel"
                  className="w-full bg-white bg-opacity-90 text-gray-700 border border-gray-200 outline-none rounded-sm placeholder:text-gray-500 py-2 px-3 text-sm focus:ring-2 focus:ring-[#32BBAB]"
                />
              </div>
              <div className="flex items-center gap-5">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="location" value="Inside bangladesh" defaultChecked className="accent-[#32BBAB] w-3.5 h-3.5" />
                  <span className="text-white text-xs">Inside bangladesh</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="location" value="Outside bangladesh" className="accent-[#32BBAB] w-3.5 h-3.5" />
                  <span className="text-white text-xs">Outside Bangladesh</span>
                </label>
              </div>
              <button
                suppressHydrationWarning
                type="submit"
                className="inline-flex justify-center py-2 px-6 text-sm text-white bg-gray-800 font-medium rounded-sm transition-all duration-200 hover:bg-gray-900"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}