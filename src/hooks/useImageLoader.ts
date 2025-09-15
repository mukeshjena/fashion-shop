import { useState, useEffect } from 'react'

interface UseImageLoaderReturn {
  loaded: boolean
  error: boolean
  loading: boolean
}

export default function useImageLoader(src: string): UseImageLoaderReturn {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!src) {
      setLoading(false)
      setError(true)
      return
    }

    setLoading(true)
    setLoaded(false)
    setError(false)

    const img = new Image()
    
    img.onload = () => {
      setLoaded(true)
      setLoading(false)
      setError(false)
    }
    
    img.onerror = () => {
      setLoaded(false)
      setLoading(false)
      setError(true)
    }
    
    img.src = src

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src])

  return { loaded, error, loading }
}