// Tests for lib/inquiry.ts. Run with `bun test`. They never reach EmailJS or Google: each
// test that sends swaps fetch for a stand-in that records the request, and the GA4 tests
// put a stand-in gtag on a stand-in window.

import { afterEach, beforeEach, describe, expect, spyOn, test } from 'bun:test'
import { checkInquiry, contactKind, sendInquiry, templateParams, type Inquiry } from './inquiry'

const PAGE = 'https://foxbuiltstore.com/products?category=task-chairs'

function inquiry(changes: Partial<Inquiry> = {}): Inquiry {
  return {
    form: 'Contact form',
    name: 'Jane Doe',
    contact: 'jane@example.com',
    message: 'Ten task chairs for a new office, please.',
    page: PAGE,
    ...changes,
  }
}

// Stands in for the EmailJS API: records each request, then gives the answer from `answer`.
function fakeEmailJS(answer: () => Promise<Response> = async () => new Response('OK', { status: 200 })) {
  const requests: { url: string; body: any }[] = []
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    requests.push({ url: String(url), body: JSON.parse(String(init.body)) })
    return answer()
  }) as unknown as typeof fetch
  return requests
}

// An answer for fakeEmailJS that holds each request until release() answers them all with OK.
function heldAnswers() {
  const waiting: ((response: Response) => void)[] = []
  return {
    answer: () => new Promise<Response>(resolve => { waiting.push(resolve) }),
    release: () => waiting.splice(0).forEach(resolve => resolve(new Response('OK', { status: 200 }))),
  }
}

// Stands in for GA4 on a page: records each gtag() call
function fakeGA(gtag?: (...args: unknown[]) => void) {
  const calls: unknown[][] = []
  ;(globalThis as any).window = { gtag: gtag ?? ((...args: unknown[]) => { calls.push(args) }) }
  return calls
}

