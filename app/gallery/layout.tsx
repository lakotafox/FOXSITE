import type { Metadata } from 'next'
import { openGraphBase } from '@/lib/site-metadata'

export const metadata: Metadata = {
  title: 'Office Furniture Ideas | FoxBuilt Utah',
  description:
    'A few office setups for inspiration. To see what we have in stock, visit our showroom at 420 W Industrial Dr, Bldg LL, Pleasant Grove, Utah.',
  alternates: { canonical: '/gallery' },
  openGraph: { ...openGraphBase, url: '/gallery' },
}

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
