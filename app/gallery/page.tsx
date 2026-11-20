"use client"

import { useState, useEffect, Suspense } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import FlyingPosters from '@/components/ui/FlyingPosters'
import Footer from '@/components/sections/Footer'

// The photo carousel, which opens at ?index= from the URL. useSearchParams() makes the
// static export leave everything up to the nearest <Suspense> to the browser, so this
// child has its own boundary and the heading, text and footer are in the first HTML.
function GalleryCarousel() {
  const searchParams = useSearchParams()
  const initialIndex = parseInt(searchParams.get('index') || '0')
  
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [mobileGalleryImages, setMobileGalleryImages] = useState<string[]>([])
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    // Load gallery images from content.json
    const loadGalleryImages = async () => {
      try {
        const response = await fetch('/content.json')
        if (response.ok) {
          const data = await response.json()
          if (data.gallery) {
            setGalleryImages(data.gallery)
          }
          if (data.mobileGallery) {
            setMobileGalleryImages(data.mobileGallery)
          }
        }
      } catch (err) {
        console.log('Could not load gallery images:', err)
        // Try localStorage as fallback
        const savedGallery = localStorage.getItem('foxbuilt-gallery')
        if (savedGallery) {
          try {
            const images = JSON.parse(savedGallery)
            setGalleryImages(images)
          } catch (e) {
            console.error('Error parsing saved gallery:', e)
          }
        }
        
        const savedMobileGallery = localStorage.getItem('foxbuilt-mobile-gallery')
        if (savedMobileGallery) {
          try {
            const images = JSON.parse(savedMobileGallery)
            setMobileGalleryImages(images)
          } catch (e) {
            console.error('Error parsing saved mobile gallery:', e)
          }
        }
      }
    }
    
    loadGalleryImages()
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const images = isMobile ? mobileGalleryImages : galleryImages

  if (images.length === 0) return null

  return (
    <div className="w-full max-w-7xl px-4">
      <FlyingPosters
        items={images}
        height={isMobile ? '400px' : '600px'}
        initialIndex={initialIndex}
        onFullImageToggle={() => {}}
      />
    </div>
  )
}

export default function GalleryPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-slate-800 flex flex-col">
      <div className="relative flex-1 flex flex-col items-center justify-center gap-8 pt-24 pb-12">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-8 left-8 z-50 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 shadow-lg backdrop-blur-sm"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* Above the carousel and on the page's own background, so the carousel's far-off
            photos pass behind this text instead of showing through it */}
        <div className="relative z-10 bg-slate-800 max-w-3xl px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Office Furniture Ideas
          </h1>
          <p className="text-zinc-400 mt-3">
            A few office setups for inspiration. To see what we have in stock, visit our showroom at <span className="whitespace-nowrap">420 W Industrial Dr, Bldg LL</span>, Pleasant Grove, Utah.
          </p>
        </div>

        {/* Flying Posters Carousel */}
        <Suspense fallback={null}>
          <GalleryCarousel />
        </Suspense>
      </div>

      <Footer />
    </div>
  )
}