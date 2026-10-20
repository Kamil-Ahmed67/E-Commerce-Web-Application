import Image from 'next/image';
import { getMetaByPath } from '@/lib/server/getMetaByPath';
import { getBannersByAccessKey } from '@/lib/server/bannerData';
import FindLocationTracker from '@/components/FindLocationTracker/FindLocationTracker';
import { FiMapPin, FiClock, FiPhone, FiMail, FiTruck, FiArrowRight, FiNavigation } from 'react-icons/fi';

export async function generateMetadata() {
    const meta = await getMetaByPath('/store-location');
    return {
        title: meta.title || "Store Location | Mingle In Style",
        description: meta.description || "Find Mingle In Style's store location in Uttara, Dhaka.",
    };
}

const DIRECTIONS_URL = 'https://www.google.com/maps/dir/?api=1&destination=23.8657703,90.3997771';
const MAP_EMBED_URL = 'https://www.google.com/maps?q=23.8657703,90.3997771&z=17&output=embed';

function IconFlagship(props) {
    return (
        <svg {...props} viewBox="0 0 24 24" fill="none">
            <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8A2387" />
                    <stop offset="50%" stopColor="#E94057" />
                    <stop offset="100%" stopColor="#F27121" />
                </linearGradient>
            </defs>
            <path stroke="url(#grad1)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
    );
}

function IconStyling(props) {
    return (
        <svg {...props} viewBox="0 0 24 24" fill="none">
            <defs>
                <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00c6ff" />
                    <stop offset="100%" stopColor="#0072ff" />
                </linearGradient>
            </defs>
            <path stroke="url(#grad2)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
    );
}

