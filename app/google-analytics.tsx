'use client'

import Script from 'next/script'

// Our own visits (Khabe's and Kyle's) can be left out of the GA4 reports. Opening any page
// with ?internal=1 marks this browser as ours, and ?internal=0 unmarks it. A marked
// browser's visits carry traffic_type 'internal' in the config below, which GA4's
// internal-traffic data filter excludes once that filter is Active (GA4 starts it in
// Testing). Local runs and Netlify's Deploy Previews and branch deploys (*.netlify.app)
// always count as ours, since each preview link is a new address that no browser has
// marked. When localStorage is blocked (some private windows), the visit is counted as
// usual. Setup in GA4: docs/DEVELOPER-GUIDE.md, "Analytics (GA4)". The site's own events:
// lib/track.ts.
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
              var host = location.hostname;
              if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.netlify.app')) return { traffic_type: 'internal' };
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
