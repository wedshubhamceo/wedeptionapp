'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import VendorCard from '../../components/VendorCard'
import Footer from '../../components/Footer'
import { motion } from 'framer-motion'

export default function VendorsPage() {
  const searchParams = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All')
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || 'All')
  const [sortBy, setSortBy] = useState('popular')
  const [vendors, setVendors] = useState([])
  const [categories, setCategories] = useState([])
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCategories()
    fetchCities()
  }, [])

  useEffect(() => {
    fetchVendors()
  }, [selectedCategory, selectedCity, sortBy])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      setCategories(data.categories || [])
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }

  const fetchCities = async () => {
    try {
      const res = await fetch('/api/cities')
      const data = await res.json()
      setCities(data.cities || [])
    } catch (err) {
      console.error('Failed to fetch cities:', err)
    }
  }

  const fetchVendors = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        ...(selectedCategory !== 'All' && { category: selectedCategory }),
        ...(selectedCity !== 'All' && { city: selectedCity }),
        sort_by: sortBy,
        limit: '50'
      })
      
      const response = await fetch(`/api/vendors?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setVendors(data.vendors || [])
      } else {
        setError(data.error || 'Failed to fetch vendors')
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch vendors')
    } finally {
      setLoading(false)
    }
  }

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
          >
            <h1 style={{
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 700,
              marginBottom: 16,
              color: 'var(--text-dark)'
            }}>
              Find Your Perfect Vendor
            </h1>
            <p style={{
              fontSize: 'clamp(16px, 2vw, 20px)',
              color: 'var(--text-muted)',
              maxWidth: '600px'
            }}>
              Browse through our curated collection of premium wedding vendors
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section style={{
        padding: '0 0 40px',
        background: 'white',
        borderBottom: '1px solid var(--border-light)',
        position: 'sticky',
        top: 73,
        zIndex: 50,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div className="container">
          <div style={{
            display: 'flex',
            gap: 24,
            alignItems: 'center',
            padding: '24px 0',
            flexWrap: 'wrap'
          }}>
            {/* City Filter */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-muted)',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                City
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  background: 'white',
                  fontSize: 14,
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'12\' height=\'8\' viewBox=\'0 0 12 8\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1L6 6L11 1\' stroke=\'%236B6B6B\' stroke-width=\'2\' stroke-linecap=\'round\'/%3E%3C/svg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  paddingRight: '40px'
                }}
              >
                <option value="All">All Cities</option>
                {cities.map(city => (
                  <option key={city.id} value={city.name}>{city.name}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-muted)',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Category
              </label>
              <div style={{
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => setSelectedCategory('All')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-light)',
                    background: selectedCategory === 'All' ? 'var(--accent-rose)' : 'white',
                    color: selectedCategory === 'All' ? 'white' : 'var(--text-dark)',
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCategory !== 'All') {
                      e.target.style.borderColor = 'var(--accent-rose)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCategory !== 'All') {
                      e.target.style.borderColor = 'var(--border-light)'
                    }
                  }}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.name)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--border-light)',
                      background: selectedCategory === cat.name ? 'var(--accent-rose)' : 'white',
                      color: selectedCategory === cat.name ? 'white' : 'var(--text-dark)',
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedCategory !== cat.name) {
                        e.target.style.borderColor = 'var(--accent-rose)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedCategory !== cat.name) {
                        e.target.style.borderColor = 'var(--border-light)'
                      }
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div style={{ minWidth: '180px' }}>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-muted)',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  background: 'white',
                  fontSize: 14,
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'12\' height=\'8\' viewBox=\'0 0 12 8\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1L6 6L11 1\' stroke=\'%236B6B6B\' stroke-width=\'2\' stroke-linecap=\'round\'/%3E%3C/svg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  paddingRight: '40px'
                }}
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="reviews">Most Reviews</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Vendors Grid */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 32
          }}>
            <div>
              <h2 style={{
                fontSize: 24,
                fontWeight: 600,
                color: 'var(--text-dark)',
                margin: 0
              }}>
                {selectedCategory === 'All' ? 'All Vendors' : selectedCategory}
                {selectedCity !== 'All' && ` in ${selectedCity}`}
              </h2>
              <p style={{
                fontSize: 14,
                color: 'var(--text-muted)',
                marginTop: 4
              }}>
                {loading ? 'Loading...' : `${vendors.length} vendor${vendors.length !== 1 ? 's' : ''} available`}
              </p>
            </div>
          </div>

          {loading ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: 'var(--text-muted)'
            }}>
              Loading vendors...
            </div>
          ) : error ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: 'var(--accent-rose)'
            }}>
              {error}
            </div>
          ) : vendors.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px'
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <h3 style={{
                fontSize: 20,
                fontWeight: 600,
                marginBottom: 8,
                color: 'var(--text-dark)'
              }}>
                No vendors found
              </h3>
              <p style={{
                fontSize: 14,
                color: 'var(--text-muted)'
              }}>
                Try adjusting your filters to see more results
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 24
            }}>
              {vendors.map((vendor, idx) => (
                <motion.div
                  key={vendor.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                >
                  <VendorCard v={vendor} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

