#!/usr/bin/env node
// Safety rails for foxbuiltstore.com. Run them after `bun run build`:
//
//   node scripts/check-build.mjs             every rule
//   node scripts/check-build.mjs --task 4    only the rules for one task of the Milestone 1 plan
//   node scripts/check-build.mjs --verbose   list every problem, not just the first few
//
// Each rule names the Milestone 1 task it checks; most fail until that task lands, and the
// rest guard against that task breaking something. Plain Node 18 with no dependencies, so
// it could become a postbuild step later. Netlify doesn't run it today.

import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const OUT = join(ROOT, 'out')
const SELF = 'scripts/check-build.mjs'
const SITE = 'https://foxbuiltstore.com'

// Another company's domain. The store's own domains, foxbuiltstore.com and
// foxbuiltofficefurniture.com, don't contain it.
const WRONG_DOMAIN = 'foxbuilt.com'

// The private editors. Their bundles hold sample data, so the public-page rules skip them.
const PRIVATE_ROUTES = ['/carrie', '/products-editor']

// Claims nobody has confirmed, matched exactly (ignoring case). When Kyle confirms one,
// delete it from this list rather than loosening the rule: the bare word "warranty" is fine.
const PLACEHOLDER_CLAIMS = [
  '5-year warranty',
  '1-year warranty',
  'Lifetime frame warranty',
  'Warranty Included',
  'Warranty: 10 year limited',
  'ADA compliant',
  'Fire resistant',
  'Professionally delivered and installed',
  'Professionally stored delivered and installed',
]

// Brand names from the sample product cards, matched as whole words with exact case.
// A brand Kyle confirms comes off this list the same way.
const BRAND_NAMES = [
  'AIS', 'Allsteel', 'Branch Ergonomic', 'Bush Business', 'Fully Jarvis', 'Global Bridges',
  'Global Evolve', 'Haworth', 'Herman Miller', 'HON', 'IKEA', 'Knoll', 'Sauder', 'Steelcase',
  'Teknion', 'Tribesigns', 'UPLIFT', 'Walker Edison',
]

// Pages that must carry real content in their first HTML (Task 4).
const CONTENT_PAGES = ['/', '/products', '/gallery']
const MIN_WORDS = 20 // before Task 4 they ship one word: "Loading..."

// What / must show as text in its first HTML (Task 4).
const HOME_DETAILS = {
  'phone (801) 899-9406': /\(?801\)?[\s.-]*899[\s.-]*9406/,
  'street address (420 W Industrial Dr)': /420 W\.? Industrial Dr/i,
  'Bldg LL': /\b(Bldg|Building)\.? LL\b/i,
  'hours (Mon–Fri)': /\bMon(day)?\.?\s*(-|–|—|to|through)\s*Fri(day)?\b/i,
}

// Utility pages kept out of Google (Task 5).
const NOINDEX_PAGES = ['/search', '/product-detail', '/games']

// Hero photo budget (Task 6).
const KB = 1024
const MAX_HERO_BYTES = 800 * KB
const MAX_HEROES_BYTES = 3 * 1024 * KB

// How many problems a failing rule lists without --verbose.
const MAX_SHOWN = 12

