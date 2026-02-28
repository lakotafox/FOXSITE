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
      <div className="relative z-30 bg-slate-900/80 backdrop-blur-sm border-y-4 border-red-600 py-8 mt-8">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl md:text-3xl font-black text-white mb-4 tracking-tight">
            SEE SOMETHING YOU LIKE?
          </h3>
          <p className="text-zinc-400 mb-6 text-lg">Let us help you find the perfect setup for your office.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="tel:+18018999406"
              className="bg-red-600 hover:bg-red-700 text-white font-black text-lg tracking-wider px-8 py-4 rounded-lg border-4 border-red-500 transition-all hover:scale-105"
            >
              CALL (801) 899-9406
            </a>
            <button
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-black text-lg tracking-wider px-8 py-4 rounded-lg border-4 border-white/30 transition-all hover:scale-105"
            >
              GET A FREE QUOTE
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}