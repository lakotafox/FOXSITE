'use client'

import { useState } from 'react'
import { sendInquiry } from '@/lib/inquiry'

interface FormData {
  name: string
  email: string // the "EMAIL / PHONE" box
  message: string
}

const emptyForm: FormData = { name: "", email: "", message: "" }

export function useContactForm() {
  const [formData, setFormData] = useState<FormData>(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handle form changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Handle form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const result = await sendInquiry({
      form: 'Contact form',
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
    handleFormSubmit
  }
}
