import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Product Details | FoxBuilt Utah',
  description: 'Office furniture at FoxBuilt Office in Pleasant Grove, Utah.',
  // Kept out of Google. No canonical URL or og:url: the product comes from the address's
  // query, and an og:url of plain /product-detail would make a shared product link (on
  // Facebook, say) open a page with no product, which sends the visitor straight back.
  robots: { index: false, follow: true },
}

export default function ProductDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
