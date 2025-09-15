import { useEffect, useRef, useState } from 'react'

interface UseIntersectionObserverOptions {
  threshold?: number | number[]
  root?: Element | null
  rootMargin?: string
  freezeOnceVisible?: boolean
}

export default function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): [React.RefObject<HTMLDivElement | null>, boolean] {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0%',
    freezeOnceVisible = false
  } = options

  const elementRef = useRef<HTMLDivElement>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting
        if (!freezeOnceVisible || !isIntersecting) {
          setIsIntersecting(isElementIntersecting)
        }
      },
      { threshold, root, rootMargin }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [threshold, root, rootMargin, freezeOnceVisible, isIntersecting])

  return [elementRef, isIntersecting]
}