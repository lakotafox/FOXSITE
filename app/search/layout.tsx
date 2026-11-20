import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search Results | FoxBuilt Utah',
  description: 'Search office furniture at FoxBuilt Office in Pleasant Grove, Utah.',
  // Search results stay out of Google. No canonical URL or og:url: the results come from
  // the ?q= in the address, and an og:url of plain /search would make a shared link (on
  // Facebook, say) open an empty search instead.
  robots: { index: false, follow: true },
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
