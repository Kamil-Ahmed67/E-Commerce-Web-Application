import Link from "next/link";
import Image from "next/image";
import SubscribeForm from "./SubscribeForm";
import FooterAccordion from "./FooterAccordion";
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa";

const socialLinks = [
  { icon: <FaFacebookF size={14} />, href: "https://web.facebook.com/mingleinstyle/", label: "Facebook" },
  { icon: <FaInstagram size={14} />, href: "https://www.instagram.com/mingleinstyle/", label: "Instagram" },
  { icon: <FaTiktok size={14} />, href: "https://www.tiktok.com/@mingleinstyle", label: "TikTok" },
  { icon: <FaYoutube size={14} />, href: "https://youtube.com/@mingleinstylebd", label: "YouTube" },
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="manrope">

      {/* Subscribe section */}
      <div className="bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="lg:w-1/2">
            <h2 className="text-white font-bold text-lg sm:text-xl leading-snug">
              Stay updated with exclusive deals, new arrivals and more.
            </h2>
          </div>
          <SubscribeForm />
        </div>
      </div>

      {/* Main footer body */}
      <div className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 pt-4 lg:pt-14 pb-0">

          {/* Top section — links */}
          <div className="pb-2 lg:pb-10 border-b border-gray-100">
            <FooterAccordion />
          </div>

          {/* Bottom row — SSL | Stay Connected (desktop only) | copyright */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            {/* Stay Connected — mobile: top, desktop: center */}
            <div className="flex flex-col items-center gap-2 sm:hidden">
              <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-widest">Stay Connected</h4>
              <div className="flex gap-3">
                {socialLinks.map(({ icon, href, label }) => (
                  <Link key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-[#32BBAB] hover:text-[#32BBAB] transition-all duration-200">
                    {icon}
                  </Link>
                ))}
              </div>
            </div>

            <a href="https://www.sslcommerz.com" target="_blank" rel="noopener noreferrer">
              <img src="/images/SSL Commerze.png" alt="SSLCommerz - Pay With"
                style={{ height: '36px', width: 'auto', display: 'block' }} />
            </a>

            {/* Stay Connected — desktop only */}
            <div className="hidden sm:flex flex-col items-center gap-2">
              <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-widest">Stay Connected</h4>
              <div className="flex gap-3">
                {socialLinks.map(({ icon, href, label }) => (
                  <Link key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-[#32BBAB] hover:text-[#32BBAB] transition-all duration-200">
                    {icon}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-1 text-xs text-gray-400">
              <span>&copy; {year} Mingle Fashion. All rights reserved. &bull; Version 3.24</span>
              <span className="font-mono text-gray-500 tracking-wide">
                e-Trade Licence &nbsp;TRAD/DNCC/152619/2022
              </span>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
