import Image from 'next/image';
import { FiMapPin, FiClock, FiNavigation, FiMap, FiPhone } from 'react-icons/fi';

const DIRECTIONS_URL = 'https://www.google.com/maps/dir/?api=1&destination=23.8657703,90.3997771';
const MAP_VIEW_URL = 'https://www.google.com/maps?q=23.8657703,90.3997771&z=17';

const BRANDS = ['MINGLE', 'VIDJAR', 'PureNorth', 'AVASAA'];

export default function StoreLocationSection() {
  return (
    <section className="relative py-10 px-4 overflow-hidden bg-[#f4f3ef] border-t border-gray-100">
      {/* Map backdrop */}
      <Image
        src="/images/banner/store-map-bg.png"
        alt=""
        fill
        aria-hidden="true"
        sizes="100vw"
        className="object-cover pointer-events-none"
      />
      <div className="absolute inset-0 bg-[#f4f3ef]/55 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.3em] text-[#2EC4B6] mb-3">
            Mingle In Style
          </p>
          <h2 className="text-2xl md:text-3xl font-light text-gray-900">Visit Our Store</h2>
          <p className="text-gray-500 mt-1 text-xs md:text-sm">
            Discover all our brands under one roof.
          </p>
        </div>

        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-20 items-stretch">
          {/* Center map pin, desktop only */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 items-center justify-center">
            <span className="absolute w-16 h-16 rounded-full bg-[#32BBAB]/15" />
            <span className="relative w-11 h-11 rounded-full bg-[#32BBAB]/25 flex items-center justify-center">
              <span className="w-7 h-7 rounded-full bg-[#32BBAB] flex items-center justify-center shadow-md">
                <FiMapPin className="w-3.5 h-3.5 text-white" />
              </span>
            </span>
          </div>

          {/* Info card */}
          <div className="relative bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gray-500">
                Our Store
              </span>
              <span className="h-px flex-1 bg-gray-200" />
            </div>

            <h3 className="text-xl md:text-2xl font-light text-gray-900 mb-1">
              Visit Our Store
            </h3>
            <p className="text-sm text-gray-700 mb-2">Uttara Flagship Store</p>
            <span className="block w-8 h-[3px] bg-[#32BBAB] rounded-full mb-3" />

            <p className="text-gray-600 text-sm mb-4">
              Explore our full collection, styled and displayed under one roof.
            </p>

            <div className="divide-y divide-gray-100 mb-4">
              <div className="flex items-center gap-3 py-2 first:pt-0">
                <FiClock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <p className="text-gray-800 text-xs">
                  Open Thursday – Tuesday · 10:00 AM–10:00 PM
                </p>
              </div>
              <div className="flex items-center gap-3 py-2 last:pb-0">
                <FiMapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <div>
                  <p className="text-gray-800 text-xs font-medium">Uttara Flagship Store</p>
                  <p className="text-gray-500 text-xs">Fashion · Lifestyle · You</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <a
                href={DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs bg-[#32BBAB] text-white font-medium rounded-full hover:bg-[#279487] transition-colors"
              >
                <FiNavigation className="w-3.5 h-3.5" />
                Get Directions
              </a>
              <a
                href={MAP_VIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs bg-white text-gray-800 font-medium rounded-full border border-gray-300 hover:border-[#32BBAB] hover:text-[#32BBAB] transition-colors"
              >
                <FiMap className="w-3.5 h-3.5" />
                View on Map
              </a>
              <a
                href="tel:+8801302815322"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs bg-white text-gray-800 font-medium rounded-full border border-gray-300 hover:border-[#32BBAB] hover:text-[#32BBAB] transition-colors"
              >
                <FiPhone className="w-3.5 h-3.5" />
                Call Store
              </a>
            </div>
          </div>

          {/* Photo card */}
          <div className="relative flex flex-col justify-center">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 pb-3">
              <div className="relative rounded-lg overflow-hidden aspect-[4/3]">
                <Image
                  src="/images/banner/store-location-photo.png"
                  alt="Mingle In Style storefront"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain"
                />
              </div>
              <p className="text-center italic text-gray-500 text-xs mt-2">
                A space made for discovery
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 sm:gap-4 mt-3">
              {BRANDS.map((name, i) => (
                <span key={name} className="flex items-center gap-3 sm:gap-4">
                  <span className="text-[10px] sm:text-xs tracking-[0.2em] text-gray-500 font-medium">
                    {name}
                  </span>
                  {i < BRANDS.length - 1 && <span className="w-px h-3 bg-gray-300" />}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
