'use client'

import { useState, useEffect } from 'react'
import Footer from '../../components/Footer'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function InspirationPage() {
  const [selectedFilter, setSelectedFilter] = useState('All')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [likedPosts, setLikedPosts] = useState(new Set())
  const [page, setPage] = useState(1)

  const filters = ['All', 'Decor', 'Photography', 'Catering', 'Venues', 'Fashion', 'Flowers']

  useEffect(() => {
    fetchPosts()
  }, [selectedFilter, page])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/inspiration-feed?page=${page}&limit=20&category=${selectedFilter === 'All' ? '' : selectedFilter}`)
      const data = await response.json()
      if (response.ok) {
        setPosts(data.posts || [])
      }
    } catch (error) {
      console.error('Failed to fetch inspiration feed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (postId) => {
    try {
      const response = await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, post_type: 'inspiration' })
      })
      const data = await response.json()
      if (response.ok) {
        // Update local state
        setPosts(prev => prev.map(p => 
          p.id === postId ? { ...p, likes: data.likes, liked: data.liked } : p
        ))
        if (data.liked) {
          setLikedPosts(prev => new Set([...prev, postId]))
        } else {
          setLikedPosts(prev => {
            const newSet = new Set(prev)
            newSet.delete(postId)
            return newSet
          })
        }
      }
    } catch (error) {
      console.error('Failed to like post:', error)
    }
  }

  const handleContact = (vendorId) => {
    // Redirect to vendor page with contact form (same as home page)
    window.location.href = `/vendors/${vendorId}`
  }

  const filteredPosts = selectedFilter === 'All' 
    ? posts 
    : posts.filter(p => p.category === selectedFilter)

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
              Wedding Inspiration
            </h1>
            <p style={{
              fontSize: 'clamp(16px, 2vw, 20px)',
              color: 'var(--text-muted)',
              maxWidth: '600px'
            }}>
              Discover beautiful ideas and inspiration for your perfect wedding day
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
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
            gap: 12,
            padding: '24px 0',
            flexWrap: 'wrap',
            overflowX: 'auto'
          }}>
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                style={{
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-light)',
                  background: selectedFilter === filter ? 'var(--accent-rose)' : 'white',
                  color: selectedFilter === filter ? 'white' : 'var(--text-dark)',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  if (selectedFilter !== filter) {
                    e.target.style.borderColor = 'var(--accent-rose)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedFilter !== filter) {
                    e.target.style.borderColor = 'var(--border-light)'
                  }
                }}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Masonry Grid */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div 
            className="masonry-grid"
            style={{
              columnCount: 4,
              columnGap: 24,
              lineHeight: 0
            }}
          >
            {loading ? (
              <div style={{ 
                gridColumn: '1 / -1', 
                textAlign: 'center', 
                padding: '60px 20px',
                color: 'var(--text-muted)'
              }}>
                Loading inspiration posts...
              </div>
            ) : filteredPosts.length === 0 ? (
              <div style={{ 
                gridColumn: '1 / -1', 
                textAlign: 'center', 
                padding: '60px 20px',
                color: 'var(--text-muted)'
              }}>
                No posts found. Check back soon!
              </div>
            ) : (
              filteredPosts.map((post, idx) => {
                const vendor = post.vendors || {}
                const isLiked = likedPosts.has(post.id) || post.liked
                return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                style={{
                  breakInside: 'avoid',
                  marginBottom: 24,
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  background: 'white',
                  boxShadow: 'var(--shadow-md)',
                  display: 'inline-block',
                  width: '100%',
                  transition: 'all 0.3s ease'
                }}
                whileHover={{ y: -4 }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                }}
              >
                <div style={{ position: 'relative', width: '100%' }}>
                  <img
                        src={post.media_url}
                        alt={post.caption || 'Inspiration post'}
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block'
                    }}
                  />
                  {/* Like Button */}
                  <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLike(post.id)
                        }}
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                          background: isLiked ? 'var(--accent-rose)' : 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-sm)',
                          transition: 'all 0.2s ease',
                          color: isLiked ? 'white' : 'var(--accent-rose)'
                    }}
                    onMouseEnter={(e) => {
                          e.target.style.background = isLiked ? 'var(--accent-rose)' : 'white'
                      e.target.style.transform = 'scale(1.1)'
                    }}
                    onMouseLeave={(e) => {
                          e.target.style.background = isLiked ? 'var(--accent-rose)' : 'rgba(255, 255, 255, 0.9)'
                      e.target.style.transform = 'scale(1)'
                    }}
                  >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--accent-rose)',
                    marginBottom: 8,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                        {post.category || 'All'}
                  </div>
                      {post.caption && (
                  <p style={{
                    fontSize: 14,
                    color: 'var(--text-dark)',
                          margin: 0,
                          marginBottom: 8,
                          lineHeight: 1.5,
                          fontWeight: 600
                        }}>
                          {post.caption}
                        </p>
                      )}
                      {post.description && (
                        <p style={{
                          fontSize: 13,
                          color: 'var(--text-muted)',
                    margin: 0,
                    marginBottom: 12,
                    lineHeight: 1.5
                  }}>
                          {post.description}
                  </p>
                      )}
                      {vendor.business_name && (
                        <div style={{
                          fontSize: 12,
                          color: 'var(--text-muted)',
                          marginBottom: 12
                        }}>
                          by {vendor.business_name}
                        </div>
                      )}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 12
                      }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    color: 'var(--text-muted)'
                  }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill={isLiked ? 'var(--accent-rose)' : 'none'} stroke="var(--accent-rose)" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                          <span>{post.likes || 0}</span>
                        </div>
                        {vendor.id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleContact(vendor.id)
                            }}
                            style={{
                              padding: '6px 16px',
                              borderRadius: 'var(--radius-full)',
                              background: 'var(--accent-rose)',
                              color: 'white',
                              border: 'none',
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = 'var(--maroon)'
                              e.target.style.transform = 'scale(1.05)'
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'var(--accent-rose)'
                              e.target.style.transform = 'scale(1)'
                            }}
                          >
                            Contact
                          </button>
                        )}
                  </div>
                </div>
              </motion.div>
                )
              })
            )}
          </div>
        </div>
      </section>


      <style jsx global>{`
        .masonry-grid {
          column-count: 4;
          column-gap: 24px;
        }
        @media (max-width: 1200px) {
          .masonry-grid {
            column-count: 3;
          }
        }
        @media (max-width: 768px) {
          .masonry-grid {
            column-count: 2;
          }
        }
        @media (max-width: 480px) {
          .masonry-grid {
            column-count: 1;
          }
        }
      `}</style>

      <Footer />
    </div>
  )
}

