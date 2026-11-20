'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import RocketButton from '@/components/ui/RocketButton'
import StoreHours from '@/components/ui/StoreHours'
import { inquirySender } from '@/lib/inquiry'
import { trackFormStart } from '@/lib/track'

// The form's name in the email to Kyle and in GA4
const FORM_NAME = 'Homepage quote form'

interface ContactFormData {
  name: string
  email: string // the "EMAIL / PHONE" box
  message: string
}

const emptyForm: ContactFormData = { name: "", email: "", message: "" }

export default function ContactSection() {
  const [formData, setFormData] = useState<ContactFormData>(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  // This form's own sender, so a double tap sends once
  const [sendInquiry] = useState(() => inquirySender())

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // sendInquiry also tells GA4 (generate_lead or form_error)
    const result = await sendInquiry({
      form: FORM_NAME,
      name: formData.name,
      contact: formData.email,
      message: formData.message,
    })
    if (result.status === 'busy') return // an earlier tap is still sending
    setIsSubmitting(false)

    if (result.status !== 'sent') {
      alert(result.message)
      return
    }
    alert("Thanks! Your quote request has been sent. We'll get back to you soon!")
    setFormData(emptyForm)
  }

  return (
    <section id="contact" className="py-20 bg-slate-900 text-white">
      <div className="container mx-auto px-4">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white">
            Get a Free Quote
          </h2>
          <div className="w-12 h-0.5 bg-red-600 mx-auto mt-3 mb-4" />
          <p className="text-zinc-400 text-base">
            No obligation — we respond same day.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-16 max-w-5xl mx-auto">
          <div>
            <StoreHours className="mt-12" />
          </div>

          <div>
            <form
              className="space-y-6"
              onSubmit={handleFormSubmit}
              onFocus={(e) => trackFormStart(FORM_NAME, e.target)}
            >
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="NAME"
                  value={formData.name}
                  onChange={handleFormChange}
                  className="w-full px-6 py-4 bg-slate-800 border-4 border-slate-700 text-white placeholder-zinc-400 font-bold focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  name="email"
                  placeholder="EMAIL / PHONE *"
                  required
                  autoComplete="off"
                  value={formData.email}
                  onChange={handleFormChange}
                  className="w-full px-6 py-4 bg-slate-800 border-4 border-slate-700 text-white placeholder-zinc-400 font-bold focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <textarea
                  name="message"
                  placeholder="TELL US WHAT YOU NEED"
                  rows={1}
                  value={formData.message}
                  onChange={handleFormChange}
                  className="w-full px-6 py-4 bg-slate-800 border-4 border-slate-700 text-white placeholder-zinc-400 font-bold focus:outline-none focus:border-red-500 resize-none"
                />
              </div>
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-red-600 hover:bg-red-700 py-4 font-black text-lg tracking-widest border-4 border-red-600 disabled:opacity-50"
                >
                  {isSubmitting ? "SENDING..." : "SEND A MESSAGE"}
                </Button>
                <RocketButton />
              </div>
            </form>

            {/* Trust Signals */}
            <p className="mt-6 text-zinc-500 text-sm">
              No obligation &middot; Same-day response &middot; Serving Utah since 1999
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}