import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import GoogleAnalytics from './google-analytics'

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
  openGraph: {
    title: 'FoxBuilt - Custom Office Furniture | Utah County & Salt Lake County',
    description: 'Handcrafted American office furniture serving businesses in Salt Lake City, Provo, Orem, Lehi, and surrounding areas since 1999.',
    url: 'https://foxbuiltstore.com',
    siteName: 'FoxBuilt',
    images: [
      {
        url: '/images/showroom-1.jpg',
        width: 1200,
        height: 630,
        alt: 'FoxBuilt Office Furniture Showroom',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FoxBuilt - Custom Office Furniture Utah',
    description: 'Serving Utah County & Salt Lake County businesses since 1999. Quality American-made office furniture.',
    images: ['/images/showroom-1.jpg'],
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
              "name": "FoxBuilt Office",
              "image": "https://foxbuiltstore.com/images/foxbuilt-logo.png",
              "url": "https://foxbuiltstore.com",
              "telephone": "+1-801-899-9406",
              "email": "kylefox@foxbuilt.com",
              "description": "Office furniture store in Pleasant Grove, Utah serving Utah County and Salt Lake County since 1999. New and pre-owned desks, chairs, cubicles, and full office setups.",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "420 W Industrial Dr",
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
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "5.0",
                "bestRating": "5",
                "worstRating": "1",
                "ratingCount": "50"
              },
              "priceRange": "$$",
              "foundingDate": "1999",
              "areaServed": [
                { "@type": "State", "name": "Utah" },
                { "@type": "AdministrativeArea", "name": "Utah County" },
                { "@type": "AdministrativeArea", "name": "Salt Lake County" }
              ],
              "sameAs": []
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Where can I buy office furniture in Utah?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "FoxBuilt Office has a showroom at 420 W Industrial Dr in Pleasant Grove, UT. We serve businesses across Utah County, Salt Lake County, and the entire Wasatch Front. Stop by Monday through Friday 10am–5pm or call (801) 899-9406 to schedule a visit."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How much does office furniture cost?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Office furniture pricing varies based on condition, brand, and customization. At FoxBuilt we carry new and pre-owned options — desks start around $200 and executive setups can run several thousand. Call us at (801) 899-9406 for a free, no-obligation quote."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Do you deliver and set up office furniture?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. FoxBuilt offers delivery and professional installation throughout Utah. We handle everything from single desks to full office build-outs so your team can get to work right away."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can I buy used office furniture near me?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Absolutely. We carry a large selection of quality pre-owned desks, chairs, cubicles, and conference tables at our Pleasant Grove showroom. Inventory changes often — call (801) 899-9406 to ask about current stock."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Do you offer bulk discounts for businesses?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes — we regularly furnish entire offices and offer volume pricing for larger orders. Whether you need 5 desks or 500, we can put together a package that fits your budget."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What brands of office furniture do you carry?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "FoxBuilt carries a mix of top commercial brands and American-made lines. Our catalog includes over 160 pages of desks, seating, storage, and conference room furniture."
                  }
                }
              ]
            })
          }}
        />
        {children}
      </body>
    </html>
  )
}
