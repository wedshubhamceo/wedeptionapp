'use client'

import { useState } from 'react'
import Footer from '../../components/Footer'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function AIPlannerPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    budget: '',
    guestCount: '',
    location: '',
    date: '',
    style: '',
    priorities: []
  })

  const weddingStyles = [
    { name: 'Traditional', icon: '🎎', description: 'Classic and elegant' },
    { name: 'Modern', icon: '✨', description: 'Contemporary and chic' },
    { name: 'Rustic', icon: '🌾', description: 'Natural and cozy' },
    { name: 'Beach', icon: '🏖️', description: 'Tropical and relaxed' },
    { name: 'Garden', icon: '🌺', description: 'Floral and romantic' },
    { name: 'Luxury', icon: '💎', description: 'Opulent and grand' },
  ]

  const priorities = [
    'Photography',
    'Venue',
    'Catering',
    'Decor',
    'Entertainment',
    'Fashion',
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-cream)' }}>
      {/* Hero Section */}
      <section style={{
        padding: '80px 0 60px',
        background: 'linear-gradient(135deg, rgba(233,30,99,0.05) 0%, rgba(212,175,55,0.03) 100%)'
      }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}
          >
            <div style={{ fontSize: 64, marginBottom: 24 }}>🤖</div>
            <h1 style={{
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 700,
              marginBottom: 16,
              color: 'var(--text-dark)'
            }}>
              AI Wedding Planner
            </h1>
            <p style={{
              fontSize: 'clamp(16px, 2vw, 20px)',
              color: 'var(--text-muted)',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Get personalized wedding planning recommendations powered by AI. Tell us about your dream wedding and we'll create a custom plan.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="card" style={{ padding: '48px' }}>
              {/* Progress Bar */}
              <div style={{ marginBottom: 40 }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 12
                }}>
                  {[1, 2, 3].map((s) => (
                    <div key={s} style={{
                      flex: 1,
                      height: 4,
                      background: s <= step ? 'var(--accent-rose)' : 'var(--border-light)',
                      borderRadius: 'var(--radius-full)',
                      marginRight: s < 3 ? 8 : 0
                    }} />
                  ))}
                </div>
                <div style={{
                  fontSize: 14,
                  color: 'var(--text-muted)',
                  textAlign: 'center'
                }}>
                  Step {step} of 3
                </div>
              </div>

              {/* Step 1: Basic Info */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <h2 style={{
                    fontSize: 28,
                    fontWeight: 600,
                    marginBottom: 32,
                    color: 'var(--text-dark)'
                  }}>
                    Tell us about your wedding
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: 14,
                        fontWeight: 600,
                        marginBottom: 8,
                        color: 'var(--text-dark)'
                      }}>
                        Budget Range
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., ₹5,00,000 - ₹10,00,000"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '14px 16px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-light)',
                          fontSize: 15,
                          transition: 'border-color 0.2s ease'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--accent-rose)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: 14,
                        fontWeight: 600,
                        marginBottom: 8,
                        color: 'var(--text-dark)'
                      }}>
                        Number of Guests
                      </label>
                      <input
                        type="number"
                        placeholder="e.g., 200"
                        value={formData.guestCount}
                        onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '14px 16px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-light)',
                          fontSize: 15,
                          transition: 'border-color 0.2s ease'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--accent-rose)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: 14,
                        fontWeight: 600,
                        marginBottom: 8,
                        color: 'var(--text-dark)'
                      }}>
                        Location
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Mumbai, Maharashtra"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '14px 16px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-light)',
                          fontSize: 15,
                          transition: 'border-color 0.2s ease'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--accent-rose)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
                      />
                    </div>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: 14,
                        fontWeight: 600,
                        marginBottom: 8,
                        color: 'var(--text-dark)'
                      }}>
                        Wedding Date
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '14px 16px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-light)',
                          fontSize: 15,
                          transition: 'border-color 0.2s ease'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--accent-rose)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Style & Priorities */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <h2 style={{
                    fontSize: 28,
                    fontWeight: 600,
                    marginBottom: 32,
                    color: 'var(--text-dark)'
                  }}>
                    Choose your style & priorities
                  </h2>
                  <div style={{ marginBottom: 40 }}>
                    <label style={{
                      display: 'block',
                      fontSize: 14,
                      fontWeight: 600,
                      marginBottom: 16,
                      color: 'var(--text-dark)'
                    }}>
                      Wedding Style
                    </label>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                      gap: 16
                    }}>
                      {weddingStyles.map((style) => (
                        <button
                          key={style.name}
                          onClick={() => setFormData({ ...formData, style: style.name })}
                          style={{
                            padding: '20px',
                            borderRadius: 'var(--radius-md)',
                            border: `2px solid ${formData.style === style.name ? 'var(--accent-rose)' : 'var(--border-light)'}`,
                            background: formData.style === style.name ? 'rgba(233,30,99,0.05)' : 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            textAlign: 'center'
                          }}
                        >
                          <div style={{ fontSize: 32, marginBottom: 8 }}>{style.icon}</div>
                          <div style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: 'var(--text-dark)',
                            marginBottom: 4
                          }}>
                            {style.name}
                          </div>
                          <div style={{
                            fontSize: 12,
                            color: 'var(--text-muted)'
                          }}>
                            {style.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: 14,
                      fontWeight: 600,
                      marginBottom: 16,
                      color: 'var(--text-dark)'
                    }}>
                      Top Priorities (select up to 3)
                    </label>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 12
                    }}>
                      {priorities.map((priority) => (
                        <button
                          key={priority}
                          onClick={() => {
                            const newPriorities = formData.priorities.includes(priority)
                              ? formData.priorities.filter(p => p !== priority)
                              : formData.priorities.length < 3
                                ? [...formData.priorities, priority]
                                : formData.priorities
                            setFormData({ ...formData, priorities: newPriorities })
                          }}
                          style={{
                            padding: '12px 20px',
                            borderRadius: 'var(--radius-full)',
                            border: `1px solid ${formData.priorities.includes(priority) ? 'var(--accent-rose)' : 'var(--border-light)'}`,
                            background: formData.priorities.includes(priority) ? 'var(--accent-rose)' : 'white',
                            color: formData.priorities.includes(priority) ? 'white' : 'var(--text-dark)',
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {priority}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Results */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{ textAlign: 'center' }}
                >
                  <div style={{ fontSize: 64, marginBottom: 24 }}>✨</div>
                  <h2 style={{
                    fontSize: 28,
                    fontWeight: 600,
                    marginBottom: 16,
                    color: 'var(--text-dark)'
                  }}>
                    Your Custom Plan is Ready!
                  </h2>
                  <p style={{
                    fontSize: 16,
                    color: 'var(--text-muted)',
                    marginBottom: 32
                  }}>
                    Based on your preferences, we've created a personalized wedding plan. View your recommendations below.
                  </p>
                  <div style={{
                    background: 'var(--bg-warm)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '32px',
                    marginBottom: 32,
                    textAlign: 'left'
                  }}>
                    <h3 style={{
                      fontSize: 18,
                      fontWeight: 600,
                      marginBottom: 16,
                      color: 'var(--text-dark)'
                    }}>
                      Recommended Vendors
                    </h3>
                    <p style={{
                      fontSize: 14,
                      color: 'var(--text-muted)',
                      marginBottom: 24
                    }}>
                      We've matched you with vendors that fit your budget, style, and priorities.
                    </p>
                    <Link href="/vendors" className="btn-primary">
                      View Recommended Vendors
                    </Link>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="btn-secondary"
                    style={{ marginRight: 12 }}
                  >
                    Start Over
                  </button>
                </motion.div>
              )}

              {/* Navigation Buttons */}
              {step < 3 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 40,
                  paddingTop: 32,
                  borderTop: '1px solid var(--border-light)'
                }}>
                  {step > 1 && (
                    <button
                      onClick={() => setStep(step - 1)}
                      className="btn-secondary"
                    >
                      Previous
                    </button>
                  )}
                  <div style={{ marginLeft: 'auto' }}>
                    <button
                      onClick={() => setStep(step + 1)}
                      className="btn-primary"
                      disabled={step === 1 && (!formData.budget || !formData.guestCount || !formData.location)}
                      style={{
                        opacity: step === 1 && (!formData.budget || !formData.guestCount || !formData.location) ? 0.5 : 1,
                        cursor: step === 1 && (!formData.budget || !formData.guestCount || !formData.location) ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {step === 2 ? 'Generate Plan' : 'Next'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

