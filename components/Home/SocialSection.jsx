'use client';

import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa';

const SOCIALS = [
    {
        icon: FaFacebookF,
        label: 'Facebook',
        href: 'https://web.facebook.com/mingleinstyle/',
        bg: 'bg-[#1877F2]',
    },
    {
        icon: FaInstagram,
        label: 'Instagram',
        href: 'https://www.instagram.com/mingleinstyle/',
        bg: 'bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]',
    },
    {
        icon: FaTiktok,
        label: 'TikTok',
        href: 'https://www.tiktok.com/@mingleinstyle',
        bg: 'bg-black',
    },
    {
        icon: FaYoutube,
        label: 'YouTube',
        href: 'https://www.youtube.com/@mingleinstyle',
        bg: 'bg-[#FF0000]',
    },
];

export default function SocialSection() {
    return (
        <section className="py-10 px-4 bg-white border-t border-gray-100 text-center">
            <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.3em] text-[#2EC4B6] mb-3">Follow us on</p>
            <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-8">
                @MingleInStyle
            </h2>
            <div className="flex justify-center gap-4">
                {SOCIALS.map(({ icon: Icon, label, href, bg }) => (
                    <Link
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className={`${bg} w-11 h-11 rounded-full flex items-center justify-center text-white hover:opacity-85 transition-opacity`}
                    >
                        <Icon className="w-4 h-4" />
                    </Link>
                ))}
            </div>
        </section>
    );
}
