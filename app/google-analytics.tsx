'use client'

import Script from 'next/script'

// Our own visits (Khabe's and Kyle's) can be left out of the GA4 reports. Opening any page
// with ?internal=1 marks this browser as ours, and ?internal=0 unmarks it. A marked
// browser's visits carry traffic_type 'internal' in the config below, which GA4's
// internal-traffic data filter excludes. When localStorage is blocked (some private
// windows), the visit is counted as usual. The site's own events: lib/track.ts.
const INTERNAL_TRAFFIC_KEY = 'foxbuilt_internal_traffic'

export default function GoogleAnalytics({ GA_MEASUREMENT_ID }: { GA_MEASUREMENT_ID: string }) {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', (function () {
              try {
                var internal = new URLSearchParams(location.search).get('internal');
                if (internal === '1') localStorage.setItem('${INTERNAL_TRAFFIC_KEY}', '1');
                if (internal === '0') localStorage.removeItem('${INTERNAL_TRAFFIC_KEY}');
                if (localStorage.getItem('${INTERNAL_TRAFFIC_KEY}') === '1') return { traffic_type: 'internal' };
              } catch (e) {}
              return {};
            })());
          `,
        }}
      />
    </>
  )
}
