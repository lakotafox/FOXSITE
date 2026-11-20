import { CalendarDays, Clock, MapPin } from 'lucide-react'

const iconClass = 'inline-block w-5 h-5 mr-2 align-middle text-red-500'

// The showroom's address, hours and founding year as plain text under the hero, so they
// are in the page's first HTML for visitors, search engines and tools that skip JavaScript.
export default function ShowroomDetails() {
  return (
    <section className="bg-slate-900 border-b border-slate-700">
      <ul className="container mx-auto px-4 py-6 flex flex-col lg:flex-row items-center justify-center gap-x-10 gap-y-3 text-center text-zinc-300 font-semibold">
        <li>
          <MapPin className={iconClass} aria-hidden="true" />
          420 W Industrial Dr, Bldg LL, <span className="whitespace-nowrap">Pleasant Grove, UT 84062</span>
        </li>
        <li>
          <Clock className={iconClass} aria-hidden="true" />
          Mon–Fri 10am–5pm
        </li>
        <li>
          <CalendarDays className={iconClass} aria-hidden="true" />
          Est. 1999
        </li>
      </ul>
    </section>
  )
}
