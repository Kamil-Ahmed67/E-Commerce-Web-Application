'use client';

import Script from 'next/script';

// configs = [{ Platform: 'Meta'|'Google'|'TikTok', SocialId: '...', AccessKey: '...' }, ...]
// consent = { essential, functional, analytics, marketing } — null means "not decided yet"
export default function PixelsLoader({ configs = [], consent = null }) {
  const meta = configs.find((c) => c.Platform === 'Meta');
  const google = configs.find((c) => c.Platform === 'Google');
  const tiktok = configs.find((c) => c.Platform === 'TikTok');

  // Wait until the user has made a consent choice before loading any tracking scripts
  if (!consent) return null;

  return (
    <>
      {/* ── Meta Pixel (Facebook + Instagram) ─────────────────── */}
      {consent.marketing && meta?.SocialId && (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">{`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window,document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${meta.SocialId}');
            fbq('track', 'PageView');
          `}</Script>
          <noscript>
            <img
              height="1" width="1" style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${meta.SocialId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}

      {/* ── Google Analytics 4 ────────────────────────────────── */}
      {consent.analytics && google?.SocialId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${google.SocialId}`}
            strategy="afterInteractive"
          />
          <Script id="google-gtag" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${google.SocialId}');
          `}</Script>
        </>
      )}

      {/* ── TikTok Pixel ──────────────────────────────────────── */}
      {consent.marketing && tiktok?.SocialId && (
        <Script id="tiktok-pixel" strategy="afterInteractive">{`
          !function(w,d,t){
            w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
            ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
            ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
            for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
            ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
            ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
            ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._o=ttq._o||{},ttq._o[e]=n||{};
            var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;
            var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
            ttq.load('${tiktok.SocialId}');
            ttq.page();
          }(window,document,'ttq');
        `}</Script>
      )}
    </>
  ); 
}
