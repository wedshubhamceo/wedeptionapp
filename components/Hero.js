'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Hero() {
  const router = useRouter()
  const [cities, setCities] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [citiesRes, categoriesRes] = await Promise.all([
        fetch('/api/cities'),
        fetch('/api/categories')
      ])
      
      const citiesData = await citiesRes.json()
      const categoriesData = await categoriesRes.json()
      
      setCities(citiesData.cities || [])
      setCategories(categoriesData.categories || [])
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (selectedCity) params.set('city', selectedCity)
    if (selectedCategory) params.set('category', selectedCategory)
    router.push(`/vendors?${params.toString()}`)
  }
  return (
    <section className="hero-pattern" style={{
      position: 'relative',
      overflow: 'hidden',
      padding: '80px 0 120px',
      minHeight: '600px',
      display: 'flex',
      alignItems: 'center'
    }}>
      <div className="container" style={{
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <h1 style={{
              fontSize: 'clamp(40px, 6vw, 72px)',
              margin: 0,
              lineHeight: 1.1,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              marginBottom: 24,
              background: 'linear-gradient(135deg, var(--text-dark) 0%, var(--accent-rose) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Plan Your Dream Wedding
            </h1>
            <p style={{
              marginTop: 0,
              fontSize: 'clamp(18px, 2vw, 24px)',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              marginBottom: 40,
              fontWeight: 400
            }}>
              Discover premium vendors, get AI-powered planning, and create unforgettable memories — all in one beautiful platform.
            </p>
            <div style={{
              display: 'flex',
              gap: 16,
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <Link href="/vendors" className="btn-primary" style={{
                padding: '16px 32px',
                fontSize: 16
              }}>
                Explore Vendors
              </Link>
              <Link href="/inspiration" className="btn-secondary" style={{
                padding: '16px 32px',
                fontSize: 16
              }}>
                View Inspiration
              </Link>
            </div>
          </motion.div>

          {/* Search Bar - Airbnb style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
            style={{
              marginTop: 48,
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}
          >
            <div className="card" style={{
              padding: 8,
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              boxShadow: 'var(--shadow-lg)'
            }}>
              <div style={{
                flex: 1,
                padding: '12px 16px',
                borderRight: '1px solid var(--border-light)',
                cursor: 'pointer',
                borderRadius: 'var(--radius-md)',
                transition: 'background 0.2s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-warm)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4 }}>
                  Location
                </div>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    width: '100%',
                    border: 'none',
                    background: 'transparent',
                    fontSize: 14,
                    color: selectedCity ? 'var(--text-dark)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    outline: 'none',
                    appearance: 'none',
                    padding: 0,
                    margin: 0
                  }}
                >
                  <option value="">Select city</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.name}>{city.name}</option>
                  ))}
                </select>
              </div>
              <div style={{
                flex: 1,
                padding: '12px 16px',
                borderRight: '1px solid var(--border-light)',
                cursor: 'pointer',
                borderRadius: 'var(--radius-md)',
                transition: 'background 0.2s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-warm)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4 }}>
                  Category
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    width: '100%',
                    border: 'none',
                    background: 'transparent',
                    fontSize: 14,
                    color: selectedCategory ? 'var(--text-dark)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    outline: 'none',
                    appearance: 'none',
                    padding: 0,
                    margin: 0
                  }}
                >
                  <option value="">What do you need?</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <button 
                onClick={handleSearch}
                className="btn-primary" 
                style={{
                  padding: '12px 24px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 15,
                  marginLeft: 'auto',
                  cursor: 'pointer'
                }}
              >
                Search
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
