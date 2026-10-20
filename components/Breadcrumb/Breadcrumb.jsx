'use client';

import Link from 'next/link';
import { FiChevronLeft } from 'react-icons/fi';

// items: [{ label, href }] — href is optional/null on the last (current-page) crumb.
const Breadcrumb = ({ items, className = '' }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="inline-flex flex-wrap items-center space-x-1 md:space-x-1.5">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="inline-flex items-center">
            {i > 0 && <span className="mx-1.5 text-gray-400">/</span>}
            {item.href ? (
              <Link
                href={item.href}
                className={`inline-flex items-center text-sm font-medium text-gray-700 hover:text-[#32BBAB] ${i === 0 ? '' : 'ml-1 md:ml-0'}`}
              >
                {i === 0 && <FiChevronLeft className="mr-2" />}
                {item.label}
              </Link>
            ) : (
              <span className="text-sm font-medium text-gray-500" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
