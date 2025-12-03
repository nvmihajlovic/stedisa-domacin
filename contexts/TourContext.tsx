'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import ProductTour from '@/components/ProductTour'
import { getTourSteps, TourStep } from '@/lib/tour-steps'

interface TourContextType {
  startTour: (page: string) => void
  isTourActive: boolean
  hasSeenTour: boolean
  markTourAsSeen: () => void
  resetTour: () => void
}

const TourContext = createContext<TourContextType | undefined>(undefined)

export function TourProvider({ children }: { children: ReactNode }) {
  const [isTourActive, setIsTourActive] = useState(false)
  const [hasSeenTour, setHasSeenTour] = useState(true)
  const [currentPage, setCurrentPage] = useState('')
  const [steps, setSteps] = useState<TourStep[]>([])

  useEffect(() => {
    // Check if user has seen the tour
    const seen = localStorage.getItem('domacin-tour-seen')
    if (!seen) {
      setHasSeenTour(false)
      // Auto-start dashboard tour for new users after 1 second
      setTimeout(() => {
        startTour('dashboard')
      }, 1000)
    }
  }, [])

  const startTour = (page: string) => {
    const tourSteps = getTourSteps(page)
    if (tourSteps.length > 0) {
      setCurrentPage(page)
      setSteps(tourSteps)
      setIsTourActive(true)
    }
  }

  const completeTour = () => {
    setIsTourActive(false)
    markTourAsSeen()
  }

  const skipTour = () => {
    setIsTourActive(false)
    markTourAsSeen()
  }

  const markTourAsSeen = () => {
    localStorage.setItem('domacin-tour-seen', 'true')
    setHasSeenTour(true)
  }

  const resetTour = () => {
    localStorage.removeItem('domacin-tour-seen')
    setHasSeenTour(false)
  }

  return (
    <TourContext.Provider
      value={{
        startTour,
        isTourActive,
        hasSeenTour,
        markTourAsSeen,
        resetTour,
      }}
    >
      {children}
      <ProductTour
        steps={steps}
        isActive={isTourActive}
        onComplete={completeTour}
        onSkip={skipTour}
      />
    </TourContext.Provider>
  )
}

export function useTour() {
  const context = useContext(TourContext)
  if (!context) {
    throw new Error('useTour must be used within TourProvider')
  }
  return context
}
