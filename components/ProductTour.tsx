'use client'

import { useState, useEffect, useRef } from 'react'
import { X, ArrowRight, ArrowLeft } from '@phosphor-icons/react'
import { TourStep } from '@/lib/tour-steps'

interface ProductTourProps {
  steps: TourStep[]
  isActive: boolean
  onComplete: () => void
  onSkip: () => void
}

export default function ProductTour({ steps, isActive, onComplete, onSkip }: ProductTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isActive || currentStep >= steps.length) return

    const step = steps[currentStep]
    const targetElement = document.querySelector(step.target)

    if (targetElement) {
      let rafId: number | null = null
      
      // Function to update positions smoothly using requestAnimationFrame
      const updatePositions = () => {
        if (rafId !== null) {
          cancelAnimationFrame(rafId)
        }
        
        rafId = requestAnimationFrame(() => {
          const rect = targetElement.getBoundingClientRect()
          setHighlightRect(rect)

          // Calculate tooltip position based on placement
          const placement = step.placement || 'bottom'
          const tooltipWidth = 380
          const tooltipHeight = 200
          let top = 0
          let left = 0

          switch (placement) {
            case 'top':
              top = Math.max(20, rect.top - tooltipHeight - 20)
              left = rect.left + rect.width / 2 - tooltipWidth / 2
              break
            case 'bottom':
              top = rect.bottom + 20
              left = rect.left + rect.width / 2 - tooltipWidth / 2
              break
            case 'left':
              top = rect.top + rect.height / 2 - tooltipHeight / 2
              left = Math.max(20, rect.left - tooltipWidth - 20)
              break
            case 'right':
              top = rect.top + rect.height / 2 - tooltipHeight / 2
              left = Math.min(window.innerWidth - tooltipWidth - 20, rect.right + 20)
              break
          }

          // Keep tooltip within viewport
          left = Math.max(20, Math.min(left, window.innerWidth - tooltipWidth - 20))
          top = Math.max(20, Math.min(top, window.innerHeight - tooltipHeight - 20))

          setTooltipPosition({ top, left })
        })
      }

      // Focus element to ensure it's interactive
      if (targetElement instanceof HTMLElement) {
        targetElement.setAttribute('tabindex', '-1')
        targetElement.focus({ preventScroll: true })
      }

      // First scroll to element with better positioning
      targetElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center', 
        inline: 'center' 
      })
      
      // Update positions immediately and after scroll completes
      updatePositions()
      setTimeout(updatePositions, 100)
      setTimeout(updatePositions, 300)
      setTimeout(updatePositions, 600)
      setTimeout(updatePositions, 1000)

      // Also update on window scroll/resize with throttling
      let scrollTimeout: NodeJS.Timeout | null = null
      const handleScroll = () => {
        if (scrollTimeout) clearTimeout(scrollTimeout)
        scrollTimeout = setTimeout(updatePositions, 16) // ~60fps
      }
      
      window.addEventListener('scroll', handleScroll, true)
      window.addEventListener('resize', updatePositions)

      // Execute onNext callback if exists
      if (step.onNext) {
        step.onNext()
      }

      return () => {
        if (rafId !== null) {
          cancelAnimationFrame(rafId)
        }
        if (scrollTimeout) {
          clearTimeout(scrollTimeout)
        }
        // Remove tabindex when moving to next step
        if (targetElement instanceof HTMLElement) {
          targetElement.removeAttribute('tabindex')
          targetElement.blur()
        }
        window.removeEventListener('scroll', handleScroll, true)
        window.removeEventListener('resize', updatePositions)
      }
    }
  }, [currentStep, isActive, steps])

  useEffect(() => {
    if (!isActive) {
      setCurrentStep(0)
    }
  }, [isActive])

  if (!isActive || currentStep >= steps.length) return null

  const step = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  const handleNext = () => {
    if (isLastStep) {
      onComplete()
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <>
      {/* Highlight spotlight - element with clear area cut out */}
      {highlightRect && (
        <>
          {/* Clear area for the element - this creates a "hole" in the dark overlay */}
          <div
            className="fixed z-[9999] pointer-events-none tour-spotlight"
            style={{
              top: highlightRect.top - 8,
              left: highlightRect.left - 8,
              width: highlightRect.width + 16,
              height: highlightRect.height + 16,
            }}
          />
        </>
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[10000] bg-gradient-to-br from-[#1a1f37] to-[#0f1228] rounded-2xl shadow-2xl border border-purple-500/30 tour-tooltip"
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          width: '380px',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        {/* Close button */}
        <button
          onClick={onSkip}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} weight="bold" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Progress dots */}
          <div className="flex gap-1.5 mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-8 bg-gradient-to-r from-purple-500 to-pink-500'
                    : index < currentStep
                    ? 'w-1.5 bg-purple-500/50'
                    : 'w-1.5 bg-gray-600'
                }`}
              />
            ))}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            {step.title}
          </h3>

          {/* Content */}
          <p className="text-gray-300 leading-relaxed mb-6">
            {step.content}
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={onSkip}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Preskoči turu
            </button>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 text-white transition-colors"
                >
                  <ArrowLeft size={16} weight="bold" />
                  Nazad
                </button>
              )}

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLastStep ? 'Završi' : step.actionLabel || 'Sledeće'}
                {!isLastStep && <ArrowRight size={16} weight="bold" />}
              </button>
            </div>
          </div>

          {/* Step counter */}
          <div className="text-center text-xs text-gray-500 mt-4">
            Korak {currentStep + 1} od {steps.length}
          </div>
        </div>
      </div>

      {/* Add inline CSS for pulse animation */}
      <style jsx>{`
        .tour-spotlight {
          border-radius: 20px;
          box-shadow: 
            0 0 0 3px rgba(159, 112, 255, 0.9),
            0 0 40px 15px rgba(159, 112, 255, 0.5),
            0 0 0 9999px rgba(0, 0, 0, 0.85);
          transition: 
            top 0.6s cubic-bezier(0.4, 0, 0.2, 1),
            left 0.6s cubic-bezier(0.4, 0, 0.2, 1),
            width 0.6s cubic-bezier(0.4, 0, 0.2, 1),
            height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          animation: pulse 2s ease-in-out infinite;
        }
        
        .tour-tooltip {
          transition: 
            top 0.6s cubic-bezier(0.4, 0, 0.2, 1),
            left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 3px rgba(159, 112, 255, 0.7), 
                        0 0 40px 15px rgba(159, 112, 255, 0.4),
                        0 0 0 9999px rgba(0, 0, 0, 0.85);
          }
          50% {
            box-shadow: 0 0 0 3px rgba(159, 112, 255, 1), 
                        0 0 50px 20px rgba(159, 112, 255, 0.6),
                        0 0 0 9999px rgba(0, 0, 0, 0.85);
          }
        }
      `}</style>
    </>
  )
}
