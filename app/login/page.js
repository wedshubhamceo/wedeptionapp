'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth, signInWithGooglePopup, setupRecaptcha, signInWithPhoneNumber } from '../../lib/firebase_client'
import { onAuthStateChanged } from 'firebase/auth'
import Footer from '../../components/Footer'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [authMethod, setAuthMethod] = useState(null) // 'google' or 'phone'
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [confirmationResult, setConfirmationResult] = useState(null)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/')
      }
    })
    return () => unsubscribe()
  }, [router])

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      setAuthMethod('google')
      const result = await signInWithGooglePopup()
      const user = result.user
      
      // Get token and sync user to Supabase
      const token = await user.getIdToken()
      const syncResponse = await fetch('/api/sync-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          phone: user.phoneNumber
        })
      })
      
      if (!syncResponse.ok) {
        console.error('Failed to sync user:', await syncResponse.text())
      }
      
      router.push('/')
    } catch (error) {
      console.error('Google sign in error:', error)
      alert('Failed to sign in with Google: ' + error.message)
      setLoading(false)
    }
  }

  const handlePhoneSignIn = async () => {
    if (!phoneNumber || !userName) {
      alert('Please enter your name and phone number')
      return
    }
    
    try {
      setLoading(true)
      setAuthMethod('phone')
      
      // Format phone number (add +91 for India if not present)
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`
      
      // Setup reCAPTCHA
      const recaptchaVerifier = setupRecaptcha('recaptcha-container')
      
      // Send verification code
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier)
      setConfirmationResult(confirmation)
      alert('Verification code sent to your phone!')
    } catch (error) {
      console.error('Phone sign in error:', error)
      alert('Failed to send verification code: ' + error.message)
      setLoading(false)
    }
  }

  const verifyPhoneCode = async () => {
    if (!verificationCode || !confirmationResult) {
      alert('Please enter the verification code')
      return
    }
    
    try {
      setLoading(true)
      const result = await confirmationResult.confirm(verificationCode)
      const user = result.user
      
      // Update user profile with name if needed
      if (userName && !user.displayName) {
        // Note: Firebase doesn't allow updating displayName directly from client
        // This would need to be done via a backend function
      }
      
      // Get token and sync user to Supabase
      const token = await user.getIdToken()
      const syncResponse = await fetch('/api/sync-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          uid: user.uid,
          name: userName || 'User',
          phone: user.phoneNumber || phoneNumber
        })
      })
      
      if (!syncResponse.ok) {
        console.error('Failed to sync user:', await syncResponse.text())
      }
      
      router.push('/')
    } catch (error) {
      console.error('Verification error:', error)
      alert('Invalid verification code: ' + error.message)
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-cream)', display: 'flex', alignItems: 'center', padding: '80px 0' }}>
      <div className="container" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="card" style={{ padding: '48px' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h1 style={{
                fontSize: 32,
                fontWeight: 700,
                marginBottom: 8,
                color: 'var(--text-dark)'
              }}>
                Welcome Back
              </h1>
              <p style={{
                fontSize: 15,
                color: 'var(--text-muted)'
              }}>
                Sign in to continue planning your wedding
              </p>
            </div>

            {authMethod === 'phone' && !confirmationResult ? (
              <div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{
                    display: 'block',
                    fontSize: 14,
                    fontWeight: 600,
                    marginBottom: 8,
                    color: 'var(--text-dark)'
                  }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)',
                      fontSize: 15
                    }}
                  />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{
                    display: 'block',
                    fontSize: 14,
                    fontWeight: 600,
                    marginBottom: 8,
                    color: 'var(--text-dark)'
                  }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    placeholder="Enter your phone number (e.g., 9876543210)"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)',
                      fontSize: 15
                    }}
                  />
                </div>
                <div id="recaptcha-container"></div>
                <button
                  onClick={handlePhoneSignIn}
                  disabled={loading || !phoneNumber || !userName}
                  className="btn-primary"
                  style={{ width: '100%', marginBottom: 12 }}
                >
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </button>
                <button
                  onClick={() => {
                    setAuthMethod(null)
                    setPhoneNumber('')
                    setUserName('')
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'transparent',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-dark)',
                    cursor: 'pointer'
                  }}
                >
                  Back
                </button>
              </div>
            ) : authMethod === 'phone' && confirmationResult ? (
              <div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{
                    display: 'block',
                    fontSize: 14,
                    fontWeight: 600,
                    marginBottom: 8,
                    color: 'var(--text-dark)'
                  }}>
                    Verification Code *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)',
                      fontSize: 15
                    }}
                  />
                </div>
                <button
                  onClick={verifyPhoneCode}
                  disabled={loading || !verificationCode}
                  className="btn-primary"
                  style={{ width: '100%', marginBottom: 12 }}
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>
                <button
                  onClick={() => {
                    setConfirmationResult(null)
                    setVerificationCode('')
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'transparent',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-dark)',
                    cursor: 'pointer'
                  }}
                >
                  Resend Code
                </button>
              </div>
            ) : (
              <div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  marginBottom: 24
                }}>
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)',
                      background: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      fontSize: 15,
                      fontWeight: 500,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = 'var(--accent-rose)'
                      e.target.style.boxShadow = 'var(--shadow-sm)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = 'var(--border-light)'
                      e.target.style.boxShadow = 'none'
                    }}
                  >
                    <span>🔵</span> Continue with Google
                  </button>
                  <button
                    onClick={() => setAuthMethod('phone')}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)',
                      background: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      fontSize: 15,
                      fontWeight: 500,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = 'var(--accent-rose)'
                      e.target.style.boxShadow = 'var(--shadow-sm)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = 'var(--border-light)'
                      e.target.style.boxShadow = 'none'
                    }}
                  >
                    <span>📱</span> Continue with Phone
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  )
}

