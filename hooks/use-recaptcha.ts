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
    
    // Function to check if reCAPTCHA is ready
    const checkRecaptchaReady = () => {
      if (window.grecaptcha && window.grecaptcha.ready) {
        console.log('reCAPTCHA hook: reCAPTCHA is ready!')
        setIsLoaded(true)
        return true
      }
      return false
    }
    
    // Check if already loaded
    if (checkRecaptchaReady()) {
      return
    }
    
    // Load reCAPTCHA script
    console.log('reCAPTCHA hook: Loading script...')
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`
    script.async = true
    script.defer = true
    
    script.onload = () => {
      console.log('reCAPTCHA hook: Script loaded, waiting for initialization...')
      // Wait a bit for reCAPTCHA to initialize
      setTimeout(() => {
        if (checkRecaptchaReady()) {
          console.log('reCAPTCHA hook: reCAPTCHA initialized after timeout')
        } else {
          console.log('reCAPTCHA hook: reCAPTCHA still not ready after timeout')
          // Try to initialize manually
          if (window.grecaptcha && window.grecaptcha.ready) {
            window.grecaptcha.ready(() => {
              console.log('reCAPTCHA hook: Manually triggered ready callback')
              setIsLoaded(true)
            })
          }
        }
      }, 1000)
    }
    
    script.onerror = (error) => {
      console.error('reCAPTCHA hook: Script failed to load:', error)
    }
    
    document.head.appendChild(script)
    
    // Also check periodically
    const interval = setInterval(() => {
      if (checkRecaptchaReady()) {
        clearInterval(interval)
      }
    }, 500)
    
    // Cleanup
    return () => clearInterval(interval)
  }, [])

  const executeRecaptcha = useCallback(async (action: string = 'submit_discount'): Promise<string> => {
    console.log('reCAPTCHA hook: executeRecaptcha called with action:', action)
    console.log('reCAPTCHA hook: isLoaded:', isLoaded)
    console.log('reCAPTCHA hook: window.grecaptcha exists:', !!window.grecaptcha)
    
    // Check if reCAPTCHA is available
    if (!window.grecaptcha || !window.grecaptcha.ready) {
      console.error('reCAPTCHA hook: reCAPTCHA not available in window object')
      throw new Error('reCAPTCHA not available. Please refresh the page and try again.')
    }

    if (!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
      throw new Error('reCAPTCHA site key not configured')
    }

    console.log('reCAPTCHA hook: Starting execution...')
    setIsExecuting(true)
    
    try {
      return new Promise((resolve, reject) => {
        console.log('reCAPTCHA hook: Calling grecaptcha.ready...')
        
        // Add timeout for reCAPTCHA execution
        const timeout = setTimeout(() => {
          console.error('reCAPTCHA hook: Execution timeout')
          setIsExecuting(false)
          reject(new Error('reCAPTCHA execution timeout. Please try again.'))
        }, 10000) // 10 second timeout
        
        window.grecaptcha.ready(() => {
          console.log('reCAPTCHA hook: grecaptcha.ready callback executed')
          console.log('reCAPTCHA hook: Calling grecaptcha.execute...')
          
          window.grecaptcha.execute(
            process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!,
            { action }
          ).then((token) => {
            clearTimeout(timeout)
            console.log('reCAPTCHA hook: Token received:', token ? 'Yes' : 'No')
            setIsExecuting(false)
            resolve(token)
          }).catch((error) => {
            clearTimeout(timeout)
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
