import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import GoogleAnalytics from './google-analytics'
import { openGraphBase } from '@/lib/site-metadata'

export const metadata: Metadata = {
  metadataBase: new URL('https://foxbuiltstore.com'),
  title: 'FoxBuilt - Custom Office Furniture | Utah County & Salt Lake County',
  description: 'Handcrafted American office furniture serving businesses in Salt Lake City, Provo, Orem, Lehi, Pleasant Grove and surrounding areas. Proudly serving Utah County and Salt Lake County since 1999. Executive desks, office chairs, conference tables, executive chairs, and custom workspace solutions.',
  keywords: 'office furniture Utah, custom office furniture, executive desks, conference tables, office chair, desk chair, swivel office chair, executive chair, ergonomic workstations, American made furniture, office furniture showroom, Utah County furniture, Salt Lake County furniture',
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/favicon.png',
    shortcut: '/favicon.png',
  },
  // No canonical URL or og:url here: every page inherits this layout, so they would point
  // the 404 page and the editors at the homepage. Each public page sets its own.
  openGraph: openGraphBase,
  // X (Twitter) fills in each page's title, description and picture from its Open Graph tags.
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        {/* Add your Google Analytics ID here - get it from https://analytics.google.com */}
        <GoogleAnalytics GA_MEASUREMENT_ID="G-KP2P0MHQW0" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FurnitureStore",
              "name": "Foxbuilt Office Furniture",
              "image": "https://foxbuiltstore.com/images/foxbuilt-logo.png",
              "url": "https://foxbuiltstore.com",
              "telephone": "+1-801-899-9406",
              "email": "kyle@foxbuiltofficefurniture.com",
              "description": "Office furniture store in Pleasant Grove, Utah serving Utah County and Salt Lake County since 1999. New and pre-owned desks, chairs, cubicles, and full office setups.",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "420 W Industrial Dr, Bldg LL",
                "addressLocality": "Pleasant Grove",
                "addressRegion": "UT",
                "postalCode": "84062",
                "addressCountry": "US"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 40.3641,
                "longitude": -111.7385
              },
              "openingHoursSpecification": [
                {
                  "@type": "OpeningHoursSpecification",
                  "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                  "opens": "10:00",
                  "closes": "17:00"
                }
              ],
              "priceRange": "$$",
              "foundingDate": "1999",
              "areaServed": [
                { "@type": "State", "name": "Utah" },
                { "@type": "AdministrativeArea", "name": "Utah County" },
                { "@type": "AdministrativeArea", "name": "Salt Lake County" }
              ],
              // The Google listing for the same store
              "sameAs": ["https://maps.google.com/?cid=4003627985772109406"]
            })
          }}
        />
        {children}
      </body>
    </html>
  )
}
