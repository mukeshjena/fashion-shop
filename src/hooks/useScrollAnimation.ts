import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface UseScrollAnimationOptions {
  trigger?: string
  start?: string
  end?: string
  scrub?: boolean | number
  pin?: boolean
  animation?: gsap.core.Animation
  onEnter?: () => void
  onLeave?: () => void
}

export default function useScrollAnimation(
  animationFn: (element: HTMLElement) => gsap.core.Animation | void,
  options: UseScrollAnimationOptions = {}
) {
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const {
      trigger,
      start = 'top 80%',
      end = 'bottom 20%',
      scrub = false,
      pin = false,
      onEnter,
      onLeave
    } = options

    const animationResult = animationFn(element)
    const animation = animationResult || undefined

    const scrollTrigger = ScrollTrigger.create({
      trigger: trigger || element,
      start,
      end,
      scrub,
      pin,
      animation,
      onEnter,
      onLeave,
    })

    return () => {
      scrollTrigger.kill()
    }
  }, [])

  return elementRef
}