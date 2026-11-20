import type { Metadata } from 'next'
import { openGraphBase } from '@/lib/site-metadata'

export const metadata: Metadata = {
  title: 'Games | FoxBuilt Utah',
  description: 'A few arcade games, just for fun.',
  // Just for fun, so kept out of Google.
  robots: { index: false, follow: true },
  alternates: { canonical: '/games' },
  openGraph: { ...openGraphBase, url: '/games' },
}

export default function GamesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
