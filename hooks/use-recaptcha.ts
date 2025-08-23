import { useCallback, useEffect, useState } from 'react'

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}

export function useRecaptcha() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)

  useEffect(() => {
    // Load reCAPTCHA script if not already loaded
    if (!window.grecaptcha) {
      const script = document.createElement('script')
      script.src = `https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`
      script.async = true
      script.defer = true
      
      script.onload = () => {
        setIsLoaded(true)
      }
      
      document.head.appendChild(script)
    } else {
      setIsLoaded(true)
    }
  }, [])

  const executeRecaptcha = useCallback(async (action: string = 'submit_discount'): Promise<string> => {
    if (!isLoaded) {
      throw new Error('reCAPTCHA not loaded')
    }

    if (!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
      throw new Error('reCAPTCHA site key not configured')
    }

    setIsExecuting(true)
    
    try {
      return new Promise((resolve, reject) => {
        window.grecaptcha.ready(async () => {
          try {
            const token = await window.grecaptcha.execute(
              process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
              { action }
            )
            resolve(token)
          } catch (error) {
            reject(error)
          } finally {
            setIsExecuting(false)
          }
        })
      })
    } catch (error) {
      setIsExecuting(false)
      throw error
    }
  }, [isLoaded])

  return {
    isLoaded,
    isExecuting,
    executeRecaptcha,
  }
}
