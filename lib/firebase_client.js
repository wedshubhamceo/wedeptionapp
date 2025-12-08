import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithPhoneNumber, RecaptchaVerifier, onAuthStateChanged } from 'firebase/auth'
import { firebaseConfig as defaultFirebaseConfig } from './config'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || defaultFirebaseConfig.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || defaultFirebaseConfig.authDomain,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || defaultFirebaseConfig.projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || defaultFirebaseConfig.storageBucket,
}

if (!getApps().length) {
  initializeApp(firebaseConfig)
}

export const auth = getAuth()
export const googleProvider = new GoogleAuthProvider()

export async function signInWithGooglePopup(){
  return await signInWithPopup(auth, googleProvider)
}

export function setupRecaptcha(containerId){
  if(typeof window === 'undefined') return null
  
  // Clear any existing verifier
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear()
    } catch(e) {
      console.warn('Error clearing recaptcha:', e)
    }
  }
  
  // Create container if it doesn't exist
  let container = document.getElementById(containerId)
  if (!container) {
    container = document.createElement('div')
    container.id = containerId
    container.style.display = 'none'
    document.body.appendChild(container)
  }
  
  // Create new verifier
  try {
    window.recaptchaVerifier = new RecaptchaVerifier(containerId, { 
      'size': 'invisible',
      'callback': () => {
        // reCAPTCHA solved, allow sendSms.
        console.log('reCAPTCHA verified')
      },
      'expired-callback': () => {
        // Response expired. Ask user to solve reCAPTCHA again.
        console.warn('reCAPTCHA expired')
        if (window.recaptchaVerifier) {
          window.recaptchaVerifier.clear()
        }
      }
    }, auth)
    
    return window.recaptchaVerifier
  } catch (error) {
    console.error('Error setting up reCAPTCHA:', error)
    return null
  }
}

export { signInWithPhoneNumber, onAuthStateChanged } from 'firebase/auth'

export default auth
