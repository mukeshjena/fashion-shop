import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface FloatingElement {
  id: number
  x: number
  y: number
  size: number
  speed: number
  opacity: number
  shape: 'circle' | 'square' | 'triangle'
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const elementsRef = useRef<FloatingElement[]>([])
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const createElements = () => {
      const elements: FloatingElement[] = []
      const elementCount = Math.floor((window.innerWidth * window.innerHeight) / 15000)
      
      for (let i = 0; i < elementCount; i++) {
        elements.push({
          id: i,
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 4 + 2,
          speed: Math.random() * 0.5 + 0.1,
          opacity: Math.random() * 0.3 + 0.1,
          shape: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)] as 'circle' | 'square' | 'triangle'
        })
      }
      
      elementsRef.current = elements
    }

    const drawElement = (element: FloatingElement) => {
      ctx.save()
      ctx.globalAlpha = element.opacity
      ctx.fillStyle = '#ffffff'
      
      switch (element.shape) {
        case 'circle':
          ctx.beginPath()
          ctx.arc(element.x, element.y, element.size, 0, Math.PI * 2)
          ctx.fill()
          break
          
        case 'square':
          ctx.fillRect(
            element.x - element.size / 2,
            element.y - element.size / 2,
            element.size,
            element.size
          )
          break
          
        case 'triangle':
          ctx.beginPath()
          ctx.moveTo(element.x, element.y - element.size / 2)
          ctx.lineTo(element.x - element.size / 2, element.y + element.size / 2)
          ctx.lineTo(element.x + element.size / 2, element.y + element.size / 2)
          ctx.closePath()
          ctx.fill()
          break
      }
      
      ctx.restore()
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      elementsRef.current.forEach(element => {
        // Move elements
        element.y -= element.speed
        element.x += Math.sin(element.y * 0.01) * 0.5
        
        // Reset position when element goes off screen
        if (element.y < -element.size) {
          element.y = canvas.height + element.size
          element.x = Math.random() * canvas.width
        }
        
        // Pulse opacity
        element.opacity = Math.sin(Date.now() * 0.001 + element.id) * 0.1 + 0.2
        
        drawElement(element)
      })
      
      animationRef.current = requestAnimationFrame(animate)
    }

    resizeCanvas()
    createElements()
    animate()

    const handleResize = () => {
      resizeCanvas()
      createElements()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      />
      
      {/* Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 2 }}>
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          style={{ top: '10%', left: '10%' }}
        />
        
        <motion.div
          className="absolute w-80 h-80 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 5
          }}
          style={{ top: '60%', right: '15%' }}
        />
        
        <motion.div
          className="absolute w-64 h-64 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 60, 0],
            y: [0, -40, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 10
          }}
          style={{ bottom: '20%', left: '50%' }}
        />
      </div>
      
      {/* Geometric Lines */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
        <svg className="w-full h-full opacity-10">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
    </>
  )
}