import type { Metadata } from 'next'

// The part of the link preview (Open Graph) that every page shares. A page that sets its
// own openGraph replaces its layout's openGraph as a whole, so it spreads this in first,
// or its preview would lose the picture. A preview's title and description default to the
// page's own title and description.
export const openGraphBase = {
  siteName: 'FoxBuilt',
  images: [
    {
      url: '/images/showroom-1.jpg',
      width: 1200,
      height: 630,
      alt: 'FoxBuilt Office Furniture Showroom',
    },
  ],
  locale: 'en_US',
  type: 'website',
} satisfies Metadata['openGraph']
