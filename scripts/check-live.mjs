#!/usr/bin/env node
// Checks a deployed copy of foxbuiltstore.com from the outside:
//
//   node scripts/check-live.mjs https://foxbuiltstore.com
//   node scripts/check-live.mjs https://deploy-preview-12--<site>.netlify.app --preview
//
// It reads <origin>/sitemap.xml and fetches every page in it from <origin> (the sitemap
// holds production URLs, so their host is swapped for <origin>). Every page must answer
// 200 with one canonical, its production URL.
// - Production: no page says noindex, in its X-Robots-Tag header or its robots meta.
// - Preview: Netlify adds "X-Robots-Tag: noindex" to every non-production deploy, and each
//   page's own robots meta must say "index", so the page is indexable once it goes live.
// Both modes check that /foxbot answers 301 to /; production also checks the old domain.
// Plain Node 18 (its built-in fetch), no dependencies.

const SITE = 'https://foxbuiltstore.com'

// The old domain from the business-card QR codes; config/netlify.toml sends it home.
const OLD_DOMAIN_URLS = [
  'https://foxbuiltofficefurniture.com/',
  'https://www.foxbuiltofficefurniture.com/',
  'https://foxbuiltofficefurniture.com/an-old-page',
]

const USAGE = 'usage: node scripts/check-live.mjs <origin> [--preview]'
const args = process.argv.slice(2)
const preview = args.includes('--preview')
const rest = args.filter(arg => arg !== '--preview')
if (rest.length !== 1 || !/^https?:\/\/[^/]/.test(rest[0])) {
  console.error(USAGE)
  process.exit(2)
}
const origin = new URL(rest[0]).origin

async function checkPage(loc) {
  const url = new URL(loc)
  const response = await get(origin + url.pathname + url.search)
  if (response.status !== 200) return [`answers ${describe(response)}, want 200`]
  const html = await response.text()
  const problems = []

  const canonicals = tagsNamed(html, 'link')
    .filter(tag => attr(tag, 'rel').toLowerCase() === 'canonical')
    .map(tag => attr(tag, 'href'))
  if (canonicals.length !== 1) {
    problems.push(`${canonicals.length} canonicals, want one: ${loc}`)
  } else if (normalUrl(canonicals[0]) !== normalUrl(loc)) {
    problems.push(`canonical is ${canonicals[0]}, want ${loc}`)
  }

  const header = response.headers.get('x-robots-tag') || ''
  const meta = robots(html)
  if (preview) {
    if (!/noindex/i.test(header)) problems.push(`no "X-Robots-Tag: noindex" header: is ${origin} really a preview?`)
    if (!/\bindex\b/i.test(meta) || /noindex/i.test(meta)) problems.push(`robots meta is "${meta || 'missing'}", want "index"`)
  } else {
    if (/noindex/i.test(header)) problems.push(`X-Robots-Tag header is "${header}"`)
    if (/noindex/i.test(meta)) problems.push(`robots meta is "${meta}"`)
  }
  return problems
}

async function checkRedirect(from, to) {
  const response = await get(from)
  const location = response.headers.get('location')
  if (response.status === 301 && location && new URL(location, from).href === to) return []
  return [`answers ${describe(response)}, want 301 to ${to}`]
}

function get(url) {
  return fetch(url, {
    redirect: 'manual',
    headers: { 'user-agent': 'foxbuilt-check-live' },
    signal: AbortSignal.timeout(20000),
  })
}

function describe(response) {
  const location = response.headers.get('location')
  return `${response.status}${location ? ` to ${location}` : ''}`
}

function tagsNamed(html, name) {
  return html.match(new RegExp(`<${name}\\b[^>]*>`, 'gi')) || []
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'))
  return match ? (match[1] ?? match[2] ?? match[3]).replace(/&amp;/g, '&') : ''
}

// What the robots (and googlebot) meta tags say, e.g. "index, follow".
function robots(html) {
  const said = tagsNamed(html, 'meta')
    .filter(tag => /^(robots|googlebot)$/i.test(attr(tag, 'name')))
    .map(tag => attr(tag, 'content'))
  return [...new Set(said)].join(' / ')
}

// https://foxbuiltstore.com and https://foxbuiltstore.com/ name the same page.
function normalUrl(url) {
  const parsed = new URL(url, SITE)
  return parsed.origin + parsed.pathname.replace(/\/+$/, '') + parsed.search
}

// Run the checks.

let checked = 0
let failed = 0
async function check(label, run) {
  let problems
  try {
    problems = await run()
  } catch (error) {
    problems = [`could not check: ${error.cause?.message || error.message}`]
  }
  checked++
  if (problems.length) failed++
  console.log(`${problems.length ? 'FAIL' : 'PASS'}  ${label}`)
  for (const problem of problems) console.log(`        ${problem}`)
}

console.log(`check-live: ${origin}, ${preview ? 'preview' : 'production'}`)
console.log(`Each sitemap page: 200, one canonical (its production URL), ${preview
  ? 'Netlify\'s noindex header, robots meta "index"'
  : 'no noindex in the header or the robots meta'}.\n`)

let locs = []
await check(`${origin}/sitemap.xml lists the pages`, async () => {
  const response = await get(`${origin}/sitemap.xml`)
  if (response.status !== 200) return [`answers ${describe(response)}, want 200`]
  locs = ((await response.text()).match(/<loc>\s*[^<\s]+\s*<\/loc>/g) || [])
    .map(entry => new URL(entry.replace(/<\/?loc>/g, '').trim(), SITE).href)
  return locs.length ? [] : ['no <loc> entries']
})
for (const loc of locs) {
  await check(new URL(loc).pathname, () => checkPage(loc))
}
await check('/foxbot answers 301 to /', () => checkRedirect(`${origin}/foxbot`, `${origin}/`))
if (!preview) {
  for (const url of OLD_DOMAIN_URLS) {
    await check(`${url} answers 301 to ${SITE}/`, () => checkRedirect(url, `${SITE}/`))
  }
}

console.log(`\n${checked - failed} of ${checked} checks pass.`)
if (failed) process.exit(1)
