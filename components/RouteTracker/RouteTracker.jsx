'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/provider/AuthProvider';

function splitName(name) {
  if (!name) return { firstName: undefined, lastName: undefined };
  const parts = name.trim().split(/\s+/);
  return {
    firstName: parts[0],
    lastName: parts.length > 1 ? parts.slice(1).join(' ') : undefined,
  };
}

// Mounted once at the root layout so it survives every client-side navigation.
// Next.js only does a real browser page load once per visit — after that,
// route changes are handled entirely client-side and GTM's own container-load
// trigger never fires again, so GTM keeps thinking the visitor is still on
// whatever page they started on. This pushes a 'page_view' dataLayer event on
// every page, including the first one, so any tag/trigger keyed off that
// custom event fires consistently everywhere (not just on SPA navigations).
export default function RouteTracker() {
  const pathname = usePathname();
  const { loginData } = useAuth();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.dataLayer = window.dataLayer || [];

    // Fires on every page including the first real load — GTM's own
    // Initialization/gtm.js trigger already covers the first load, but any
    // tag whose trigger is the custom 'page_view' event (e.g. GA4/Meta
    // PageView tags configured that way) would otherwise never fire for
    // visitors landing directly on a page like the homepage.
    //
    // dataLayer.push() merges keys into GTM's persistent data model rather
    // than replacing it, so a stale `ecommerce` object from the last product
    // page (e.g. /shop's view_item_list) would otherwise keep riding along
    // on every later event — including this page_view on a page with no
    // products — until the next ecommerce push overwrites it. Clear it first.
    window.dataLayer.push({ ecommerce: null });
    window.dataLayer.push({
      event: 'page_view',
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname]);

  // Logged-in customer identity — pushed on every page load (and again if
  // login state changes) so it's available to every tag, not just Purchase.
  useEffect(() => {
    if (typeof window === 'undefined' || !loginData) return;
    window.dataLayer = window.dataLayer || [];
    const { firstName, lastName } = splitName(loginData.Name);
    window.dataLayer.push({ ecommerce: null });
    window.dataLayer.push({
      event: 'customerData',
      customerId: loginData.Id,
      customerFirstName: firstName,
      customerLastName: lastName,
      customerEmail: loginData.Email,
      customerCountry: loginData.Country,
      customerDistrict: loginData.District,
      customerCity: loginData.City,
      customerDateOfBirth: loginData.DateOfBirth,
      customerGender: loginData.Gender,
    });
  }, [loginData]);

  // Scroll depth — pushes a 'scroll' event with percent_scrolled once per
  // milestone (25/50/75/90%). The milestone set resets on every route change
  // (this effect re-runs on `pathname`), so scroll tracking works correctly
  // for this SPA instead of only firing once for the whole visit.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const milestones = [25, 50, 75, 90];
    const fired = new Set();
    let ticking = false;

    const checkScroll = () => {
      ticking = false;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const percent = Math.round((window.scrollY / docHeight) * 100);
      milestones.forEach((milestone) => {
        if (percent >= milestone && !fired.has(milestone)) {
          fired.add(milestone);
          window.dataLayer = window.dataLayer || [];
          // Same stale-ecommerce risk as the page_view push above — clear it
          // so a scroll tag never inherits leftover product data.
          window.dataLayer.push({ ecommerce: null });
          window.dataLayer.push({
            event: 'scroll',
            percent_scrolled: milestone,
            page_path: pathname,
          });
        }
      });
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(checkScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  return null;
}
