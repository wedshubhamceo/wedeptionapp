'use client'

import { useState, useEffect } from 'react'
import Footer from '../../components/Footer'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function ComparePage() {
  const [selectedVendors, setSelectedVendors] = useState([])

  useEffect(() => {
    const stored = localStorage.getItem('compareVendors')
    if (stored) {
      setSelectedVendors(JSON.parse(stored))
    }
  }, [])

  const sampleVendors = [
    { 
      id: '1', 
      business_name: 'Royal Decor & Events', 
      category: 'Decorator', 
      city: 'Mumbai', 
      price_range: { min: 25000, max: 50000 }, 
      avg_rating: 4.8, 
      review_count: 124,
      experience: '10+ years',
      portfolio_count: 45,
      response_time: '< 2 hours',
      verified: true,
      features: ['Free Consultation', 'Custom Designs', 'Same Day Setup']
    },
    { 
      id: '2', 
      business_name: 'Elite Photography Studio', 
      category: 'Photographer', 
      city: 'Delhi', 
      price_range: { min: 35000, max: 80000 }, 
      avg_rating: 4.9, 
      review_count: 89,
      experience: '8+ years',
      portfolio_count: 120,
      response_time: '< 1 hour',
      verified: true,
      features: ['Drone Photography', 'Video Editing', 'Online Gallery']
    },
    { 
      id: '3', 
      business_name: 'Gourmet Catering Co.', 
      category: 'Caterer', 
      city: 'Bangalore', 
      price_range: { min: 45000, max: 100000 }, 
      avg_rating: 4.7, 
      review_count: 156,
      experience: '12+ years',
      portfolio_count: 78,
      response_time: '< 3 hours',
      verified: true,
      features: ['Multi-Cuisine', 'Live Counters', 'Dietary Options']
    },
  ]

  const comparisonFields = [
    { label: 'Price Range', key: 'price_range', format: (v) => `₹${v.price_range?.min?.toLocaleString()} - ₹${v.price_range?.max?.toLocaleString()}` },
    { label: 'Rating', key: 'avg_rating', format: (v) => `${v.avg_rating} ⭐ (${v.review_count} reviews)` },
    { label: 'Experience', key: 'experience', format: (v) => v.experience },
    { label: 'Portfolio', key: 'portfolio_count', format: (v) => `${v.portfolio_count} projects` },
    { label: 'Response Time', key: 'response_time', format: (v) => v.response_time },
    { label: 'Verified', key: 'verified', format: (v) => v.verified ? '✓ Verified' : 'Not Verified' },
  ]

  const vendorsToCompare = selectedVendors.length > 0 
    ? sampleVendors.filter(v => selectedVendors.includes(v.id))
    : sampleVendors.slice(0, 3)

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
              Compare Vendors
            </h1>
            <p style={{
              fontSize: 'clamp(16px, 2vw, 20px)',
              color: 'var(--text-muted)',
              maxWidth: '600px'
            }}>
              Side-by-side comparison to help you make the best choice
            </p>
          </motion.div>
        </div>
      </section>

      {/* Comparison Table */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          {vendorsToCompare.length === 0 ? (
            <div className="card" style={{
              padding: '60px 40px',
              textAlign: 'center',
              maxWidth: '500px',
              margin: '0 auto'
            }}>
              <div style={{ fontSize: 48, marginBottom: 24 }}>📊</div>
              <h2 style={{
                fontSize: 24,
                fontWeight: 600,
                marginBottom: 12,
                color: 'var(--text-dark)'
              }}>
                No Vendors Selected
              </h2>
              <p style={{
                fontSize: 16,
                color: 'var(--text-muted)',
                marginBottom: 32
              }}>
                Select vendors from the vendors page to compare them here
              </p>
              <Link href="/vendors" className="btn-primary">
                Browse Vendors
              </Link>
            </div>
          ) : (
            <div style={{
              background: 'white',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden'
            }}>
              {/* Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: `200px repeat(${vendorsToCompare.length}, 1fr)`,
                background: 'var(--bg-warm)',
                borderBottom: '2px solid var(--border-light)'
              }}>
                <div style={{
                  padding: '20px',
                  fontWeight: 600,
                  color: 'var(--text-dark)',
                  fontSize: 14,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Details
                </div>
                {vendorsToCompare.map((vendor) => (
                  <div key={vendor.id} style={{
                    padding: '20px',
                    textAlign: 'center',
                    borderLeft: '1px solid var(--border-light)'
                  }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-warm)',
                      margin: '0 auto 12px',
                      overflow: 'hidden'
                    }}>
                      <img
                        src={`https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=200&q=80`}
                        alt={vendor.business_name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                    <h3 style={{
                      fontSize: 16,
                      fontWeight: 600,
                      margin: '0 0 4px',
                      color: 'var(--text-dark)'
                    }}>
                      {vendor.business_name}
                    </h3>
                    <div style={{
                      fontSize: 13,
                      color: 'var(--text-muted)',
                      marginBottom: 12
                    }}>
                      {vendor.category} · {vendor.city}
                    </div>
                    <Link href={`/vendor/${vendor.id}`} className="btn-primary" style={{
                      padding: '8px 16px',
                      fontSize: 13
                    }}>
                      View Details
                    </Link>
                  </div>
                ))}
              </div>

              {/* Comparison Rows */}
              {comparisonFields.map((field, idx) => (
                <div
                  key={field.key}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `200px repeat(${vendorsToCompare.length}, 1fr)`,
                    borderBottom: '1px solid var(--border-light)',
                    background: idx % 2 === 0 ? 'white' : 'var(--bg-cream)'
                  }}
                >
                  <div style={{
                    padding: '20px',
                    fontWeight: 600,
                    color: 'var(--text-dark)',
                    fontSize: 14
                  }}>
                    {field.label}
                  </div>
                  {vendorsToCompare.map((vendor) => (
                    <div key={vendor.id} style={{
                      padding: '20px',
                      textAlign: 'center',
                      borderLeft: '1px solid var(--border-light)',
                      fontSize: 14,
                      color: 'var(--text-dark)'
                    }}>
                      {field.format(vendor)}
                    </div>
                  ))}
                </div>
              ))}

              {/* Features Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: `200px repeat(${vendorsToCompare.length}, 1fr)`,
                borderBottom: '1px solid var(--border-light)',
                background: vendorsToCompare.length % 2 === 0 ? 'white' : 'var(--bg-cream)'
              }}>
                <div style={{
                  padding: '20px',
                  fontWeight: 600,
                  color: 'var(--text-dark)',
                  fontSize: 14
                }}>
                  Key Features
                </div>
                {vendorsToCompare.map((vendor) => (
                  <div key={vendor.id} style={{
                    padding: '20px',
                    borderLeft: '1px solid var(--border-light)'
                  }}>
                    <ul style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8
                    }}>
                      {vendor.features.map((feature, idx) => (
                        <li key={idx} style={{
                          fontSize: 13,
                          color: 'var(--text-dark)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8
                        }}>
                          <span style={{
                            color: 'var(--accent-rose)',
                            fontWeight: 600
                          }}>✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

