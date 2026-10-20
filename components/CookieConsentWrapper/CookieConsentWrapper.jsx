'use client';

import { useCookieConsent } from '@/hooks/useCookieConsent';
import CookieBanner from '@/components/CookieBanner/CookieBanner';
import PixelsLoader from '@/components/PixelsLoader/PixelsLoader';

// Server layout passes pixelConfigs here; this client component controls
// whether the pixels actually load based on cookie consent.
export default function CookieConsentWrapper({ configs }) {
  const { consent, showBanner, acceptAll, rejectAll, savePreferences } = useCookieConsent();

  return (
    <>
      <PixelsLoader configs={configs} />
      <CookieBanner
        show={showBanner}
        onAcceptAll={acceptAll}
        onRejectAll={rejectAll}
        onSavePreferences={savePreferences}
      />
    </>
  );
}
