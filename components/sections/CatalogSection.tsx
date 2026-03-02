'use client'

import dynamic from 'next/dynamic'

// Dynamically import to avoid SSR issues
const TurnJSSimple = dynamic(() => import('@/components/ui/TurnJSSimple'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-slate-800">
      <div className="text-white text-xl font-black">LOADING CATALOG...</div>
    </div>
  )
})

export default function CatalogSection() {
  return (
    <section id="catalog" className="bg-slate-800 relative pb-20 mb-20" style={{ zIndex: 30 }}>
      <div className="relative" style={{ height: '80vh', zIndex: 30 }}>
        <TurnJSSimple />
      </div>

      {/* CTA Bar */}
      <div className="relative z-30 bg-slate-900/80 backdrop-blur-sm border-t border-slate-700 py-6 mt-8">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight">
            See something you like?
          </h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="tel:+18018999406"
              className="bg-red-600 hover:bg-red-500 text-white font-bold text-base md:text-lg px-6 py-3 rounded-md shadow-lg shadow-red-900/20 transition-colors"
            >
              Call (801) 899-9406
            </a>
            <button
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="border border-white/20 hover:border-white/40 hover:bg-white/5 text-white font-bold text-base md:text-lg px-6 py-3 rounded-md transition-colors"
            >
              Get a Free Quote
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}