const realFetch = globalThis.fetch
let consoleError: ReturnType<typeof spyOn>
beforeEach(() => {
  // Start from the default template, whatever the shell or a .env file (bun reads them) sets
  delete process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
  // A failed send logs the error; keep the test output clean
  consoleError = spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => {
  globalThis.fetch = realFetch
  delete (globalThis as any).window
  consoleError.mockRestore()
})

describe('contactKind', () => {
  test('knows an email address', () => {
    expect(contactKind('jane@example.com')).toBe('email')
    expect(contactKind('  Jane.Doe+quotes@company.co  ')).toBe('email')
  })

  test('knows a phone number, written any common way', () => {
    for (const phone of ['(801) 899-9406', '801.899.9406', '8018999406', '+1 801 899 9406', '899-9406']) {
      expect(contactKind(phone)).toBe('phone')
    }
  })

  test('is neither for anything else', () => {
    for (const text of ['', '   ', 'jane@example', 'jane @example.com', 'call me', '12345']) {
      expect(contactKind(text)).toBeNull()
    }
  })
})

describe('checkInquiry', () => {
  test('accepts an email or a phone number, with or without a name and message', () => {
    expect(checkInquiry(inquiry())).toBeNull()
    expect(checkInquiry(inquiry({ contact: '(801) 555-0134' }))).toBeNull()
    expect(checkInquiry(inquiry({ name: '', message: '' }))).toBeNull()
  })

  test('asks for a way to reply when the contact box is empty', () => {
    expect(checkInquiry(inquiry({ contact: '' }))).toBe('Please enter your email or phone number so we can get back to you.')
    expect(checkInquiry(inquiry({ contact: '   ' }))).toBe('Please enter your email or phone number so we can get back to you.')
  })

  test('asks to fix an email address that is not complete', () => {
    expect(checkInquiry(inquiry({ contact: 'jane@example' }))).toContain('check your email address')
  })

  test('asks for a full phone number when there are too few digits', () => {
    expect(checkInquiry(inquiry({ contact: 'call 555' }))).toContain('full phone number')
  })
})

describe('templateParams', () => {
  test('uses the names the /products form sends, and reply_to for an email', () => {
    const params = templateParams(inquiry())
    expect(Object.keys(params).sort()).toEqual(['from_email', 'from_name', 'message', 'phone', 'reply_to'])
    expect(params.from_name).toBe('Jane Doe')
    expect(params.from_email).toBe('jane@example.com')
    expect(params.reply_to).toBe('jane@example.com')
    expect(params.phone).toBe('')
  })

  test('sets no reply_to for a phone number, and puts it in the message', () => {
    const params = templateParams(inquiry({ contact: ' (801) 555-0134 ' }))
    expect('reply_to' in params).toBe(false)
    expect(params.from_email).toBe('')
    expect(params.phone).toBe('(801) 555-0134')
    expect(params.message).toContain('Phone: (801) 555-0134')
  })

  test('puts the contact, form name and page above the visitor\'s message', () => {
    expect(templateParams(inquiry()).message).toBe(
      'Email: jane@example.com\n' +
      'Form: Contact form\n' +
      `Page: ${PAGE}\n` +
      '\n' +
      'Ten task chairs for a new office, please.'
    )
  })

  test('names the product when the form is about one', () => {
    const params = templateParams(inquiry({ form: 'Product form', product: 'Ergonomic Task Chair' }))
    expect(params.message).toContain('Form: Product form\nProduct: Ergonomic Task Chair\n')
  })

  test('never names a recipient: the EmailJS template sets it', () => {
    const keys = Object.keys(templateParams(inquiry()))
    expect(keys.filter(key => /^to_|recipient/i.test(key))).toEqual([])
  })

  test('fills in a blank name or message and trims what was typed', () => {
    const params = templateParams(inquiry({ name: '  ', message: '\n ', contact: ' jane@example.com ' }))
    expect(params.from_name).toBe('Website visitor')
    expect(params.reply_to).toBe('jane@example.com')
    expect(params.message.endsWith('\n\n(No message)')).toBe(true)
  })
})

describe('sendInquiry', () => {
  test('sends through the proven EmailJS service and template', async () => {
    const requests = fakeEmailJS()
    expect(await sendInquiry(inquiry())).toEqual({ status: 'sent' })
    expect(requests).toHaveLength(1)
    expect(requests[0].url).toBe('https://api.emailjs.com/api/v1.0/email/send')
    expect(requests[0].body).toEqual({
      service_id: 'service_axmx4b8',
      template_id: 'template_r90th68',
      user_id: '_C1u7k95AKuGRXqea',
      template_params: templateParams(inquiry()),
    })
  })

  test('uses the template named in NEXT_PUBLIC_EMAILJS_TEMPLATE_ID when it is set', async () => {
    process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID = 'template_preview_test'
    const requests = fakeEmailJS()
    await sendInquiry(inquiry())
    expect(requests[0].body.template_id).toBe('template_preview_test')
  })

  test('sends once for a double tap', async () => {
    const held = heldAnswers()
    const requests = fakeEmailJS(held.answer)
    const first = sendInquiry(inquiry())
    const second = sendInquiry(inquiry())
    expect(await second).toEqual({ status: 'busy' })
    held.release()
    expect(await first).toEqual({ status: 'sent' })
    expect(requests).toHaveLength(1)

    // Once that send is done, the form can send again
    const next = sendInquiry(inquiry())
    held.release()
    expect(await next).toEqual({ status: 'sent' })
    expect(requests).toHaveLength(2)
  })

  test('lets a different form send while one is sending', async () => {
    const held = heldAnswers()
    const requests = fakeEmailJS(held.answer)
    const home = sendInquiry(inquiry({ form: 'Homepage quote form' }))
    const product = sendInquiry(inquiry({ form: 'Product form' }))
    held.release()
    expect(await Promise.all([home, product])).toEqual([{ status: 'sent' }, { status: 'sent' }])
    expect(requests).toHaveLength(2)
  })

  test('sends nothing when the contact box is empty', async () => {
    const requests = fakeEmailJS()
    const result = await sendInquiry(inquiry({ contact: '' }))
    expect(result.status).toBe('invalid')
    expect(requests).toHaveLength(0)
  })

  test('reports a failure with the phone number, and lets the visitor try again', async () => {
    const requests = fakeEmailJS(async () => new Response('The template ID is invalid', { status: 400 }))
    const result = await sendInquiry(inquiry())
    expect(result.status).toBe('failed')
    expect(result.status === 'failed' && result.message).toContain('(801) 899-9406')

    fakeEmailJS()
    expect(await sendInquiry(inquiry())).toEqual({ status: 'sent' })
    expect(requests).toHaveLength(1)
  })

  test('reports a failure when the network is down', async () => {
    fakeEmailJS(async () => { throw new TypeError('Failed to fetch') })
    expect((await sendInquiry(inquiry())).status).toBe('failed')
  })
})

describe('what sendInquiry tells GA4', () => {
  test('a sent inquiry is a lead, named by its form', async () => {
    fakeEmailJS()
    const events = fakeGA()
    await sendInquiry(inquiry({ form: 'Homepage quote form' }))
    expect(events).toEqual([['event', 'generate_lead', {
      form_name: 'Homepage quote form',
      event_category: 'contact',
      event_label: 'contact_form_submission',
      value: 1,
    }]])
  })

  test('a failed send is a form_error of type send_failed', async () => {
    fakeEmailJS(async () => new Response('Too many requests', { status: 429 }))
    const events = fakeGA()
    await sendInquiry(inquiry({ form: 'Product form' }))
    expect(events).toEqual([['event', 'form_error', { form_name: 'Product form', error_type: 'send_failed' }]])
  })

  test('an email / phone box with neither is a form_error of type invalid_contact', async () => {
    fakeEmailJS()
    const events = fakeGA()
    await sendInquiry(inquiry({ contact: 'call me' }))
    expect(events).toEqual([['event', 'form_error', { form_name: 'Contact form', error_type: 'invalid_contact' }]])
  })

  test('the extra tap of a double tap tells GA4 nothing', async () => {
    const held = heldAnswers()
    fakeEmailJS(held.answer)
    const events = fakeGA()
    const first = sendInquiry(inquiry())
    await sendInquiry(inquiry())
    held.release()
    await first
    expect(events.map(event => event[1])).toEqual(['generate_lead'])
  })

  test('GA4 never gets what the visitor typed', async () => {
    const events = fakeGA()
    const typed = { name: 'Jane Doe', message: 'Ten task chairs for a new office' }
    fakeEmailJS()
    await sendInquiry(inquiry({ ...typed, contact: 'jane@example.com' }))
    await sendInquiry(inquiry({ ...typed, contact: '(801) 555-0134' }))
    await sendInquiry(inquiry({ ...typed, contact: 'jane@example' }))
    fakeEmailJS(async () => new Response('Bad request', { status: 400 }))
    await sendInquiry(inquiry({ ...typed, contact: 'jane@example.com' }))

    expect(events.map(event => event[1])).toEqual(['generate_lead', 'generate_lead', 'form_error', 'form_error'])
    const sent = JSON.stringify(events)
    for (const text of ['Jane', 'jane@example', '555-0134', 'task chairs']) {
      expect(sent).not.toContain(text)
    }
  })

  test('a GA4 error never turns a sent inquiry into a failure', async () => {
    const requests = fakeEmailJS()
    fakeGA(() => { throw new Error('GA4 blocked') })
    expect(await sendInquiry(inquiry())).toEqual({ status: 'sent' })
    expect(requests).toHaveLength(1)
  })
})