function IconAccess(props) {
    return (
        <svg {...props} viewBox="0 0 24 24" fill="none">
            <defs>
                <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#11998e" />
                    <stop offset="100%" stopColor="#38ef7d" />
                </linearGradient>
            </defs>
            <path stroke="url(#grad3)" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}

const highlights = [
    {
        icon: IconFlagship,
        title: 'One flagship space',
        desc: 'Explore our full collection, curated and displayed under one roof.',
    },
    {
        icon: IconStyling,
        title: 'Personal styling',
        desc: 'Expert advice from our team to help you find your perfect look.',
    },
    {
        icon: IconAccess,
        title: 'Easy access',
        desc: 'Lift service and on-site convenience for a comfortable visit.',
    },
];

function FiCheckIcon(props) {
    return (
        <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}

const gallery = [
    { src: '/images/about/MVP J09 (2).png', alt: 'Curated collection on display' },
    { src: '/images/about/MVP J09 (7).png', alt: 'Store interior detail' },
    { src: '/images/about/WMSKDI08 (1).png', alt: 'Styled looks in store' },
];

export default async function StoreLocationPage() {
    const [heroBanners, galleryBanners] = await Promise.all([
        getBannersByAccessKey('Location Hero'),
        getBannersByAccessKey('Location Gallery'),
    ]);
    const heroImage = heroBanners.find(b => b.isActive)?.bannerImage?.[0] || null;
    const galleryImages = galleryBanners
        .filter(b => b.isActive)
        .flatMap(b => b.bannerImage || [])
        .filter(Boolean);
    const displayGallery = galleryImages.length > 0
        ? galleryImages.map((src, i) => ({ src, alt: `Store photo ${i + 1}` }))
        : gallery;

    return (
        <section className="pt-[var(--header-height)] pb-0 bg-white min-h-screen">
            <FindLocationTracker />

            {/* Hero */}
            <div className="relative w-full overflow-hidden h-[calc(100vh-var(--header-height))] min-h-[480px] max-h-[720px]">
                <Image
                    src={heroImage || "/images/banner/store-location-photo.png"}
                    alt="Mingle In Style flagship storefront"
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/10" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                <div className="relative h-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-between pt-24 sm:pt-28 pb-8 sm:pb-10">
                    <div className="max-w-xl">
                        <h1 className="font-semibold uppercase text-4xl sm:text-6xl lg:text-7xl tracking-wide text-white leading-[1.05] mb-4">
                            Visit Our Store
                        </h1>
                        <p className="text-xl sm:text-2xl text-white/95 mb-2">Uttara Flagship Store</p>
                        <p className="text-white/70 text-sm sm:text-base mb-6">
                            Discover our full collection under one roof.
                        </p>
                        <div className="flex items-center gap-2 text-white/90 text-sm mb-6">
                            <FiClock className="w-4 h-4 text-[#32BBAB]" />
                            Open Thursday – Tuesday · 10:00 AM–10:00 PM
                        </div>
                        <a
                            href="#plan-visit"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0d1b1e] text-white text-sm font-medium rounded-full hover:bg-black transition-colors"
                        >
                            Plan Your Visit <FiArrowRight className="w-4 h-4" />
                        </a>
                    </div>

                    <div>
                        <div className="flex flex-wrap items-center gap-4 sm:gap-5 text-white/80 text-sm mb-4">
                            <a
                                href={DIRECTIONS_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 hover:text-white transition-colors"
                            >
                                <FiMapPin className="w-4 h-4" />
                                Get Directions
                            </a>
                            <span className="h-4 w-px bg-white/30" />
                            <a
                                href="#plan-visit"
                                className="inline-flex items-center gap-2 hover:text-white transition-colors"
                            >
                                <FiNavigation className="w-4 h-4" />
                                View on Map
                            </a>
                            <span className="h-4 w-px bg-white/30" />
                            <a
                                href="tel:+8801302815322"
                                className="inline-flex items-center gap-2 hover:text-white transition-colors"
                            >
                                <FiPhone className="w-4 h-4" />
                                Call Store
                            </a>
                        </div>
                        <span className="block h-px w-16 bg-white/20 mb-4" />
                        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/50">
                            Fashion Brings Us Together
                        </p>
                    </div>
                </div>

                {/* Mini map card */}
                <a
                    href={DIRECTIONS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden sm:block absolute bottom-10 sm:bottom-14 right-4 sm:right-6 lg:right-8 w-52 rounded-xl overflow-hidden bg-white shadow-lg"
                >
                    <div className="h-24 w-full relative bg-gray-100">
                        <iframe
                            title="Mini map preview"
                            src={MAP_EMBED_URL}
                            width="100%"
                            height="100%"
                            style={{ border: 0, pointerEvents: 'none' }}
                            loading="lazy"
                        />
                    </div>
                    <div className="px-3 py-2 text-xs font-medium text-gray-800">Dhaka Flagship Store</div>
                </a>
            </div>

            {/* More than a store */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12 pb-10 sm:pb-12 overflow-hidden">
                <style>{`
                    @keyframes drawLine {
                        0% { height: 0; opacity: 0; }
                        100% { height: 100%; opacity: 1; }
                    }
                    @keyframes popNode {
                        0% { transform: scale(0); opacity: 0; }
                        70% { transform: scale(1.2); opacity: 1; }
                        100% { transform: scale(1); opacity: 1; }
                    }
                    @keyframes slideFadeText {
                        0% { transform: translateX(-20px); opacity: 0; }
                        100% { transform: translateX(0); opacity: 1; }
                    }
                    @keyframes imageFade {
                        0% { opacity: 0; transform: scale(0.95); }
                        100% { opacity: 1; transform: scale(1); }
                    }
                    .animate-draw-line {
                        animation: drawLine 1.5s ease-out forwards;
                    }
                    .timeline-node {
                        opacity: 0;
                        animation: popNode 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                    }
                    .timeline-content {
                        opacity: 0;
                        animation: slideFadeText 0.6s ease-out forwards;
                    }
                    .animate-image-fade {
                        opacity: 0;
                        animation: imageFade 1s ease-out forwards;
                    }
                    .delay-1 { animation-delay: 0.4s; }
                    .delay-2 { animation-delay: 0.8s; }
                    .delay-3 { animation-delay: 1.2s; }
                    .delay-img-1 { animation-delay: 0.2s; }
                    .delay-img-2 { animation-delay: 0.6s; }
                    .delay-img-3 { animation-delay: 1.0s; }
                `}</style>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="h-[2px] w-8 bg-[#32BBAB]" />
                            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#32BBAB]">
                                The Mingle Experience
                            </span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-light text-gray-900 mb-8">
                            More Than a Store
                        </h2>

                        <div className="relative space-y-10 pl-8">
                            {/* Animated Line */}
                            <div className="absolute left-[9px] top-4 w-[2px] h-[calc(100%-2rem)] bg-gray-100">
                                <div className="absolute top-0 left-0 w-full bg-gradient-to-b from-[#8A2387] via-[#00c6ff] to-[#38ef7d] animate-draw-line" style={{ height: '100%' }} />
                            </div>

                            {highlights.map((item, i) => {
                                const Icon = item.icon;
                                const delayClass = `delay-${i + 1}`;
                                return (
                                    <div key={i} className="relative flex items-start gap-6">
                                        <div className={`absolute -left-[42px] top-2 w-4 h-4 rounded-full bg-white border-[3px] border-gray-900 shadow-md z-10 timeline-node ${delayClass}`} />
                                        
                                        <div className={`timeline-content ${delayClass} flex items-start gap-5`}>
                                            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 border border-gray-100/50">
                                                <Icon className="w-7 h-7" />
                                            </div>
                                            <div className="pt-0.5">
                                                <p className="text-gray-900 font-medium text-lg">{item.title}</p>
                                                <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">{item.desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative col-span-2 rounded-2xl overflow-hidden bg-gray-100 min-h-[240px] sm:min-h-[280px] shadow-sm animate-image-fade delay-img-1">
                            <Image
                                src={displayGallery[0].src}
                                alt={displayGallery[0].alt}
                                fill
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                className="object-cover"
                            />
                        </div>
                        {displayGallery.slice(1).map((img, i) => (
                            <div
                                key={i}
                                className={`relative rounded-2xl overflow-hidden bg-gray-100 min-h-[160px] sm:min-h-[180px] shadow-sm animate-image-fade delay-img-${i + 2}`}
                            >
                                <Image
                                    src={img.src}
                                    alt={img.alt}
                                    fill
                                    sizes="(max-width: 1024px) 50vw, 25vw"
                                    className="object-cover"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Map + Plan your visit */}
            <div id="plan-visit" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12 pb-10 sm:pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4 items-start">
                    <div className="rounded-2xl overflow-hidden border border-gray-100 min-h-[320px]">
                        <iframe
                            title="Mingle Fashion Store Location"
                            src={MAP_EMBED_URL}
                            width="100%"
                            height="100%"
                            style={{ border: 0, minHeight: '320px' }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-[#f8faf9] p-6 sm:p-8">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="h-[2px] w-8 bg-[#32BBAB]" />
                            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#32BBAB]">
                                Plan Your Visit
                            </span>
                        </div>
                        <h3 className="text-2xl font-light text-gray-900 mb-6">Dhaka Flagship Store</h3>

                        <div className="space-y-4 mb-6">
                            <div className="flex items-start gap-3">
                                <FiClock className="w-4 h-4 text-[#32BBAB] mt-1 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Store Hours</p>
                                    <p className="text-gray-500 text-sm">Thursday – Tuesday · 10:00 AM–10:00 PM</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <FiMapPin className="w-4 h-4 text-[#32BBAB] mt-1 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Address</p>
                                    <p className="text-gray-500 text-sm">ROAD-33, SECTOR-3, BALY COMPLEX</p>
                                    <p className="text-gray-500 text-sm">Ajampur, Uttara, Dhaka-1230</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <FiPhone className="w-4 h-4 text-[#32BBAB] mt-1 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Contact</p>
                                    <a href="tel:+8801302815322" className="text-gray-500 text-sm hover:text-[#32BBAB] transition-colors">
                                        +880 1302-815322
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <FiMail className="w-4 h-4 text-[#32BBAB] mt-1 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Email</p>
                                    <a href="mailto:info@minglefashionbd.com" className="text-gray-500 text-sm hover:text-[#32BBAB] transition-colors">
                                        info@minglefashionbd.com
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <FiCheckIcon className="w-4 h-4 text-[#32BBAB] mt-1 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Accessibility</p>
                                    <p className="text-gray-500 text-sm">Lift service available</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <a
                                href={DIRECTIONS_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#32BBAB] text-white text-sm font-medium rounded-full hover:bg-[#279487] transition-colors"
                            >
                                <FiNavigation className="w-4 h-4" />
                                Get Directions
                            </a>
                            <a
                                href="tel:+8801302815322"
                                className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-800 text-sm font-medium rounded-full hover:border-[#32BBAB] hover:text-[#32BBAB] transition-colors"
                            >
                                <FiPhone className="w-4 h-4" />
                                Call Store
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Closing CTA */}
            <div className="bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="relative pb-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-200">
                        <p className="text-gray-900 text-lg sm:text-xl font-light text-center sm:text-left">
                            Fashion for everyone. A brighter you, waiting in Uttara.
                        </p>
                        <a
                            href={DIRECTIONS_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 text-[#32BBAB] text-sm sm:text-base font-medium hover:text-[#279487] transition-colors whitespace-nowrap"
                        >
                            Visit Mingle In Style
                            <span className="w-9 h-9 rounded-full bg-[#32BBAB] flex items-center justify-center flex-shrink-0">
                                <FiArrowRight className="w-4 h-4 text-white" />
                            </span>
                        </a>
                        <span className="absolute left-0 -bottom-px h-[2px] w-16 bg-[#32BBAB]" />
                    </div>
                </div>
            </div>
        </section>
    );
}
