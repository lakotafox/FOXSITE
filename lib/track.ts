// Google Analytics (GA4) events for foxbuiltstore.com. app/google-analytics.tsx loads GA4
// and marks our own visits (?internal=1); the site sends its own events through this file:
//
//   contact            a tap on a phone link; `location` says which one
//   form_start_custom  the first click or tab into a form's boxes; `form_name` says which form
//   generate_lead      a form was sent (GA4 counts it as a lead); `form_name` says which form
//   form_error         a form wasn't sent; `form_name` and `error_type` say which and why
//
// No event carries anything a visitor typed or who they are: no names, email addresses,
// phone numbers or messages. Only the fixed words in this file and the forms' names.

type EventParams = Record<string, string | number>

// Sends one event. It does nothing when GA4 isn't there (blocked, not loaded yet, or while
// the site is built), and a GA4 error never stops a call or a form.
export function track(event: string, params: EventParams) {
  try {
    const gtag = typeof window === 'undefined' ? undefined : (window as any).gtag
    if (typeof gtag === 'function') gtag('event', event, params)
  } catch {
    // The visitor's tap or form carries on without the event
  }
}

// Where each phone link is, as GA4 shows it in the event's `location`
export type CallLocation =
  | 'header' // the round phone button in the top bar
  | 'hero' // "Call (801) 899-9406" under the big title on /
  | 'catalog' // "Call (801) 899-9406" under the flipbook on /
  | 'about' // the Contact button on Kyle's card on /
  | 'footer' // the number in the footer
  | 'no_products' // "Call (801) 899-9406" where a category has no products to show
  | 'product' // the phone button on a product's details
  | 'error_page' // the number on the "Something went wrong" pages
  | 'coming_soon' // the phone button in the "Coming soon" box (only in the /carrie editor)
  | 'showroom' // the number in the showroom section (no page shows it today)

// A tap on a phone link. 'contact' is the name GA4 has counted the header's phone taps
// under, and the old parameters stay, so earlier months still compare.
export function trackCall(location: CallLocation) {
  track('contact', { event_category: 'phone', event_label: `${location}_phone_click`, location })
}

// Forms whose start GA4 has already heard about since the page loaded
const startedForms = new Set<string>()

// Call it from a form's onFocus with the element that got focus. The first time a visitor
// clicks or tabs into one of the form's boxes, GA4 gets 'form_start_custom'. It counts
// once per form until the page reloads (the site's own links don't reload it), and focus
// on a button (like the rocket) doesn't count. GA4's own automatic event is called
// form_start, so ours has a name of its own.
export function trackFormStart(formName: string, focused: EventTarget | null) {
  const tag = (focused as Element | null)?.tagName
  if ((tag !== 'INPUT' && tag !== 'TEXTAREA') || startedForms.has(formName)) return
  startedForms.add(formName)
  track('form_start_custom', { form_name: formName })
}

// A form was sent. The homepage form has always sent generate_lead with these parameters;
// every form now does, with its name added.
export function trackLead(formName: string) {
  track('generate_lead', {
    form_name: formName,
    event_category: 'contact',
    event_label: 'contact_form_submission',
    value: 1,
  })
}

// A form wasn't sent: 'invalid_contact' when the email / phone box held neither, so the
// visitor was asked to fix it; 'send_failed' when EmailJS or the network failed, so the
// visitor was shown the phone number instead.
export function trackFormError(formName: string, errorType: 'invalid_contact' | 'send_failed') {
  track('form_error', { form_name: formName, error_type: errorType })
}
