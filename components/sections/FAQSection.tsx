'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'Where can I buy office furniture in Utah?',
    answer:
      'FoxBuilt Office has a showroom at 420 W Industrial Dr in Pleasant Grove, UT. We serve businesses across Utah County, Salt Lake County, and the entire Wasatch Front. Stop by Monday through Friday 10am–5pm or call (801) 899-9406 to schedule a visit.',
  },
  {
    question: 'How much does office furniture cost?',
    answer:
      'Office furniture pricing varies based on condition, brand, and customization. At FoxBuilt we carry new and pre-owned options — desks start around $200 and executive setups can run several thousand. Call us at (801) 899-9406 for a free, no-obligation quote tailored to your budget.',
  },
  {
    question: 'Do you deliver and set up office furniture?',
    answer:
      'Yes. FoxBuilt offers delivery and professional installation throughout Utah. We handle everything from single desks to full office build-outs so your team can get to work right away. Contact us for delivery pricing.',
  },
  {
    question: 'Can I buy used office furniture near me?',
    answer:
      'Absolutely. We carry a large selection of quality pre-owned desks, chairs, cubicles, and conference tables at our Pleasant Grove showroom. Pre-owned pieces are inspected and refreshed before they hit the floor. Inventory changes often — call (801) 899-9406 to ask about current stock.',
  },
  {
    question: 'Do you offer bulk discounts for businesses?',
    answer:
      'Yes — we regularly furnish entire offices and offer volume pricing for larger orders. Whether you need 5 desks or 500, we can put together a package that fits your budget. Request a free quote and let us know the scope of your project.',
  },
  {
    question: 'What brands of office furniture do you carry?',
    answer:
      'FoxBuilt carries a mix of top commercial brands and American-made lines. Our catalog includes over 160 pages of desks, seating, storage, and conference room furniture. Visit our showroom or browse the catalog online to see the full selection.',
  },
]

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-16 bg-slate-800">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-10">
          Common Questions
        </h2>

        <div className="divide-y divide-slate-700">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full text-left px-4 py-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
              >
                <span className="text-white font-semibold pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-zinc-400 flex-shrink-0 transition-transform duration-200 ${
                    openIndex === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === i && (
                <div className="px-4 pb-4 text-sm text-zinc-400 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
