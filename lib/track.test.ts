// Tests for lib/track.ts. Run with `bun test`. Nothing reaches Google: each test puts a
// stand-in gtag on a stand-in window and records what it gets.

import { afterEach, describe, expect, test } from 'bun:test'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { track, trackCall, trackFormError, trackFormStart, trackLead } from './track'

const ROOT = fileURLToPath(new URL('..', import.meta.url))

// Stands in for GA4 on a page: records each gtag() call
function fakeGA() {
  const calls: unknown[][] = []
  ;(globalThis as any).window = { gtag: (...args: unknown[]) => { calls.push(args) } }
  return calls
}

// What a form's onFocus hands to trackFormStart
const box = { tagName: 'INPUT' } as unknown as EventTarget
const messageBox = { tagName: 'TEXTAREA' } as unknown as EventTarget
const button = { tagName: 'BUTTON' } as unknown as EventTarget

afterEach(() => {
  delete (globalThis as any).window
})

describe('track', () => {
  test('sends an event to GA4', () => {
    const calls = fakeGA()
    track('contact', { location: 'footer' })
    expect(calls).toEqual([['event', 'contact', { location: 'footer' }]])
  })

  test('does nothing without GA4: while the site is built, or when GA4 is blocked or not loaded yet', () => {
    expect(() => track('contact', {})).not.toThrow()
    ;(globalThis as any).window = {}
    expect(() => track('contact', {})).not.toThrow()
  })

  test('never lets a GA4 error stop a call or a form', () => {
    ;(globalThis as any).window = { gtag: () => { throw new Error('blocked') } }
    expect(() => track('contact', {})).not.toThrow()
  })
})

describe('trackCall', () => {
  test("sends 'contact' with where the phone link is, keeping the header's old parameters", () => {
    const calls = fakeGA()
    trackCall('header')
    trackCall('footer')
    expect(calls).toEqual([
      ['event', 'contact', { event_category: 'phone', event_label: 'header_phone_click', location: 'header' }],
      ['event', 'contact', { event_category: 'phone', event_label: 'footer_phone_click', location: 'footer' }],
    ])
  })
})

describe('trackFormStart', () => {
  test('counts a form once, the first time someone clicks or tabs into a box', () => {
    const calls = fakeGA()
    trackFormStart('Homepage quote form', box)
    trackFormStart('Homepage quote form', messageBox)
    trackFormStart('Homepage quote form', box)
    expect(calls).toEqual([['event', 'form_start_custom', { form_name: 'Homepage quote form' }]])
  })

  test('counts each form on its own', () => {
    const calls = fakeGA()
    trackFormStart('Contact form', box)
    trackFormStart('Product form', messageBox)
    expect(calls.map(call => call[2])).toEqual([{ form_name: 'Contact form' }, { form_name: 'Product form' }])
  })

  test("doesn't count focus on a button, like the rocket next to SEND", () => {
    const calls = fakeGA()
    trackFormStart('Rocket test form', button)
    trackFormStart('Rocket test form', null)
    expect(calls).toEqual([])
    trackFormStart('Rocket test form', box)
    expect(calls).toHaveLength(1)
  })
})

describe('trackLead and trackFormError', () => {
  test("send generate_lead with the homepage form's old parameters and the form's name", () => {
    const calls = fakeGA()
    trackLead('Product form')
    expect(calls).toEqual([['event', 'generate_lead', {
      form_name: 'Product form',
      event_category: 'contact',
      event_label: 'contact_form_submission',
      value: 1,
    }]])
  })

  test('send form_error with the form and the reason', () => {
    const calls = fakeGA()
    trackFormError('Contact form', 'send_failed')
    expect(calls).toEqual([['event', 'form_error', { form_name: 'Contact form', error_type: 'send_failed' }]])
  })
})

// Every .ts and .tsx file of the site's code, as paths from the repo root
function siteCode() {
  return ['app', 'components', 'lib'].flatMap(dir =>
    readdirSync(join(ROOT, dir), { recursive: true, encoding: 'utf8' })
      .filter(path => /\.tsx?$/.test(path) && !path.endsWith('.test.ts'))
      .map(path => join(dir, path)))
}

describe('phone links', () => {
  test('every phone link in the site code tells GA4 about the tap', () => {
    let links = 0
    const untracked = siteCode().filter(file => {
      const source = readFileSync(join(ROOT, file), 'utf8')
      const here = (source.match(/["'`]tel:/g) || []).length
      links += here
      return (source.match(/\btrackCall\(/g) || []).length < here
    })
    expect(untracked).toEqual([])
    expect(links).toBeGreaterThan(10) // the scan found the site's phone links
  })
})
