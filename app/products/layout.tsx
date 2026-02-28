import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Office Furniture for Sale | Desks, Chairs & More | FoxBuilt Utah',
  description:
    'Browse executive desks, ergonomic chairs, cubicle workstations, conference tables, and more at FoxBuilt Office in Pleasant Grove, UT. New and pre-owned options with delivery across Utah County and Salt Lake County.',
}

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
