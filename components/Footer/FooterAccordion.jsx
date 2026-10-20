'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/provider/AuthProvider';
import { useCart } from '@/provider/CartProvider';

const categorySection = {
  title: 'Category',
  groups: [
    {
      links: [
        { label: 'Men', href: '/men' },
        { label: 'Women', href: '/women' },
      ],
    },
    {
      label: 'Brands',
      links: [
        { label: 'Mingle', href: '/brands/mingle' },
        { label: 'Vidjar', href: '/brands/vidjar' },
        { label: 'Avasaa', href: '/brands/avasa' },
        { label: 'PureNorth', href: '/brands/purenorth' },
      ],
    },
  ],
};

const staticSections = [
  {
    title: 'Explore',
    links: [
      { label: 'Our Story', href: '/about' },
      { label: 'Store Location', href: '/store-location' },
      { label: 'News & Events', href: '/blog' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    title: 'Support & Care',
    links: [
      { label: 'Customer Service', href: '/contact' },
      { label: 'Shipping & Delivery', href: '/delivery-timeline' },
    ],
  },
  {
    title: 'More',
    links: [
      { label: 'Terms & Conditions', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Return & Refund Policy', href: '/replacement-policy' },
    ],
  },
];

function LinkItem({ link, mobile }) {
  const cls = mobile
    ? 'text-sm text-gray-500 hover:text-[#32BBAB] transition-colors text-left'
    : 'text-sm text-gray-400 hover:text-[#32BBAB] transition-colors text-left';

  if (link.action) {
    return <button onClick={link.action} className={cls}>{link.label}</button>;
  }
  return <Link href={link.href} className={cls}>{link.label}</Link>;
}

export default function FooterAccordion() {
  const [openIndex, setOpenIndex] = useState(null);
  const [brandsOpen, setBrandsOpen] = useState(false);
  const { loginData } = useAuth();
  const { openCart } = useCart();

  const accountLinks = loginData
    ? [
      { label: 'My Account', href: `/my-orders/${loginData.Id}` },
      { label: 'My Wishlist', href: '/wishlist' },
      { label: 'My Cart', action: openCart },
    ]
    : [
      { label: 'Sign Up', href: '/signup' },
      { label: 'Log In', href: '/signin' },
      { label: 'My Cart', action: openCart },
    ];

  const accountSection = { title: 'Accounts', links: accountLinks };

  const mobileSections = [
    staticSections[0],
    { title: 'Category', links: categorySection.groups[0].links },
    { title: 'Brands', links: categorySection.groups[1].links },
    staticSections[1],
    accountSection,
    staticSections[2],
  ];

  return (
    <>
      {/* Desktop: 5 static columns */}
      <div className="hidden lg:grid lg:grid-cols-5 gap-8">

        {/* Explore */}
        <div>
          <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-widest mb-4">
            {staticSections[0].title}
          </h4>
          <ul className="space-y-1">
            {staticSections[0].links.map(link => (
              <li key={link.label}>
                <Link href={link.href} className="text-sm text-gray-400 hover:text-[#32BBAB] transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Category column — with Brands sub-group */}
        <div className='space-y-1'>
          <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-widest mb-4">
            {categorySection.title}
          </h4>
          <ul className="space-y-1">
            {categorySection.groups[0].links.map(link => (
              <li key={link.label}>
                <Link href={link.href} className="text-sm text-gray-400 hover:text-[#32BBAB] transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <button
            onClick={() => setBrandsOpen(!brandsOpen)}
            className="flex items-center gap-2 mt-2 mb-2 group"
          >
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest group-hover:text-[#32BBAB] transition-colors">
              {categorySection.groups[1].label}
            </span>
            <span
              className="text-gray-400 group-hover:text-[#32BBAB] transition-all duration-200"
              style={{ transform: brandsOpen ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
          {brandsOpen && (
            <ul className="space-y-1">
              {categorySection.groups[1].links.map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-[#32BBAB] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>



        {/* Support */}
        <div>
          <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-widest mb-4">
            {staticSections[1].title}
          </h4>
          <ul className="space-y-1">
            {staticSections[1].links.map(link => (
              <li key={link.label}>
                <Link href={link.href} className="text-sm text-gray-400 hover:text-[#32BBAB] transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Accounts */}
        <div>
          <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-widest mb-4">
            Accounts
          </h4>
          <ul className="space-y-1">
            {accountLinks.map(link => (
              <li key={link.label}>
                <LinkItem link={link} mobile={false} />
              </li>
            ))}
          </ul>
        </div>

        {/* Policies */}
        <div>
          <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-widest mb-4">
            {staticSections[2].title}
          </h4>
          <ul className="space-y-1">
            {staticSections[2].links.map(link => (
              <li key={link.label}>
                <Link href={link.href} className="text-sm text-gray-400 hover:text-[#32BBAB] transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Mobile: accordion */}
      <div className="lg:hidden divide-y divide-gray-100">
        {mobileSections.map((section, i) => (
          <div key={section.title}>
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between py-2 text-sm font-semibold text-gray-800 hover:text-[#32BBAB] transition-colors"
            >
              <span className="tracking-wide">{section.title}</span>
              <span
                className="text-xl leading-none text-gray-400 transition-transform duration-300 select-none"
                style={{ transform: openIndex === i ? 'rotate(45deg)' : 'rotate(0deg)', display: 'inline-block' }}
              >
                +
              </span>
            </button>
            {openIndex === i && (
              <ul className="pb-5 space-y-3 pl-1">
                {section.links.map(link => (
                  <li key={link.label}>
                    <LinkItem link={link} mobile={true} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