const rules = [
  {
    task: 1,
    title: `"${WRONG_DOMAIN}" (another company's domain) appears nowhere in the source or out/`,
    check: () => {
      const pattern = new RegExp(escapeRegExp(WRONG_DOMAIN), 'gi')
      const files = [...sourceFiles(), ...walk(OUT)].filter(file => display(file) !== SELF)
      return files.flatMap(file => find(file, pattern))
    },
  },
  {
    task: 3,
    title: 'No self-declared star rating (aggregateRating) in the public pages, their JSON or their scripts',
    check: () => publicFiles().flatMap(file => find(file, /aggregateRating/gi)),
  },
  {
    task: 3,
    title: 'No unconfirmed claims or sample brand names in the public pages, their JSON or their scripts',
    check: () => {
      const claims = new RegExp(PLACEHOLDER_CLAIMS.map(escapeRegExp).join('|'), 'gi')
      const brands = new RegExp(BRAND_NAMES.map(brand => `\\b${escapeRegExp(brand)}\\b`).join('|'), 'g')
      return publicFiles().flatMap(file => [...find(file, claims), ...find(file, brands)])
    },
  },
  {
    task: 4,
    title: `${CONTENT_PAGES.join(', ')} have a non-empty H1 in their first HTML`,
    check: () => CONTENT_PAGES.flatMap(route => {
      const page = pageAt(route)
      if (!page) return [`${route}: no page in out/`]
      return headings(page.html).some(Boolean) ? [] : [`${page.name}: no H1 with text`]
    }),
  },
  {
    task: 4,
    title: `${CONTENT_PAGES.join(', ')} have real text in their first HTML, not just "Loading..."`,
    check: () => CONTENT_PAGES.flatMap(route => {
      const page = pageAt(route)
      if (!page) return [`${route}: no page in out/`]
      const words = bodyText(page.html).replace(/\bloading\b\.*/gi, ' ').split(' ').filter(Boolean)
      if (words.length >= MIN_WORDS) return []
      return [`${page.name}: ${words.length} words besides "Loading...", want ${MIN_WORDS} or more`]
    }),
  },
  {
    task: 4,
    title: '/ shows the phone, the address with Bldg LL and the hours in its first HTML',
    check: () => {
      const page = pageAt('/')
      if (!page) return ['/: no page in out/']
      const text = bodyText(page.html)
      const missing = Object.keys(HOME_DETAILS).filter(detail => !HOME_DETAILS[detail].test(text))
      return missing.length ? [`${page.name}: no ${missing.join(', no ')}`] : []
    },
  },
  {
    task: 4,
    title: 'No page says "EST." next to 2025 (the store dates from 1999)',
    check: () => appPages()
      .filter(page => /\bEST\.?\s*2025\b/i.test(bodyText(page.html)))
      .map(page => `${page.name}: "EST. 2025"`),
  },
  {
    task: 4,
    title: 'No page links to /foxbot',
    check: () => appPages()
      .filter(page => /href=["']\/foxbot\b/i.test(page.html))
      .map(page => `${page.name}: href="/foxbot"`),
  },
  {
    task: 4,
    title: '/ has no search box in its first HTML',
    check: () => {
      const page = pageAt('/')
      if (!page) return ['/: no page in out/']
      return /<input\b[^>]*search/i.test(page.html) ? [`${page.name}: has a search input`] : []
    },
  },
  {
    task: 5,
    title: 'Each sitemap page has one canonical, its own URL, and no page points its canonical elsewhere',
    check: () => {
      const listed = new Set(sitemapEntries().map(entry => normalUrl(entry.loc)))
      return exportedPages().flatMap(page => {
        // 404 and files copied from public/ have no URL of their own, so no canonical either.
        const own = page.route === '/404' || page.copied ? null : normalUrl(SITE + page.route)
        const canonicals = tagsNamed(page.html, 'link')
          .filter(tag => attr(tag, 'rel').toLowerCase() === 'canonical')
          .map(tag => attr(tag, 'href'))
        const problems = []
        if (canonicals.length === 0 && listed.has(own)) problems.push(`${page.name}: no canonical`)
        if (canonicals.length > 1) problems.push(`${page.name}: ${canonicals.length} canonicals`)
        for (const href of canonicals) {
          if (normalUrl(href) !== own) problems.push(`${page.name}: canonical points at ${href}`)
        }
        return problems
      })
    },
  },
  {
    task: 5,
    title: 'Every public page keeps its og:image (the picture in link previews)',
    check: () => appPages()
      .filter(page => page.route !== '/404')
      .filter(page => !tagsNamed(page.html, 'meta')
        .some(tag => attr(tag, 'property') === 'og:image' && attr(tag, 'content')))
      .map(page => `${page.name}: no og:image`),
  },
  {
    task: 5,
    title: 'The sitemap lists only real pages meant for Google, each with a lastmod date',
    check: () => {
      const entries = sitemapEntries()
      if (!entries.length) return ['out/sitemap.xml: no URLs']
      return entries.flatMap(({ loc, lastmod }) => {
        const url = new URL(loc, SITE)
        if (url.origin !== SITE) return [`sitemap.xml: ${loc} is not on ${SITE}`]
        const page = pageAt(url.pathname.replace(/\/+$/, '') || '/')
        if (!page) return [`sitemap.xml lists ${loc}, but out/ has no such page`]
        const problems = []
        if (/noindex/i.test(robots(page.html))) problems.push(`sitemap.xml lists ${loc}, which says noindex`)
        if (!lastmod) problems.push(`sitemap.xml: ${loc} has no lastmod`)
        return problems
      })
    },
  },
  {
    task: 5,
    title: `${NOINDEX_PAGES.join(', ')} ask Google not to index them`,
    check: () => NOINDEX_PAGES
      .map(pageAt)
      .filter(page => page && !/noindex/i.test(robots(page.html)))
      .map(page => `${page.name}: robots meta is "${robots(page.html) || 'missing'}"`),
  },
  {
    task: 6,
    title: `Hero photos are light: each under ${MAX_HERO_BYTES / KB} KB, together under ${MAX_HEROES_BYTES / KB / KB} MB`,
    check: () => {
      const content = JSON.parse(readFileSync(join(OUT, 'content.json'), 'utf8'))
      const heroes = [...new Set([...(content.gallery || []), ...(content.mobileGallery || [])])]
        .filter(src => src.startsWith('/'))
      const problems = []
      let total = 0
      for (const src of heroes) {
        const stats = statSync(join(OUT, decodeURI(src)), { throwIfNoEntry: false })
        if (!stats) {
          problems.push(`${src}: missing from out/`)
          continue
        }
        total += stats.size
        if (stats.size > MAX_HERO_BYTES) problems.push(`${src}: ${Math.round(stats.size / KB)} KB`)
      }
      if (total > MAX_HEROES_BYTES) problems.push(`all ${heroes.length} together: ${(total / KB / KB).toFixed(1)} MB`)
      return problems
    },
  },
]

// Every file git would commit: tracked files plus new ones that aren't ignored, so
// node_modules, .next, out and the private notes in .git/info/exclude stay out.
function sourceFiles() {
  try {
    const listed = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    return [...new Set(listed.split('\0'))]
      .filter(Boolean)
      .map(path => join(ROOT, path))
      .filter(file => statSync(file, { throwIfNoEntry: false })?.isFile())
  } catch {
    // No git here (a copied folder, say): scan the folder instead.
    return walk(ROOT, ['node_modules', '.git', '.next', 'out'])
  }
}

// Every file under a folder, skipping folders with the given names.
function walk(dir, skip = [], files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (!skip.includes(entry.name)) walk(path, skip, files)
    } else if (entry.isFile()) {
      files.push(path)
    }
  }
  return files
}

