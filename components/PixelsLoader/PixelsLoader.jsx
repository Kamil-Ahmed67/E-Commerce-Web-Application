'use client';

import Script from 'next/script';

// configs = [{ Platform: 'GTM', SocialId: '<head snippet>', AccessKey: '<body snippet>', Remarks }, ...]
export default function PixelsLoader({ configs = [] }) {
  const gtm = configs.find((c) => c.Platform === 'GTM');

  if (!gtm?.SocialId) return null;

  // Browsers don't execute a <script> tag inserted via innerHTML, so we strip the
  // wrapper and feed the inner JS into a real script element.
  const headScript = gtm.SocialId.replace(/<script[^>]*>|<\/script>/gi, '');
  // <noscript> content is parsed as inert text once JS is running, so unwrap the
  // <iframe> from it before injecting — the iframe itself renders fine via innerHTML.
  const bodyIframe = (gtm.AccessKey || '').replace(/<noscript>|<\/noscript>/gi, '');

  return (
    <>
      {headScript && (
        <Script id="gtm-head" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: headScript }} />
      )}
      {bodyIframe && <div dangerouslySetInnerHTML={{ __html: bodyIframe }} />}
    </>
  );
}
