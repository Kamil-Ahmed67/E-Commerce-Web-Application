import Link from "next/link";
import Image from "next/image";
import {
  FaFacebookF,
  FaInstagram,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaTwitter,
  FaLinkedinIn,
} from "react-icons/fa";

const socialLinks = [
  {
    icon: <FaFacebookF />,
    href: "https://www.facebook.com/share/1Bs6grMw7X/?mibextid=wwXIfr",
    label: "Facebook",
  },
  { icon: <FaTwitter />, href: "#", label: "Twitter" },
  {
    icon: <FaInstagram />,
    href: "https://www.instagram.com/mingle.fashion?igsh=cTNqd295OG0ybm50",
    label: "Instagram",
  },
  { icon: <FaLinkedinIn />, href: "#", label: "LinkedIn" },
];

const paymentMethods = [
  { src: "/images/payment/bkash.png", alt: " bKash" },
  { src: "/images/payment/nagad.png", alt: "Nagad" },
  { src: "/images/payment/rocket.png", alt: "Rocket" },
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white manrope border-t border-gray-100">
      <div className="px-6 py-12 text-sm text-gray-700">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-3 text-gray-800">Contact Us</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <FaMapMarkerAlt className="mt-1 w-6 text-teal-600" />
                <span>ROAD-33,SECTOR-3, BALY COMPLEX, AJAMPUR, UTTARA, DHAKA-1230</span>
              </li>
              <li className="flex items-center gap-2">
                <FaPhoneAlt className="text-teal-600" />
                <span>+880 1302-815322</span>
              </li>
              <li className="flex items-center gap-2">
                <FaEnvelope className="text-teal-600" />
                <span>info@minglefashionbd.com</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-3 text-gray-800">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/signin" className="hover:text-teal-600">Login / Register</Link></li>
              <li><Link href="/cart" className="hover:text-teal-600">Cart</Link></li>
              <li><Link href="/wishlist" className="hover:text-teal-600">Wishlist</Link></li>
              <li><Link href="/shop" className="hover:text-teal-600">Shop</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-semibold mb-3 text-gray-800">Policies</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy-policy" className="hover:text-teal-600">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-teal-600">Terms & Condition</Link></li>
              <li><Link href="/replacement-policy" className="hover:text-teal-600">Refund Policy</Link></li>
              <li><Link href="/delivery-timeline" className="hover:text-teal-600">Delivery Timeline</Link></li>
            </ul>
          </div>

          {/* Our Brands */}
          <div>
            <h4 className="font-semibold mb-3 text-gray-800">Our Brands</h4>
            <ul className="space-y-2">
              <li><Link href="/brands/mingle" className="hover:text-teal-600">Mingle</Link></li>
              <li><Link href="/brands/vidjar" className="hover:text-teal-600">Vidjar</Link></li>
              <li><Link href="/brands/avasa" className="hover:text-teal-600">Avasaa</Link></li>
              <li><Link href="/brands/purenorth" className="hover:text-teal-600">PureNorth</Link></li>
            </ul>
          </div>

          {/* Social & Payment */}
          <div>
            <h4 className="font-semibold mb-3 text-gray-800">Stay Connected</h4>
            <div className="flex gap-4 mb-4">
              {socialLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  aria-label={link.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-teal-600 text-lg"
                >
                  {link.icon}
                </Link>
              ))}
            </div>

            <h4 className="font-semibold text-gray-800">We Accept</h4>
            <div className="flex gap-2 items-center">
              {paymentMethods.map((method, index) => (
                <Image
                  key={index}
                  src={method.src}
                  alt={method.alt}
                  width={70}
                  height={34}
                  className="object-contain"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-300 pt-12 text-center text-gray-600 text-xs">
          &copy; {year} Mingle Fashion. All rights reserved. • Version 1.6
        </div>
      </div>
    </footer>
  );
};

export default Footer;
