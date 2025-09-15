import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import useBanners from '../../hooks/useBanners'
import LoadingSpinner from '../ui/LoadingSpinner'

interface EnhancedHeroSectionProps {
  // Props can be added here if needed in the future
}

export default function EnhancedHeroSection({}: EnhancedHeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const { banners, loading } = useBanners()
  
  // Filter active banners and ensure we have at least one
  const activeBanners = banners.filter(banner => banner.is_active)
  
  // Auto-play functionality
  const startAutoPlay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeBanners.length)
    }, 5000) // Change slide every 5 seconds
  }, [activeBanners.length])

  const stopAutoPlay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // Navigation functions
  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % activeBanners.length)
  }, [activeBanners.length])

  const goToPrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + activeBanners.length) % activeBanners.length)
  }, [activeBanners.length])

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev)
  }, [])

  // Auto-play effect
  useEffect(() => {
    if (isPlaying && !isHovered && activeBanners.length > 1) {
      startAutoPlay()
    } else {
      stopAutoPlay()
    }

    return () => stopAutoPlay()
  }, [isPlaying, isHovered, activeBanners.length, startAutoPlay, stopAutoPlay])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrev()
      if (e.key === 'ArrowRight') goToNext()
      if (e.key === ' ') {
        e.preventDefault()
        togglePlayPause()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToPrev, goToNext, togglePlayPause])

  if (loading) {
    return (
      <section className="relative h-screen flex items-center justify-center bg-black">
        <LoadingSpinner size="lg" />
      </section>
    )
  }

  if (activeBanners.length === 0) {
    return (
      <section className="relative h-screen flex items-center justify-center bg-black">
        <div className="text-white text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to Our Fashion Store</h1>
          <p className="text-xl opacity-80">Discover amazing fashion collections</p>
        </div>
      </section>
    )
  }

  return (
    <div 
      className="relative w-full h-screen overflow-hidden bg-black"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Images with Smooth Transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="absolute inset-0 w-full h-full"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          <img
            src={activeBanners[currentIndex]?.image_url}
            alt={activeBanners[currentIndex]?.title}
            className="w-full h-full object-cover"
            loading="eager"
          />
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />
        </motion.div>
      </AnimatePresence>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center justify-center text-white text-center px-4 sm:px-6 lg:px-8 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >

            
            {/* Banner Title */}
            <motion.h1 
              className="text-3xl sm:text-5xl lg:text-7xl xl:text-8xl font-display font-bold mb-6 sm:mb-8 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <span className="block bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent drop-shadow-2xl">
                {activeBanners[currentIndex]?.title}
              </span>
            </motion.h1>
            
            {/* Banner Subtitle */}
            {activeBanners[currentIndex]?.subtitle && (
              <motion.p 
                className="text-base sm:text-lg lg:text-xl xl:text-2xl mb-8 sm:mb-12 opacity-90 max-w-4xl mx-auto leading-relaxed drop-shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                {activeBanners[currentIndex]?.subtitle}
              </motion.p>
            )}
            
            {/* Action Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              {activeBanners[currentIndex]?.link_url && (
                <Link
                  to={activeBanners[currentIndex]?.link_url || '/products'}
                  className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl backdrop-blur-sm"
                >
                  <span className="relative z-10">
                    {activeBanners[currentIndex]?.button_text || 'Explore Collection'}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                </Link>
              )}
              

            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      {activeBanners.length > 1 && (
        <>
          {/* Previous Button */}
          <button
            onClick={goToPrev}
            className="absolute left-4 sm:left-8 top-1/2 transform -translate-y-1/2 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 group"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
          </button>

          {/* Next Button */}
          <button
            onClick={goToNext}
            className="absolute right-4 sm:right-8 top-1/2 transform -translate-y-1/2 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 group"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
          </button>
        </>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        {/* Slide Indicators */}
        <div className="flex space-x-2 sm:space-x-3 mb-4">
          {activeBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`relative transition-all duration-300 ${
                index === currentIndex 
                  ? 'w-8 sm:w-10 h-2 bg-white rounded-full' 
                  : 'w-2 h-2 bg-white/50 rounded-full hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            >
              {index === currentIndex && (
                <motion.div
                  className="absolute inset-0 bg-white rounded-full"
                  layoutId="activeSlide"
                  transition={{ duration: 0.3 }}
                />
              )}
            </button>
          ))}
        </div>
        
        {/* Slide Counter and Controls */}
        <div className="flex items-center justify-center space-x-4 text-white">
          <span className="text-xs sm:text-sm opacity-80 font-medium">
            {currentIndex + 1} / {activeBanners.length}
          </span>
          
          {activeBanners.length > 1 && (
            <button
              onClick={togglePlayPause}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-300"
              aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
            >
              {isPlaying ? (
                <Pause className="w-3 h-3 sm:w-4 sm:h-4" />
              ) : (
                <Play className="w-3 h-3 sm:w-4 sm:h-4 ml-0.5" />
              )}
            </button>
          )}
        </div>
      </div>


    </div>
  )
}