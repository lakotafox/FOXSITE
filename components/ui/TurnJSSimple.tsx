'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, ChevronDown, Download, Maximize, Minimize, ZoomIn, ZoomOut } from 'lucide-react'
import useEmblaCarousel from 'embla-carousel-react'

export default function TurnJSSimple() {
  const [isReady, setIsReady] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [bottomIndexOpen, setBottomIndexOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : false)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [PageFlipModule, setPageFlipModule] = useState<any>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)
  const flipbookRef = useRef<HTMLDivElement>(null)
  const pageFlipRef = useRef<any>(null)

  // Embla carousel for mobile
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    skipSnaps: false,
    duration: 20,
    startIndex: 0,
  })
  const prevEmblaIndexRef = useRef(0)

  const totalPages = 164

  // Array of page turn sound files - KEEPING YOUR SOUNDS!
  const pageTurnSounds = [
    '/turning-paper (mp3cut.net).mp3',
    '/turning-paper (mp3cut.net) (1).mp3',
    '/turning-paper (mp3cut.net) (2).mp3',
    '/turning-paper (mp3cut.net) (3).mp3',
    '/turning-paper (mp3cut.net) (4).mp3',
    '/turning-paper (mp3cut.net) (5).mp3',
    '/turning-paper (mp3cut.net) (6).mp3'
  ]

  // Pre-load audio objects for better mobile performance
  const audioPoolRef = useRef<HTMLAudioElement[]>([])
  const coverAudioRef = useRef<HTMLAudioElement | null>(null)
  
  // Initialize audio pool on first user interaction
  const initAudioPool = () => {
    if (audioPoolRef.current.length === 0) {
      audioPoolRef.current = pageTurnSounds.map(sound => {
        const audio = new Audio(sound)
        audio.volume = 1.0
        audio.preload = 'auto'
        return audio
      })
    }
    // Also pre-load cover sound for mobile
    if (!coverAudioRef.current) {
      coverAudioRef.current = new Audio('/cover.mp3')
      coverAudioRef.current.volume = 1.0
      coverAudioRef.current.preload = 'auto'
    }
  }
  
  const playRandomPageTurnSound = () => {
    initAudioPool()
    const randomIndex = Math.floor(Math.random() * pageTurnSounds.length)
    const audio = audioPoolRef.current[randomIndex]
    
    if (audio) {
      audio.currentTime = 0
      audio.play().catch(() => {})
    } else {
      const fallbackAudio = new Audio(pageTurnSounds[randomIndex])
      fallbackAudio.volume = 1.0
      fallbackAudio.play().catch(() => {})
    }
  }

  // Handle click outside to close index dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.relative')) {
        setBottomIndexOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Check if desktop
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768)
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Initialize audio on first user interaction (mobile)
  useEffect(() => {
    const handleFirstInteraction = () => {
      initAudioPool()
      document.removeEventListener('touchstart', handleFirstInteraction)
      document.removeEventListener('click', handleFirstInteraction)
    }
    
    document.addEventListener('touchstart', handleFirstInteraction, { passive: true })
    document.addEventListener('click', handleFirstInteraction, { passive: true })
    
    return () => {
      document.removeEventListener('touchstart', handleFirstInteraction)
      document.removeEventListener('click', handleFirstInteraction)
    }
  }, [])

  // Load PageFlip module (desktop only)
  useEffect(() => {
    if (typeof window !== 'undefined' && isDesktop) {
      import('page-flip').then(module => {
        setPageFlipModule(() => module.PageFlip)
        console.log('PageFlip module loaded successfully')
      }).catch(err => {
        console.error('Failed to load PageFlip module:', err)
        setLoadingError(`Failed to load flipbook library: ${err.message || 'Unknown error'}`)
        // Set ready anyway to show static fallback
        setTimeout(() => {
          setIsReady(true)
        }, 2000)
      })
    }
  }, [])

  // Initialize StPageFlip when module is ready (desktop only)
  useEffect(() => {
    if (!PageFlipModule || !flipbookRef.current || !isDesktop) return

    console.log('Starting flipbook initialization...')
    
    try {
      const isMobile = window.innerWidth < 768
      const containerWidth = containerRef.current?.clientWidth || window.innerWidth
      // Use actual container height (80vh) minus bottom bar (~50px)
      const containerHeight = (containerRef.current?.clientHeight || window.innerHeight * 0.8) - 50

      let bookWidth, bookHeight
      if (isMobile) {
        bookWidth = Math.min(containerWidth * 0.9, 400)
        bookHeight = Math.min(bookWidth * 1.294, containerHeight * 0.95)
      } else {
        // Desktop — fit within container, never exceed available space
        bookWidth = Math.min(containerWidth * 0.78, 1150)
        bookHeight = Math.min(containerHeight * 0.95, 950)
      }

      console.log(`Initializing with dimensions: ${bookWidth}x${bookHeight}, mobile: ${isMobile}`)

      // Initialize StPageFlip with proper portrait/landscape modes
      const pageFlip = new PageFlipModule(flipbookRef.current, {
        width: isMobile ? bookWidth : bookWidth / 2,  // Full width on mobile, half on desktop
        height: bookHeight,
        showCover: true,
        mobileScrollSupport: true,  // Enable for mobile
        useMouseEvents: true,  // Enable for both
        swipeDistance: 30,  // Standard swipe distance
        flippingTime: 600,  // 0.6s for both mobile and desktop
        drawShadow: true,
        autoSize: false,
        maxShadowOpacity: 0.5,
        startPage: 0,
        size: 'fixed',
        minWidth: 100,
        maxWidth: 2000,
        minHeight: 100,
        maxHeight: 1500,
        showPageCorners: true,  // Show corners on both mobile and desktop
        disableFlipByClick: isMobile,  // Disable tap to flip on mobile to allow pinch zoom
        usePortrait: isMobile,  // Single page on mobile, double on desktop
        clickEventForward: false,  // Don't forward click events
        startZIndex: 0
      })

      console.log('PageFlip instance created')
      pageFlipRef.current = pageFlip
      
      // Debug: Log available methods
      console.log('Available methods on pageFlip:', Object.getOwnPropertyNames(Object.getPrototypeOf(pageFlip)))

      // Load pages immediately like it was originally
      const pages = flipbookRef.current?.querySelectorAll('.page')
      console.log(`Found ${pages?.length || 0} pages to load`)
      
      if (pages && pages.length > 0) {
        pageFlip.loadFromHTML(pages)
        console.log('Pages loaded into flipbook')
      } else {
        console.error('No pages found to load')
        setLoadingError('No pages found')
      }

      // Track if we're in a user drag operation
      let isDragging = false
      let soundPlayed = false
      let isInitialLoad = true  // Track if this is the initial cover load
      let flipCount = 0  // Track number of flips to ensure we skip the initial one

      // Add event listeners
      pageFlip.on('flip', (e: any) => {
        console.log('Page flip event:', e)
        // Library uses 0-based index, but we'll treat it as 1-based for our logic
        const newPage = (e.data || 0) + 1  // This makes cover = page 1 internally
        const oldPage = currentPage  // Get the page we're coming FROM
        console.log(`Flipping from page ${oldPage} to page ${newPage}`)
        
        // Check if this is truly the initial load (first flip event)
        flipCount++
        const isFirstFlip = flipCount === 1
        
        setCurrentPage(newPage)
        
        // Sound logic based on transition - NEVER play sound on first flip (page load)
        if (!isFirstFlip) {
          // Cover sound ONLY for these specific transitions:
          // 1. Any page -> page 1 (closing book to cover)
          // 2. Page 1 -> page 2 (opening book from cover)
          // 3. Page 2 -> page 1 (closing from inside cover to cover)
          if ((newPage === 1) || (oldPage === 1 && newPage === 2)) {
            // Play cover sound
            setTimeout(() => {
              initAudioPool()
              if (coverAudioRef.current) {
                coverAudioRef.current.currentTime = 0
                coverAudioRef.current.play().catch(() => {})
              } else {
                const coverAudio = new Audio('/cover.mp3')
                coverAudio.volume = 1.0
                coverAudio.play().catch(() => {})
              }
            }, 550)
          } else if (!soundPlayed) {
            // Play page turn sound for all other transitions
            // Including: page 3 -> page 2, page 2 -> page 3, etc.
            playRandomPageTurnSound()
          }
        }
        
        // Reset flags
        isDragging = false
        soundPlayed = false
        isInitialLoad = false  // No longer initial load after first flip
      })

      // Play sound at the START of flip animation for programmatic flips
      pageFlip.on('changeState', (e: any) => {
        console.log('State change:', e, 'isDragging:', isDragging)
        
        // Simplified - just play sound on programmatic flips
        if (e.data === 'flipping' && !isDragging && !isInitialLoad) {
          const currentPageNum = (pageFlipRef.current?.getCurrentPageIndex() || 0) + 1
          // Only play page turn sound if we're not on cover pages
          if (currentPageNum > 2) {
            playRandomPageTurnSound()
            soundPlayed = true
          }
        }
      })

      // Detect user drag operations
      pageFlip.on('userStart', (e: any) => {
        console.log('User started dragging')
        isDragging = true
        soundPlayed = false
      })


      console.log('Flipbook initialization complete!')
      setIsReady(true)
      
      // Play cover sound when book loads (after animation completes)
      setTimeout(() => {
        initAudioPool() // Ensure audio is initialized
        if (coverAudioRef.current) {
          coverAudioRef.current.currentTime = 0
          coverAudioRef.current.play().catch(() => {
            console.log('Cover sound could not play - user interaction may be required')
          })
        } else {
          const coverAudio = new Audio('/cover.mp3')
          coverAudio.volume = 1.0
          coverAudio.play().catch(() => {
            console.log('Cover sound could not play - user interaction may be required')
          })
        }
      }, 1300) // Delay for cover drop effect
      
    } catch (error) {
      console.error('Error initializing flipbook:', error)
      setLoadingError(`Initialization failed: ${error}`)
      setIsReady(true) // Set ready anyway to show fallback
    }

    return () => {
      if (pageFlipRef.current) {
        try {
          pageFlipRef.current.destroy()
        } catch (e) {
          console.error('Error destroying flipbook:', e)
        }
      }
    }
  }, [PageFlipModule, isDesktop])

  // Handle window resize (desktop only)
  useEffect(() => {
    if (!isReady || !pageFlipRef.current || !isDesktop) return

    const handleResize = () => {
      const isMobile = window.innerWidth < 768
      const containerWidth = containerRef.current?.clientWidth || window.innerWidth
      const containerHeight = (containerRef.current?.clientHeight || window.innerHeight * 0.8) - 50

      let bookWidth, bookHeight
      if (isMobile) {
        bookWidth = Math.min(containerWidth * 0.9, 400)
        bookHeight = Math.min(bookWidth * 1.294, containerHeight * 0.95)
      } else {
        bookWidth = Math.min(containerWidth * 0.78, 1150)
        bookHeight = Math.min(containerHeight * 0.95, 950)
      }

      try {
        pageFlipRef.current?.updateState({
          width: isMobile ? bookWidth : bookWidth / 2,  // Match initial setup
          height: bookHeight,
          usePortrait: isMobile  // Match initial setup
        })
      } catch (e) {
        console.error('Error updating flipbook size:', e)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isReady])

  // Embla carousel: track slide changes and play sounds (mobile only)
  useEffect(() => {
    if (!emblaApi || isDesktop) return

    setIsReady(true)

    const onSelect = () => {
      const index = emblaApi.selectedScrollSnap()
      const newPage = index + 1
      const oldPage = prevEmblaIndexRef.current + 1

      if (index === prevEmblaIndexRef.current) return
      prevEmblaIndexRef.current = index
      setCurrentPage(newPage)

      // Sound logic matching page-flip handler
      if (newPage === 1 || (oldPage === 1 && newPage === 2)) {
        initAudioPool()
        if (coverAudioRef.current) {
          coverAudioRef.current.currentTime = 0
          coverAudioRef.current.play().catch(() => {})
        }
      } else {
        playRandomPageTurnSound()
      }
    }

    emblaApi.on('select', onSelect)
    return () => { emblaApi.off('select', onSelect) }
  }, [emblaApi, isDesktop])

  // Fullscreen toggle for desktop
  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  // Sync fullscreen state with browser
  useEffect(() => {
    const handleChange = () => {
      const fs = !!document.fullscreenElement
      setIsFullscreen(fs)
      if (!fs) setZoomLevel(1)
    }
    document.addEventListener('fullscreenchange', handleChange)
    return () => document.removeEventListener('fullscreenchange', handleChange)
  }, [])

  const isZoomed = zoomLevel > 1

  const nextPage = () => {
    if (isZoomed) setPanOffset({ x: 0, y: 0 })
    if (isDesktop) {
      if (pageFlipRef.current) {
        try {
          pageFlipRef.current.flipNext()
        } catch (e) {
          console.error('Error flipping next:', e)
        }
      }
    } else if (emblaApi) {
      emblaApi.scrollNext()
    }
  }

  const prevPage = () => {
    if (isZoomed) setPanOffset({ x: 0, y: 0 })
    if (isDesktop) {
      if (pageFlipRef.current && currentPage > 1) {
        try {
          pageFlipRef.current.flipPrev('bottom')
        } catch (e) {
          const targetPage = currentPage - 2
          if (targetPage >= 0) {
            pageFlipRef.current.flip(targetPage, 'bottom')
          }
        }
      }
    } else if (emblaApi) {
      emblaApi.scrollPrev()
    }
  }

  // Grab-and-pan when zoomed — pure translate, no scroll limits
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const isPanningRef = useRef(false)
  const panStartRef = useRef({ x: 0, y: 0, ox: 0, oy: 0 })

  // Reset pan when zoom resets
  useEffect(() => {
    if (!isZoomed) setPanOffset({ x: 0, y: 0 })
  }, [isZoomed])

  useEffect(() => {
    if (!isZoomed) return

    const onMouseDown = (e: MouseEvent) => {
      isPanningRef.current = true
      panStartRef.current = { x: e.clientX, y: e.clientY, ox: panOffset.x, oy: panOffset.y }
      document.body.style.cursor = 'grabbing'
      e.preventDefault()
    }
    const onMouseMove = (e: MouseEvent) => {
      if (!isPanningRef.current) return
      setPanOffset({
        x: panStartRef.current.ox + (e.clientX - panStartRef.current.x),
        y: panStartRef.current.oy + (e.clientY - panStartRef.current.y),
      })
    }
    const onMouseUp = () => {
      isPanningRef.current = false
      document.body.style.cursor = ''
    }

    const container = containerRef.current
    if (!container) return
    container.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      container.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      document.body.style.cursor = ''
    }
  }, [isZoomed, panOffset])

  // Scroll wheel zoom in fullscreen
  useEffect(() => {
    if (!isFullscreen) return
    const container = containerRef.current
    if (!container) return

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      setZoomLevel(z => {
        const delta = e.deltaY > 0 ? -0.15 : 0.15
        return Math.min(3, Math.max(1, z + delta))
      })
    }

    container.addEventListener('wheel', onWheel, { passive: false })
    return () => container.removeEventListener('wheel', onWheel)
  }, [isFullscreen])

  const goToPage = (catalogPageNumber: number) => {
    setBottomIndexOpen(false)
    if (isDesktop && pageFlipRef.current) {
      try {
        const pageIndex = catalogPageNumber + 1
        pageFlipRef.current.flip(pageIndex)
      } catch (e) {
        console.error('Error going to page:', e)
      }
    } else if (!isDesktop && emblaApi) {
      emblaApi.scrollTo(catalogPageNumber + 1, false)
    }
  }

  // Generate pages HTML
  const generatePages = () => {
    const pages = []
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <div key={i} className="page" data-density="soft">
          <div className="page-content">
            <img 
              src={`/catalog-pages/page-${i.toString().padStart(3, '0')}.jpg`}
              alt={`Page ${i}`}
              style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain' }}
              loading="lazy"
            />
          </div>
        </div>
      )
    }
    return pages
  }

  // Preload pages ahead of current position for smooth mobile swiping
  const PRELOAD_AHEAD = 5
  useEffect(() => {
    if (isDesktop) return
    for (let i = currentPage + 1; i <= Math.min(currentPage + PRELOAD_AHEAD, totalPages); i++) {
      const img = new Image()
      img.src = `/catalog-pages/page-${i.toString().padStart(3, '0')}.jpg`
    }
  }, [currentPage, isDesktop])

  // Generate carousel slides for mobile
  const generateCarouselSlides = () => {
    const slides = []
    for (let i = 1; i <= totalPages; i++) {
      // Eager load pages near current position, lazy load the rest
      const isNearby = Math.abs(i - currentPage) <= PRELOAD_AHEAD
      slides.push(
        <div
          key={i}
          style={{ flex: '0 0 100%', minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}
        >
          <img
            src={`/catalog-pages/page-${i.toString().padStart(3, '0')}.jpg`}
            alt={`Page ${i}`}
            loading={isNearby ? 'eager' : 'lazy'}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>
      )
    }
    return slides
  }

  return (
    <>
    <div
      ref={containerRef}
      className="relative w-full bg-slate-800 flex flex-col h-full"
      style={{ zIndex: 30 }}
    >
      {/* Flipbook / Carousel Container */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden" style={{ cursor: isZoomed ? 'grab' : undefined }}>
        {/* Loading indicator */}
        {!isReady && (
          <div className="text-white text-2xl font-bold py-12">
            Loading Catalog...
            {loadingError && (
              <div className="text-red-500 text-sm mt-2">
                Error: {loadingError}
              </div>
            )}
          </div>
        )}

        {/* Desktop: Page-flip flipbook */}
        {isDesktop && (
          <>
            <div
              ref={flipbookRef}
              id="flipbook"
              className="flipbook"
              style={{
                position: 'relative',
                touchAction: 'pinch-zoom',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                display: 'block',
                visibility: isReady ? 'visible' : 'hidden',
                transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
                transformOrigin: 'center center',
                transition: isPanningRef.current ? 'none' : 'transform 0.2s ease',
                pointerEvents: isZoomed ? 'none' : 'auto',
              }}
            >
              {generatePages()}
            </div>

            {/* Desktop nav arrows — always visible, float above zoomed content */}
            {isReady && (
              <>
                <button
                  onClick={prevPage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full"
                  style={{ zIndex: 10 }}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextPage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full"
                  style={{ zIndex: 10 }}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </>
        )}

        {/* Mobile: Embla carousel */}
        {!isDesktop && (
          <div
            ref={emblaRef}
            className="w-full h-full overflow-hidden"
            style={{
              visibility: isReady ? 'visible' : 'hidden',
            }}
          >
            <div className="flex h-full" style={{ touchAction: 'pan-y pinch-zoom' }}>
              {generateCarouselSlides()}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .flipbook {
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          transition: none;
        }

        .flipbook .page {
          background-color: white !important;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        }

        .flipbook .page-content {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
        }

        .flipbook .page img {
          pointer-events: none;
          -webkit-user-drag: none;
          user-drag: none;
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .stf__block {
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        }

      `}</style>

      {/* Page indicator + controls (inside containerRef for fullscreen) */}
      <div className="bg-slate-800 text-center py-2" style={{ zIndex: bottomIndexOpen ? 10001 : 5, position: 'relative' }}>
        <div className="flex items-center justify-center gap-3">
          {/* Page indicator */}
          <div className="bg-black/60 text-white px-4 py-2 rounded-full inline-block text-sm">
            {currentPage === 1 ? 'Cover' :
             currentPage === 2 ? 'Inside Cover' :
             `Page ${currentPage - 2} of ${totalPages - 2}`}
          </div>

          {/* INDEX button */}
          <div className="relative">
            <button
              onClick={() => setBottomIndexOpen(!bottomIndexOpen)}
              className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full flex items-center gap-1 border border-slate-500"
            >
              Index
              <ChevronDown className={`w-3 h-3 transition-transform ${bottomIndexOpen ? 'rotate-180' : ''}`} />
            </button>

            {bottomIndexOpen && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 rounded-lg shadow-xl border border-slate-600 py-2 w-[280px] max-h-[60vh] overflow-y-auto" style={{ zIndex: 9999 }}>
                <div className="px-3 py-1.5 text-purple-400 font-bold text-xs uppercase tracking-wider border-b border-slate-700">Desk Pricing</div>
                <button onClick={() => goToPage(29)} className="block w-full text-left px-4 py-2 text-xs text-white hover:bg-slate-600">29: Desk Pricing</button>

                <div className="px-3 py-1.5 text-yellow-500 font-bold text-xs uppercase tracking-wider border-b border-t border-slate-700 mt-1">Desking</div>
                <button onClick={() => goToPage(2)} className="block w-full text-left px-4 py-2 text-xs text-white hover:bg-slate-600">02-32: Classic Laminate</button>
                <button onClick={() => goToPage(34)} className="block w-full text-left px-4 py-2 text-xs text-white hover:bg-slate-600">34-35: Riser Series</button>
                <button onClick={() => goToPage(38)} className="block w-full text-left px-4 py-2 text-xs text-white hover:bg-slate-600">38-43: Elements Collection</button>
                <button onClick={() => goToPage(44)} className="block w-full text-left px-4 py-2 text-xs text-white hover:bg-slate-600">44-45: Encore Collection</button>
                <button onClick={() => goToPage(46)} className="block w-full text-left px-4 py-2 text-xs text-white hover:bg-slate-600">46-50: Signature Collection</button>
                <button onClick={() => goToPage(52)} className="block w-full text-left px-4 py-2 text-xs text-white hover:bg-slate-600">52-53: Struxture Series</button>
                <button onClick={() => goToPage(56)} className="block w-full text-left px-4 py-2 text-xs text-white hover:bg-slate-600">56-58: Height Adjustable</button>
                <button onClick={() => goToPage(156)} className="block w-full text-left px-4 py-2 text-xs text-white hover:bg-slate-600">156-157: Pedestals</button>

                <div className="px-3 py-1.5 text-blue-500 font-bold text-xs uppercase tracking-wider border-b border-t border-slate-700 mt-1">Panels</div>
                <button onClick={() => goToPage(61)} className="block w-full text-left px-4 py-2 text-xs text-white hover:bg-slate-600">61: Drawing Services</button>
                <button onClick={() => goToPage(62)} className="block w-full text-left px-4 py-2 text-xs text-white hover:bg-slate-600">62-67: Webb Panels</button>
                <button onClick={() => goToPage(68)} className="block w-full text-left px-4 py-2 text-xs text-white hover:bg-slate-600">68: SpaceMax Panels</button>
                <button onClick={() => goToPage(70)} className="block w-full text-left px-4 py-2 text-xs text-white hover:bg-slate-600">70-71: Borders</button>

                <div className="px-3 py-1.5 text-green-500 font-bold text-xs uppercase tracking-wider border-b border-t border-slate-700 mt-1">Tables</div>
                <button onClick={() => goToPage(72)} className="block w-full text-left px-4 py-2 text-xs text-white hover:bg-slate-600">72-75: Training Room Tables</button>
                <button onClick={() => goToPage(76)} className="block w-full text-left px-4 py-2 text-xs text-white hover:bg-slate-600">76-77: Gathering Tables</button>
                <button onClick={() => goToPage(78)} className="block w-full text-left px-4 py-2 text-xs text-white hover:bg-slate-600">78-85: Conference Tables</button>
                <button onClick={() => goToPage(86)} className="block w-full text-left px-4 py-2 text-xs text-white hover:bg-slate-600">86-89: Occasional Tables</button>

                <div className="px-3 py-1.5 text-red-500 font-bold text-xs uppercase tracking-wider border-b border-t border-slate-700 mt-1">Seating</div>
                <button onClick={() => goToPage(92)} className="block w-full text-left px-4 py-2 text-xs text-white hover:bg-slate-600">92-95: Chair Guide</button>
                <button onClick={() => goToPage(96)} className="block w-full text-left px-4 py-2 text-xs text-white hover:bg-slate-600">96-103: Reception & Lounge</button>
                <button onClick={() => goToPage(104)} className="block w-full text-left px-4 py-2 text-xs text-white hover:bg-slate-600">104-117: Guest & Multi-Purpose</button>
                <button onClick={() => goToPage(118)} className="block w-full text-left px-4 py-2 text-xs text-white hover:bg-slate-600">118-122: Drafting & Bar Height</button>
                <button onClick={() => goToPage(123)} className="block w-full text-left px-4 py-2 text-xs text-white hover:bg-slate-600">123-141: Mgmt & Conference</button>
                <button onClick={() => goToPage(142)} className="block w-full text-left px-4 py-2 text-xs text-white hover:bg-slate-600">142-152: Task</button>
                <button onClick={() => goToPage(153)} className="block w-full text-left px-4 py-2 text-xs text-white hover:bg-slate-600">153: Healthcare</button>
                <button onClick={() => goToPage(154)} className="block w-full text-left px-4 py-2 text-xs text-white hover:bg-slate-600">154-155: Big & Tall</button>
              </div>
            )}
          </div>

          {/* PDF Download */}
          <a
            href="/Catalog.pdf"
            download="FoxBuilt-2026-Catalog.pdf"
            className="bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full flex items-center gap-1 border border-yellow-500"
          >
            <Download className="w-3 h-3" />
            PDF
          </a>

          {/* Zoom controls (fullscreen only) */}
          {isFullscreen && (
            <>
              <button
                onClick={() => setZoomLevel(z => Math.max(1, z - 0.25))}
                className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-full border border-slate-500 disabled:opacity-40"
                disabled={zoomLevel <= 1}
                aria-label="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-white text-xs font-bold min-w-[3rem] text-center">{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={() => setZoomLevel(z => Math.min(3, z + 0.25))}
                className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-full border border-slate-500 disabled:opacity-40"
                disabled={zoomLevel >= 3}
                aria-label="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Fullscreen toggle (desktop only) */}
          {isDesktop && (
            <button
              onClick={toggleFullscreen}
              className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full flex items-center gap-1 border border-slate-500"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
    </>
  )
}