// Sends an inquiry from any of the website's forms to FoxBuilt's inbox.
//
// The homepage quote form, the contact form on /products and /search, and the message form
// on a product's details all go through the EmailJS service and template that the /products
// form already used. The template, not this code, decides where the email goes, so no inbox
// address sits in this public repo. To use another template on some deploys (a test one on
// Deploy Previews, say), set NEXT_PUBLIC_EMAILJS_TEMPLATE_ID for that deploy context in
// Netlify. Next.js reads it when it builds the site. Each send also tells GA4 how it went
// (lib/track.ts), with the form's name and nothing the visitor typed.

import { trackFormError, trackLead } from './track'

const EMAILJS_SEND_URL = 'https://api.emailjs.com/api/v1.0/email/send'
const EMAILJS_SERVICE_ID = 'service_axmx4b8'
// EmailJS public keys are meant to ship in the page; this one isn't a secret.
const EMAILJS_PUBLIC_KEY = '_C1u7k95AKuGRXqea'
const DEFAULT_TEMPLATE_ID = 'template_r90th68'

// A send that hasn't finished by then counts as failed, so no button sticks on SENDING...
const SEND_TIMEOUT_MS = 30000

const FAILED_MESSAGE = "Sorry, your message didn't go through. Please try again or call us at (801) 899-9406."

export interface Inquiry {
  form: string // which form it came from, in words Kyle reads in the email
  name: string
  contact: string // what the visitor typed in the "EMAIL / PHONE" box
  message: string
  product?: string // the product the visitor asked about, if any
  page?: string // the page it was sent from; the current page if left out
}

export type InquiryResult =
  | { status: 'sent' }
  | { status: 'busy' } // this form is still sending, so the extra tap sent nothing
  | { status: 'invalid' | 'failed'; message: string } // not sent; message tells the visitor why

// An email address, a phone number (anything else with at least 7 digits), or neither.
export function contactKind(contact: string): 'email' | 'phone' | null {
  const text = contact.trim()
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return 'email'
  if ((text.match(/\d/g) || []).length >= 7) return 'phone'
  return null
}

// Why an inquiry can't be sent as it is, in words for the visitor, or null when it can.
export function checkInquiry(inquiry: Inquiry): string | null {
  const contact = inquiry.contact.trim()
  if (!contact) return 'Please enter your email or phone number so we can get back to you.'
  if (contactKind(contact)) return null
  if (contact.includes('@')) return 'Please check your email address, or enter a phone number instead.'
  return 'Please enter a full phone number or an email address so we can get back to you.'
}

// What the EmailJS template fills in. The names are the ones the /products form has always
// sent, so the template works unchanged. There's no recipient here: the template sets it.
export function templateParams(inquiry: Inquiry): Record<string, string> {
  const contact = inquiry.contact.trim()
  const isEmail = contactKind(contact) === 'email'
  // How to reach the visitor and where the message came from, at the top of the message
  // itself, so the email shows them whichever fields the template prints
  const details = [
    `${isEmail ? 'Email' : 'Phone'}: ${contact}`,
    `Form: ${inquiry.form}`,
    ...(inquiry.product ? [`Product: ${inquiry.product}`] : []),
    `Page: ${inquiry.page ?? currentPage()}`,
  ]
  const params: Record<string, string> = {
    from_name: inquiry.name.trim() || 'Website visitor',
    from_email: isEmail ? contact : '',
    phone: isEmail ? '' : contact,
    message: `${details.join('\n')}\n\n${inquiry.message.trim() || '(No message)'}`,
  }
  // Only an email address can take a reply; a phone number stays in the message.
  if (isEmail) params.reply_to = contact
  return params
}

// Forms with a send under way. Another tap on the same form sends nothing until it ends.
const sending = new Set<string>()

export async function sendInquiry(inquiry: Inquiry): Promise<InquiryResult> {
  if (sending.has(inquiry.form)) return { status: 'busy' }
  const problem = checkInquiry(inquiry)
  if (problem) {
    trackFormError(inquiry.form, 'invalid_contact')
    return { status: 'invalid', message: problem }
  }

  sending.add(inquiry.form)
  try {
    await postToEmailJS(templateParams(inquiry))
    trackLead(inquiry.form)
    return { status: 'sent' }
  } catch (error) {
    console.error('Inquiry not sent:', error)
    trackFormError(inquiry.form, 'send_failed')
    return { status: 'failed', message: FAILED_MESSAGE }
  } finally {
    sending.delete(inquiry.form)
  }
}

// The same request the EmailJS browser library makes, sent directly, so the page doesn't
// load a third-party script to send it.
async function postToEmailJS(templateParams: Record<string, string>) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS)
  try {
    const response = await fetch(EMAILJS_SEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || DEFAULT_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: templateParams,
      }),
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`EmailJS answered ${response.status}: ${await response.text()}`)
  } finally {
    clearTimeout(timer)
  }
}

// The page's address, without any #fragment.
function currentPage() {
  if (typeof window === 'undefined') return ''
  const { origin, pathname, search } = window.location
  return origin + pathname + search
}
