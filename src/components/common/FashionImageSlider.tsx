import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface FashionImage {
  id: string
  url: string
  alt: string
  title: string
  subtitle: string
}

// Dummy fashion images - in production, these would come from database
const fashionImages: FashionImage[] = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    alt: 'Elegant Fashion Collection',
    title: 'Elegant Collection',
    subtitle: 'Timeless sophistication meets modern design'
  },
  {
    id: '2', 
    url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    alt: 'Contemporary Fashion',
    title: 'Contemporary Style',
    subtitle: 'Bold statements for the modern wardrobe'
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    alt: 'Luxury Fashion',
    title: 'Luxury Redefined',
    subtitle: 'Premium craftsmanship in every detail'
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    alt: 'Designer Fashion',
    title: 'Designer Excellence',
    subtitle: 'Curated pieces from world-renowned designers'
  },
  {
    id: '5',
    url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    alt: 'Premium Fashion',
    title: 'Premium Quality',
    subtitle: 'Exceptional materials, extraordinary results'
  },
  {
    id: '6',
    url: 'https://images.unsplash.com/photo-1566479179817-c0b5b4b4b1e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    alt: 'Exclusive Fashion',
    title: 'Exclusive Designs',
    subtitle: 'Limited edition pieces for discerning taste'
  }
]

export default function FashionImageSlider() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const scrollTimelineRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const images = container.querySelectorAll('.hero-image')
    const totalImages = images.length

    // Create main timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: `+=${totalImages * 100}%`, // Each image takes 100vh of scroll
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          const progress = self.progress
          const newIndex = Math.min(Math.floor(progress * totalImages), totalImages - 1)
          setCurrentIndex(newIndex)
          
          // Mark as complete when we reach the last image
          if (progress >= 0.95) {
            setIsComplete(true)
          }
        }
      }
    })

    // Set up stacked layout with shadows
    images.forEach((image, index) => {
      const zIndex = totalImages - index
      const shadowOpacity = index === 0 ? 0 : 0.3 + (index * 0.1)
      
      gsap.set(image, { 
        x: '0%', 
        y: '0%',
        zIndex: zIndex,
        scale: 1,
        opacity: 1
      })
      
      // Add shadow overlay for stacked effect
      const shadowOverlay = image.querySelector('.shadow-overlay')
      if (shadowOverlay) {
        gsap.set(shadowOverlay, {
          opacity: shadowOpacity
        })
      }
    })

    // Create stacked sliding transitions
    images.forEach((image, index) => {
      if (index < totalImages - 1) {
        const startProgress = index / totalImages
        const nextImage = images[index + 1]
        const currentShadow = image.querySelector('.shadow-overlay')
        const nextShadow = nextImage.querySelector('.shadow-overlay')
        
        // Current image slides out to the left with increasing shadow
        tl.to(image, {
          x: '-100%',
          duration: 1,
          ease: 'power2.inOut'
        }, startProgress)
        
        // Increase shadow on current image as it moves
        if (currentShadow) {
          tl.to(currentShadow, {
            opacity: 0.6,
            duration: 1,
            ease: 'power2.inOut'
          }, startProgress)
        }
        
        // Next image slides in from the right
        tl.fromTo(nextImage, 
          { x: '100%' },
          {
            x: '0%',
            duration: 1,
            ease: 'power2.inOut'
          }, 
          startProgress
        )
        
        // Reduce shadow on next image as it becomes active
        if (nextShadow) {
          tl.to(nextShadow, {
            opacity: 0,
            duration: 1,
            ease: 'power2.inOut'
          }, startProgress)
        }
      }
    })

    scrollTimelineRef.current = tl

    // Cleanup function
    return () => {
      tl.kill()
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === container) {
          trigger.kill()
        }
      })
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-black dark:bg-black"
    >
      {/* Stacked Images */}
      {fashionImages.map((image, index) => (
        <div
          key={image.id}
          className="hero-image absolute inset-0 w-full h-full"
        >
          <img
            src={image.url}
            alt={image.alt}
            className="w-full h-full object-cover"
            loading={index === 0 ? 'eager' : 'lazy'}
          />
          
          {/* Shadow overlay for stacking effect */}
          <div className="shadow-overlay absolute inset-0 bg-black transition-opacity duration-1000" />
          
          {/* Content overlay that moves with the image */}
          <div className="absolute inset-0 flex items-center justify-center text-white text-center px-4 sm:px-6 lg:px-8 z-10">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl sm:text-5xl lg:text-7xl font-display font-bold mb-4 sm:mb-6 leading-tight drop-shadow-2xl">
                {image.title}
              </h2>
              <p className="text-base sm:text-lg lg:text-2xl opacity-90 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
                {image.subtitle}
              </p>
            </div>
          </div>
        </div>
      ))}
      
      {/* Progress indicator */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <div className="flex space-x-2">
          {fashionImages.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white scale-125' 
                  : index < currentIndex 
                  ? 'bg-white/70' 
                  : 'bg-white/30'
              }`}
            />
          ))}
        </div>
        <div className="text-white text-center mt-3 sm:mt-4">
          <p className="text-xs sm:text-sm opacity-80">
            {currentIndex + 1} / {fashionImages.length}
          </p>
          {!isComplete && (
            <p className="text-xs opacity-60 mt-1">
              Scroll to continue
            </p>
          )}
        </div>
      </div>
      
      {/* Scroll indicator (only show on first image) */}
      {currentIndex === 0 && (
        <div className="absolute bottom-6 sm:bottom-8 right-6 sm:right-8 text-white text-center z-30">
          <div className="text-xs sm:text-sm font-medium mb-2 opacity-80">
            Scroll to explore
          </div>
          <div className="w-6 sm:w-8 h-10 sm:h-12 border-2 border-white/50 rounded-full flex justify-center mx-auto">
            <div className="w-1 h-2 sm:h-3 bg-white/70 rounded-full mt-2 animate-bounce" />
          </div>
        </div>
      )}
      
      {/* Completion indicator */}
      {isComplete && (
        <div className="absolute bottom-6 sm:bottom-8 right-6 sm:right-8 text-white text-center z-30">
          <div className="text-xs sm:text-sm font-medium opacity-80">
            Continue scrolling
          </div>
          <div className="w-6 sm:w-8 h-6 sm:h-8 border-2 border-white/50 rounded-full flex items-center justify-center mx-auto mt-2">
            <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/70 rounded-full" />
          </div>
        </div>
      )}
      
      {/* Direction indicator */}
      <div className="absolute top-1/2 left-4 sm:left-8 transform -translate-y-1/2 z-30 text-white opacity-60">
        <div className="flex items-center space-x-2">
          <div className="w-8 sm:w-12 h-0.5 bg-white/50" />
          <span className="text-xs sm:text-sm font-medium">SLIDE</span>
        </div>
      </div>
    </div>
  )
}