// Every page the static export wrote, with its route.
let pages
function exportedPages() {
  pages ??= walk(OUT, ['_next']).filter(file => file.endsWith('.html')).map(file => {
    const path = relative(OUT, file).split(sep).join('/')
    const route = '/' + path.replace(/\.html$/, '').replace(/(^|\/)index$/, '')
    return {
      route,
      file,
      name: `out/${path}`,
      html: readFileSync(file, 'utf8'),
      private: PRIVATE_ROUTES.some(prefix => route === prefix || route.startsWith(prefix + '/')),
      // Copied as-is from public/ (like test-flipbook.html), so not a page of the app.
      copied: existsSync(join(ROOT, 'public', path)),
    }
  })
  return pages
}

// The app's public pages, 404 included.
function appPages() {
  return exportedPages().filter(page => !page.private && !page.copied)
}

function pageAt(route) {
  return exportedPages().find(page => page.route === route && !page.copied)
}

// Everything a visitor's browser can load from the public pages: their HTML and RSC
// payloads (.txt), the JSON copied from public/, and every script except the chunks
// that only the editors load.
let publicCache
function publicFiles() {
  if (!publicCache) {
    const chunksOf = list => new Set(list.flatMap(page => page.html.match(/static\/chunks\/[^"'\\\s]+?\.js/g) || []))
    const editorPages = exportedPages().filter(page => page.private)
    const publicChunks = chunksOf(exportedPages().filter(page => !page.private))
    const skip = new Set([
      ...editorPages.flatMap(page => [page.file, page.file.replace(/\.html$/, '.txt')]),
      ...[...chunksOf(editorPages)]
        .filter(chunk => !publicChunks.has(chunk))
        .map(chunk => join(OUT, '_next', decodeURI(chunk))),
    ])
    publicCache = walk(OUT).filter(file => /\.(html|txt|json|js)$/.test(file) && !skip.has(file))
  }
  return publicCache
}

// Where a pattern (with the g flag) matches in a file, as one line: path, first line, what matched.
// Reads bytes as latin1, which is fast even for photos and the catalog PDF; every pattern
// here is plain ASCII, so it matches exactly as it would in UTF-8.
function find(file, pattern) {
  const bytes = readFileSync(file)
  const text = bytes.toString('latin1')
  const found = text.match(pattern)
  if (!found) return []
  const binary = bytes.subarray(0, 8000).includes(0)
  const line = binary ? '' : `:${text.slice(0, text.search(pattern)).split('\n').length}`
  const matched = [...new Set(found)].map(match => `"${match}"`).join(', ')
  return [`${display(file)}${line}  ${matched}${found.length > 1 ? ` (${found.length} matches)` : ''}`]
}

function display(file) {
  return relative(ROOT, file).split(sep).join('/')
}

// The text a person, or a crawler that skips JavaScript, sees in a piece of HTML.
function textOf(html) {
  return decode(html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|noscript|template|svg)\b[\s\S]*?<\/\1\s*>/gi, ' ')
    .replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

function bodyText(html) {
  return textOf(html.replace(/^[\s\S]*?<body\b[^>]*>/i, ''))
}

function headings(html) {
  return (html.match(/<h1\b[^>]*>[\s\S]*?<\/h1\s*>/gi) || []).map(textOf)
}

function decode(text) {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

function tagsNamed(html, name) {
  return html.match(new RegExp(`<${name}\\b[^>]*>`, 'gi')) || []
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'))
  return match ? decode(match[1] ?? match[2] ?? match[3]) : ''
}

// What the robots (and googlebot) meta tags say, e.g. "index, follow".
function robots(html) {
  const said = tagsNamed(html, 'meta')
    .filter(tag => /^(robots|googlebot)$/i.test(attr(tag, 'name')))
    .map(tag => attr(tag, 'content'))
  return [...new Set(said)].join(' / ')
}

function sitemapEntries() {
  const xml = readFileSync(join(OUT, 'sitemap.xml'), 'utf8')
  return (xml.match(/<url>[\s\S]*?<\/url>/g) || []).map(entry => ({
    loc: (entry.match(/<loc>\s*([^<\s]+)\s*<\/loc>/) || [])[1] || '',
    lastmod: (entry.match(/<lastmod>\s*([^<\s]+)\s*<\/lastmod>/) || [])[1] || '',
  }))
}

// https://foxbuiltstore.com and https://foxbuiltstore.com/ name the same page.
function normalUrl(url) {
  const parsed = new URL(url, SITE)
  return parsed.origin + parsed.pathname.replace(/\/+$/, '') + parsed.search
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Run the rules.

const USAGE = 'usage: node scripts/check-build.mjs [--task <n>[,<n>...]] [--verbose]'
const args = process.argv.slice(2)
const verbose = args.includes('--verbose')
const taskAt = args.indexOf('--task')
const taskList = taskAt === -1 ? null : args[taskAt + 1] || ''
const unknown = args.filter((arg, i) => arg !== '--verbose' && (taskAt === -1 || (i !== taskAt && i !== taskAt + 1)))
if (unknown.length || (taskList !== null && !/^\d+(,\d+)*$/.test(taskList))) {
  console.error(USAGE)
  process.exit(2)
}
const tasks = taskList ? taskList.split(',').map(Number) : null

const selected = rules.filter(rule => !tasks || tasks.includes(rule.task))
if (!selected.length) {
  console.error(`No rules for task ${tasks.join(', ')}. Rules exist for tasks ${[...new Set(rules.map(rule => rule.task))].join(', ')}.`)
  process.exit(2)
}
if (!existsSync(join(OUT, 'index.html'))) {
  console.error('No out/index.html: run `bun run build` first.')
  process.exit(1)
}

const builtAt = statSync(join(OUT, 'index.html')).mtime.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
console.log(`check-build: ${selected.length} rules, on out/ built ${builtAt}\n`)

const failed = []
for (const rule of selected) {
  let problems
  try {
    problems = rule.check()
  } catch (error) {
    problems = [`could not check: ${error.message}`]
  }
  console.log(`${problems.length ? 'FAIL' : 'PASS'}  Task ${rule.task}  ${rule.title}`)
  if (!problems.length) continue
  failed.push(rule)
  const shown = verbose ? problems : problems.slice(0, MAX_SHOWN)
  for (const problem of shown) console.log(`        ${problem}`)
  if (shown.length < problems.length) console.log(`        ... and ${problems.length - shown.length} more (--verbose lists them all)`)
}

console.log(`\n${selected.length - failed.length} of ${selected.length} rules pass.`)
if (failed.length) {
  const failedTasks = [...new Set(failed.map(rule => rule.task))]
  const which = failedTasks.length > 1 ? 'tasks' : 'task'
  console.log(`Failing rules belong to Milestone 1 ${which} ${failedTasks.join(', ')}. One task's rules: node scripts/check-build.mjs --task <n>`)
  process.exit(1)
}
