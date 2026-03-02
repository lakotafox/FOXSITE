'use client'

export default function Footer() {
  return (
    <footer className="bg-slate-800 border-t border-slate-700 text-zinc-400 py-10">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Contact Info */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3">Contact</h4>
            <a href="tel:+18018999406" className="block text-red-400 hover:text-red-300 font-bold text-lg mb-2 transition-colors">
              (801) 899-9406
            </a>
            <a href="mailto:kylefox@foxbuilt.com" className="block text-zinc-400 hover:text-white transition-colors">
              kylefox@foxbuilt.com
            </a>
          </div>

          {/* Location & Hours */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 mb-3">Showroom</h4>
            <a
              href="https://www.google.com/maps/place/FoxBuilt+Office"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-zinc-400 hover:text-white transition-colors mb-2"
            >
              420 W Industrial Dr<br />
              Pleasant Grove, UT 84062
            </a>
            <p className="text-zinc-500 text-sm mt-2">Mon–Fri: 10am – 5pm</p>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-sm font-bold">&copy; 2026, FOXBUILT.</p>
          <p className="text-xs text-yellow-500">Want a free website? Email lakota.code@gmail.com</p>
        </div>
      </div>
    </footer>
  )
}
