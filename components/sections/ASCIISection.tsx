'use client'

import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import ASCIITextFallback from '@/components/ui/ASCIITextFallback'

// The animated banner needs three.js, nearly half of the page's JavaScript, so its code
// downloads only when this section nears the screen. Until then, and whenever the
// animation can't run, the plain word shows instead.
const ASCIIText = lazy(() => import('@/components/ui/ASCIIText'))

// Second guard: if the banner throws anyway, or its code fails to download, show the
// plain word here instead of letting the error replace the whole page.
class BannerErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error) {
    console.warn('FOXBUILT banner failed, showing plain text instead:', error)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

export default function ASCIISection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isDuckDuckGo, setIsDuckDuckGo] = useState(false)
  const [isNearScreen, setIsNearScreen] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    // Browsers too old for IntersectionObserver keep the plain word.
    if (!section || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNearScreen(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px 0px' }
    )
    observer.observe(section)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    // Detect DuckDuckGo browser
    if (typeof navigator !== 'undefined') {
      const userAgent = navigator.userAgent.toLowerCase()
      // DuckDuckGo browser includes 'duckduckgo' in the user agent
      const isDDG = userAgent.includes('duckduckgo') || 
                    userAgent.includes('ddg') ||
                    // Also check for DuckDuckGo on desktop which might use modified Chrome/Safari UA
                    (userAgent.includes('chrome') && window.navigator.vendor === 'DuckDuckGo')
      setIsDuckDuckGo(isDDG)
    }
  }, [])

  useEffect(() => {
    // Skip mouse tracking on mobile or DuckDuckGo browser
    if (typeof window === 'undefined' || window.innerWidth < 768 || isDuckDuckGo) return

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!sectionRef.current) return
      
      // Get the ASCII section's position
      const rect = sectionRef.current.getBoundingClientRect()
      
      // Check if cursor is in the contact section (above ASCII section)
      const contactSection = document.getElementById('contact')
      if (contactSection) {
        const contactRect = contactSection.getBoundingClientRect()
        
        // If mouse is in contact section or ASCII section, dispatch event to ASCII container
        if ((e.clientY >= contactRect.top && e.clientY <= rect.bottom) && 
            (e.clientX >= 0 && e.clientX <= window.innerWidth)) {
          
          // Create a synthetic mouse event for the ASCII container
          const asciiContainer = sectionRef.current.querySelector('.ascii-text-container')
          if (asciiContainer) {
            const syntheticEvent = new MouseEvent('mousemove', {
              clientX: e.clientX,
              clientY: e.clientY,
              bubbles: true
            })
            asciiContainer.dispatchEvent(syntheticEvent)
          }
        }
      }
    }

    // Add global listener
    document.addEventListener('mousemove', handleGlobalMouseMove)

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
    }
  }, [isDuckDuckGo])

  const plainText = <ASCIITextFallback text="FOXBUILT" color="#fdf9f3" />

  return (
    <section ref={sectionRef} className="relative bg-slate-900 py-8 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="relative" style={{ height: '120px' }}>
          {isNearScreen ? (
            <BannerErrorBoundary fallback={plainText}>
              <Suspense fallback={plainText}>
                <ASCIIText
                  text="FOXBUILT"
                  asciiFontSize={7}
                  textFontSize={200}
                  textColor="#fdf9f3"
                  planeBaseHeight={8}
                  enableWaves={false}
                />
              </Suspense>
            </BannerErrorBoundary>
          ) : (
            plainText
          )}
        </div>
      </div>
    </section>
  )
}