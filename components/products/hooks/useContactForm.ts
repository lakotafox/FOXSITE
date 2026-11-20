'use client'

import { useState } from 'react'
import { inquirySender } from '@/lib/inquiry'
import { trackFormStart } from '@/lib/track'

// The form's name in the email to Kyle and in GA4
const FORM_NAME = 'Contact form'

interface FormData {
  name: string
  email: string // the "EMAIL / PHONE" box
  message: string
}

const emptyForm: FormData = { name: "", email: "", message: "" }

export function useContactForm() {
  const [formData, setFormData] = useState<FormData>(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  // This form's own sender, so a double tap sends once
  const [sendInquiry] = useState(() => inquirySender())

  // Handle form changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Tell GA4 the first time someone clicks or tabs into the form
  const handleFormFocus = (e: React.FocusEvent<HTMLFormElement>) => {
    trackFormStart(FORM_NAME, e.target)
  }

  // Handle form submission
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

  return {
    formData,
    isSubmitting,
    handleFormChange,
    handleFormFocus,
    handleFormSubmit
  }
}
