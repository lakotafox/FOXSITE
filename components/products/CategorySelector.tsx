'use client'

import { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import CategorySlider from '@/components/ui/CategorySlider'

interface CategorySelectorProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  onFloatingVisibilityChange: (isVisible: boolean) => void
}

export default function CategorySelector({ 
  selectedCategory, 
  onCategoryChange,
  onFloatingVisibilityChange 
}: CategorySelectorProps) {
  const router = useRouter()
  const categoryButtonsRef = useRef<HTMLDivElement>(null)

  // Handle scroll effects for floating categories
  useEffect(() => {
    const handleScroll = () => {
      // Check if category buttons are out of view
      if (categoryButtonsRef.current) {
        const rect = categoryButtonsRef.current.getBoundingClientRect()
        onFloatingVisibilityChange(rect.bottom < 0)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [onFloatingVisibilityChange])

  return null
}