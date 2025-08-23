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
    console.log('reCAPTCHA hook: Initializing...')
    console.log('Site key:', process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY)
    
    // Load reCAPTCHA script if not already loaded
    if (!window.grecaptcha) {
      console.log('reCAPTCHA hook: Loading script...')
      const script = document.createElement('script')
      script.src = `https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`
      script.async = true
      script.defer = true
      
      script.onload = () => {
        console.log('reCAPTCHA hook: Script loaded successfully')
        setIsLoaded(true)
      }
      
      script.onerror = (error) => {
        console.error('reCAPTCHA hook: Script failed to load:', error)
      }
      
      document.head.appendChild(script)
    } else {
      console.log('reCAPTCHA hook: Already loaded')
      setIsLoaded(true)
    }
  }, [])

  const executeRecaptcha = useCallback(async (action: string = 'submit_discount'): Promise<string> => {
    console.log('reCAPTCHA hook: executeRecaptcha called with action:', action)
    console.log('reCAPTCHA hook: isLoaded:', isLoaded)
    
    if (!isLoaded) {
      throw new Error('reCAPTCHA not loaded')
    }

    if (!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
      throw new Error('reCAPTCHA site key not configured')
    }

    console.log('reCAPTCHA hook: Starting execution...')
    setIsExecuting(true)
    
    try {
      return new Promise((resolve, reject) => {
        console.log('reCAPTCHA hook: Calling grecaptcha.ready...')
        window.grecaptcha.ready(() => {
          console.log('reCAPTCHA hook: grecaptcha.ready callback executed')
          console.log('reCAPTCHA hook: Calling grecaptcha.execute...')
          window.grecaptcha.execute(
            process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!,
            { action }
          ).then((token) => {
            console.log('reCAPTCHA hook: Token received:', token ? 'Yes' : 'No')
            setIsExecuting(false)
            resolve(token)
          }).catch((error) => {
            console.error('reCAPTCHA hook: Execution error:', error)
            setIsExecuting(false)
            reject(error)
          })
        })
      })
    } catch (error) {
      console.error('reCAPTCHA hook: Outer error:', error)
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
