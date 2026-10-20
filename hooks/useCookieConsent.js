'use client';

import { useState, useEffect } from 'react';

const COOKIE_NAME = 'cookie_consent';
const MAX_AGE = 365 * 24 * 60 * 60; // 1 year

function readConsentCookie() {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

function writeConsentCookie(consent) {
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(consent))}; max-age=${MAX_AGE}; path=/; SameSite=Lax${secure}`;
}

const DEFAULT_CONSENT = { essential: true, functional: true, analytics: false, marketing: false };
const FULL_CONSENT    = { essential: true, functional: true, analytics: true,  marketing: true  };

export function useCookieConsent() {
  const [consent, setConsent] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const saved = readConsentCookie();
    if (saved) {
      setConsent(saved);
    } else {
      setShowBanner(true);
    }
  }, []);

  function acceptAll() {
    writeConsentCookie(FULL_CONSENT);
    setConsent(FULL_CONSENT);
    setShowBanner(false);
  }

  function rejectAll() {
    writeConsentCookie(DEFAULT_CONSENT);
    setConsent(DEFAULT_CONSENT);
    setShowBanner(false);
  }

  function savePreferences(prefs) {
    const merged = { essential: true, functional: true, ...prefs };
    writeConsentCookie(merged);
    setConsent(merged);
    setShowBanner(false);
  }

  return { consent, showBanner, acceptAll, rejectAll, savePreferences };
}
