'use client'

import { trackCall } from '@/lib/track'

// Shown instead of an empty product grid on /products and /search: a phone link and a
// link to the request form further down the same page (ContactForm, id="contact").
export default function RequestPricing({ title }: { title: string }) {
  return (
    <section className="py-20 bg-slate-800">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
        <p className="text-zinc-400 mt-3">
          Call us or send a request, and we&apos;ll tell you what&apos;s available and the price.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <a
            href="tel:+18018999406"
            onClick={() => trackCall('no_products')}
            className="bg-red-600 hover:bg-red-500 text-white font-bold text-base md:text-lg px-6 py-3 rounded-md shadow-lg shadow-red-900/20 transition-colors"
          >
            Call (801) 899-9406
          </a>
          <a
            href="#contact"
            className="border border-white/20 hover:border-white/40 hover:bg-white/5 text-white font-bold text-base md:text-lg px-6 py-3 rounded-md transition-colors"
          >
            Request pricing
          </a>
        </div>
      </div>
    </section>
  )
}
