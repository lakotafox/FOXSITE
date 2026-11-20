import type { Metadata } from 'next'
import { openGraphBase } from '@/lib/site-metadata'

export const metadata: Metadata = {
  title: '2026 Office Furniture Catalog | FoxBuilt Store',
  description:
    'Browse our full 160+ page office furniture catalog. Executive desks, chairs, cubicles, conference tables, and storage solutions. FoxBuilt Office — serving Utah since 1999.',
  alternates: { canonical: '/catalog' },
  openGraph: { ...openGraphBase, url: '/catalog' },
}

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
