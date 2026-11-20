import type { Metadata } from 'next'
import HomePage from '@/components/HomePage'
import { openGraphBase } from '@/lib/site-metadata'

// The home page's own title and description. The same words in app/layout.tsx are the
// defaults for pages that don't set their own.
export const metadata: Metadata = {
  title: 'FoxBuilt - Custom Office Furniture | Utah County & Salt Lake County',
  description: 'Handcrafted American office furniture serving businesses in Salt Lake City, Provo, Orem, Lehi, Pleasant Grove and surrounding areas. Proudly serving Utah County and Salt Lake County since 1999. Executive desks, office chairs, conference tables, executive chairs, and custom workspace solutions.',
  // The home page's canonical URL is set here, not in app/layout.tsx, which every page inherits.
  alternates: { canonical: '/' },
  openGraph: {
    ...openGraphBase,
    url: '/',
    // The link preview keeps its shorter description.
    description: 'Handcrafted American office furniture serving businesses in Salt Lake City, Provo, Orem, Lehi, and surrounding areas since 1999.',
  },
}

// A server component, so the page can export metadata. The page itself is the client
// component HomePage, and the static export writes its content into the first HTML.
export default function Home() {
  return <HomePage />
}
