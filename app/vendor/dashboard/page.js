'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { auth } from '../../../lib/firebase_client'
import { onAuthStateChanged } from 'firebase/auth'
import Footer from '../../../components/Footer'

export default function VendorDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [vendor, setVendor] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [leads, setLeads] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedLead, setSelectedLead] = useState(null)
  const [leadFilter, setLeadFilter] = useState('all')

  useEffect(() => {
    // Check authentication
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login')
        return
      }
      
      try {
        // Sync user to Supabase
        const token = await user.getIdToken()
        await fetch('/api/sync-user', {
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
      } catch (error) {
        console.error('Error syncing user:', error)
      } finally {
        setAuthLoading(false)
      }
    })
    
    return () => unsubscribe()
  }, [router])

  useEffect(() => {
    if (!authLoading) {
    fetchDashboardData()
    }
  }, [authLoading])

  const fetchDashboardData = async () => {
    try {
      const token = await getFirebaseToken() // You'll need to implement this
      
      const [vendorRes, analyticsRes, leadsRes] = await Promise.all([
        fetch('/api/vendor/me', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/vendor/analytics', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/vendor/chats', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      const vendorData = await vendorRes.json()
      const analyticsData = await analyticsRes.json()
      const leadsData = await leadsRes.json()

      setVendor(vendorData.vendor)
      setAnalytics(analyticsData)
      setLeads(leadsData.chats || [])
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const getFirebaseToken = async () => {
    try {
      const user = auth.currentUser
      if (user) {
        return await user.getIdToken()
      }
      // If no current user, wait for auth state
      return new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
          unsubscribe()
          if (user) {
            resolve(await user.getIdToken())
          } else {
            resolve(null)
          }
        })
      })
    } catch (err) {
      console.error('Failed to get token:', err)
      return null
    }
  }

  const handleLeadAction = async (leadId, action, reply = '') => {
    try {
      const token = await getFirebaseToken()
      const res = await fetch('/api/vendor/lead-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ lead_id: leadId, action, reply })
      })
      
      if (res.ok) {
        fetchDashboardData() // Refresh data
        setSelectedLead(null)
      }
    } catch (err) {
      console.error('Failed to update lead:', err)
    }
  }

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
          <div style={{ fontSize: 18, color: 'var(--text-muted)' }}>
            {authLoading ? 'Checking authentication...' : 'Loading dashboard...'}
          </div>
        </div>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <div style={{ fontSize: 18, color: 'var(--text-muted)', marginBottom: 24 }}>
            Vendor profile not found
          </div>
          <Link href="/register-vendor" className="btn-primary">
            Register as Vendor
          </Link>
        </div>
      </div>
    )
  }

  const stats = analytics?.overview || {}

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-cream)' }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid var(--border-light)',
        padding: '20px 0',
        marginBottom: 32
      }}>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h1 style={{
                fontSize: 28,
                fontWeight: 700,
                margin: 0,
                marginBottom: 4,
                color: 'var(--text-dark)'
              }}>
                {vendor.business_name}
              </h1>
              <div style={{
                fontSize: 14,
                color: 'var(--text-muted)'
              }}>
                {vendor.category} • {vendor.city}
              </div>
            </div>
            <div style={{
              display: 'flex',
              gap: 12,
              alignItems: 'center'
            }}>
              <div style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                background: vendor.verified ? 'var(--accent-gold-light)' : 'var(--bg-warm)',
                color: vendor.verified ? '#8B6914' : 'var(--text-muted)',
                fontSize: 13,
                fontWeight: 600
              }}>
                {vendor.verified ? '✓ Verified' : 'Pending Verification'}
              </div>
              <Link href="/" className="btn-secondary">
                View Public Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 32,
          borderBottom: '2px solid var(--border-light)'
        }}>
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'leads', label: 'Leads (CRM)', icon: '💼' },
            { id: 'reviews', label: 'Reviews', icon: '⭐' },
            { id: 'portfolio', label: 'Portfolio', icon: '🖼️' },
            { id: 'inspiration', label: 'Inspiration Feed', icon: '✨' },
            { id: 'analytics', label: 'Analytics', icon: '📈' },
            { id: 'subscription', label: 'Subscription', icon: '💎' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 24px',
                border: 'none',
                background: 'transparent',
                borderBottom: activeTab === tab.id ? '3px solid var(--accent-rose)' : '3px solid transparent',
                color: activeTab === tab.id ? 'var(--accent-rose)' : 'var(--text-muted)',
                fontWeight: activeTab === tab.id ? 600 : 500,
                fontSize: 15,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 24,
              marginBottom: 32
            }}>
              <StatCard
                title="Total Leads"
                value={stats.totalLeads || 0}
                icon="💼"
                color="var(--accent-rose)"
                trend={stats.recentActivity?.leads > 0 ? `+${stats.recentActivity.leads} this week` : null}
              />
              <StatCard
                title="Conversion Rate"
                value={`${stats.conversionRate || 0}%`}
                icon="📈"
                color="var(--accent-gold)"
                subtitle={`${stats.leadsByStatus?.booked || 0} booked`}
              />
              <StatCard
                title="Average Rating"
                value={stats.avgRating || '0.0'}
                icon="⭐"
                color="var(--accent-gold)"
                subtitle={`${stats.totalReviews || 0} reviews`}
              />
              <StatCard
                title="Portfolio Likes"
                value={stats.totalLikes || 0}
                icon="❤️"
                color="var(--accent-rose)"
                subtitle={`${stats.approvedPortfolio || 0} approved`}
              />
            </div>

            {/* Leads Status Breakdown */}
            <div className="card" style={{ marginBottom: 32, padding: 24 }}>
              <h3 style={{
                fontSize: 20,
                fontWeight: 600,
                marginBottom: 20,
                color: 'var(--text-dark)'
              }}>
                Leads by Status
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 16
              }}>
                <StatusCard
                  label="New"
                  count={stats.leadsByStatus?.new || 0}
                  color="var(--accent-rose)"
                  onClick={() => setActiveTab('leads')}
                />
                <StatusCard
                  label="In Progress"
                  count={stats.leadsByStatus?.in_progress || 0}
                  color="var(--accent-gold)"
                  onClick={() => setActiveTab('leads')}
                />
                <StatusCard
                  label="Booked"
                  count={stats.leadsByStatus?.booked || 0}
                  color="#10b981"
                  onClick={() => setActiveTab('leads')}
                />
                <StatusCard
                  label="Rejected"
                  count={stats.leadsByStatus?.rejected || 0}
                  color="var(--text-muted)"
                  onClick={() => setActiveTab('leads')}
                />
              </div>
            </div>

            {/* Recent Leads */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20
              }}>
                <h3 style={{
                  fontSize: 20,
                  fontWeight: 600,
                  margin: 0,
                  color: 'var(--text-dark)'
                }}>
                  Recent Leads
                </h3>
                <button
                  onClick={() => setActiveTab('leads')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    background: 'white',
                    color: 'var(--text-dark)',
                    fontSize: 14,
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  View All
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {analytics?.recentLeads?.slice(0, 5).map(lead => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onClick={() => {
                      setSelectedLead(lead)
                      setActiveTab('leads')
                    }}
                  />
                )) || <div style={{ color: 'var(--text-muted)', padding: 20, textAlign: 'center' }}>No leads yet</div>}
              </div>
            </div>
          </motion.div>
        )}

        {/* Leads/CRM Tab */}
        {activeTab === 'leads' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: '300px 1fr',
              gap: 24
            }}>
              {/* Leads List */}
              <div className="card" style={{ padding: 0, maxHeight: '600px', overflowY: 'auto' }}>
                <div style={{
                  padding: 20,
                  borderBottom: '1px solid var(--border-light)',
                  position: 'sticky',
                  top: 0,
                  background: 'white',
                  zIndex: 10
                }}>
                  <h3 style={{
                    fontSize: 18,
                    fontWeight: 600,
                    margin: 0,
                    marginBottom: 16,
                    color: 'var(--text-dark)'
                  }}>
                    All Leads ({leads.length})
                  </h3>
                  <div style={{
                    display: 'flex',
                    gap: 8,
                    flexWrap: 'wrap'
                  }}>
                    {['all', 'new', 'in_progress', 'booked', 'rejected'].map(status => (
                      <button
                        key={status}
                        onClick={() => setLeadFilter(status)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-full)',
                          border: '1px solid var(--border-light)',
                          background: leadFilter === status ? 'var(--accent-rose)' : 'white',
                          color: leadFilter === status ? 'white' : 'var(--text-dark)',
                          fontSize: 12,
                          cursor: 'pointer',
                          fontWeight: leadFilter === status ? 600 : 400,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {status.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  {leads
                    .filter(lead => leadFilter === 'all' || lead.status === leadFilter)
                    .map(lead => (
                    <div
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      style={{
                        padding: 16,
                        borderBottom: '1px solid var(--border-light)',
                        cursor: 'pointer',
                        background: selectedLead?.id === lead.id ? 'var(--bg-warm)' : 'white',
                        transition: 'background 0.2s ease'
                      }}
                    >
                      <div style={{
                        fontWeight: 600,
                        marginBottom: 4,
                        color: 'var(--text-dark)'
                      }}>
                        {lead.user_name}
                      </div>
                      <div style={{
                        fontSize: 12,
                        color: 'var(--text-muted)',
                        marginBottom: 8
                      }}>
                        {lead.contact_phone}
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-full)',
                          background: getStatusColor(lead.status),
                          color: 'white',
                          fontSize: 11,
                          fontWeight: 600
                        }}>
                          {lead.status}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {new Date(lead.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lead Details */}
              <div className="card" style={{ padding: 24 }}>
                {selectedLead ? (
                  <LeadDetails
                    lead={selectedLead}
                    onAction={handleLeadAction}
                  />
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: 'var(--text-muted)'
                  }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>👈</div>
                    <div>Select a lead to view details</div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ReviewsSection vendorId={vendor.id} />
          </motion.div>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <PortfolioSection vendor={vendor} />
          </motion.div>
        )}

        {/* Inspiration Feed Tab */}
        {activeTab === 'inspiration' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <InspirationFeedSection vendor={vendor} />
          </motion.div>
        )}

        {/* Subscription Tab */}
        {activeTab === 'subscription' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <SubscriptionSection vendor={vendor} />
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <AnalyticsSection analytics={analytics} />
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  )
}

// Helper Components
function StatCard({ title, value, icon, color, subtitle, trend }) {
  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12
      }}>
        <div>
          <div style={{
            fontSize: 13,
            color: 'var(--text-muted)',
            marginBottom: 8,
            fontWeight: 500
          }}>
            {title}
          </div>
          <div style={{
            fontSize: 32,
            fontWeight: 700,
            color: color,
            marginBottom: 4
          }}>
            {value}
          </div>
          {subtitle && (
            <div style={{
              fontSize: 12,
              color: 'var(--text-muted)'
            }}>
              {subtitle}
            </div>
          )}
          {trend && (
            <div style={{
              fontSize: 12,
              color: '#10b981',
              marginTop: 4
            }}>
              {trend}
            </div>
          )}
        </div>
        <div style={{
          fontSize: 32,
          opacity: 0.2
        }}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function StatusCard({ label, count, color, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: 20,
        borderRadius: 'var(--radius-md)',
        background: color,
        color: 'white',
        cursor: 'pointer',
        transition: 'transform 0.2s ease'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{
        fontSize: 13,
        opacity: 0.9,
        marginBottom: 8
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 32,
        fontWeight: 700
      }}>
        {count}
      </div>
    </div>
  )
}

function LeadCard({ lead, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: 16,
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-light)',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent-rose)'
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-light)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8
      }}>
        <div>
          <div style={{
            fontWeight: 600,
            marginBottom: 4,
            color: 'var(--text-dark)'
          }}>
            {lead.user_name || lead.name}
          </div>
          <div style={{
            fontSize: 13,
            color: 'var(--text-muted)'
          }}>
            {lead.contact_phone}
          </div>
        </div>
        <span style={{
          padding: '4px 12px',
          borderRadius: 'var(--radius-full)',
          background: getStatusColor(lead.status),
          color: 'white',
          fontSize: 11,
          fontWeight: 600
        }}>
          {lead.status}
        </span>
      </div>
      {lead.event_date && (
        <div style={{
          fontSize: 12,
          color: 'var(--text-muted)',
          marginTop: 8
        }}>
          📅 Event: {new Date(lead.event_date).toLocaleDateString()}
        </div>
      )}
    </div>
  )
}

function LeadDetails({ lead, onAction }) {
  const [reply, setReply] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  
  useEffect(() => {
    // Load existing reply if any
    if (lead.details?.vendor_reply) {
      setReply(lead.details.vendor_reply)
    } else {
      setReply('')
    }
  }, [lead])

  const handleAction = async (action) => {
    setActionLoading(true)
    await onAction(lead.id, action, reply)
    setActionLoading(false)
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24
      }}>
        <div>
          <h3 style={{
            fontSize: 24,
            fontWeight: 700,
            margin: 0,
            marginBottom: 8,
            color: 'var(--text-dark)'
          }}>
            {lead.user_name || lead.name}
          </h3>
          <div style={{
            fontSize: 14,
            color: 'var(--text-muted)',
            marginBottom: 4
          }}>
            📞 {lead.contact_phone}
          </div>
          <div style={{
            fontSize: 14,
            color: 'var(--text-muted)'
          }}>
            📅 {lead.event_date ? new Date(lead.event_date).toLocaleDateString() : 'Not specified'}
          </div>
        </div>
        <span style={{
          padding: '8px 16px',
          borderRadius: 'var(--radius-full)',
          background: getStatusColor(lead.status),
          color: 'white',
          fontSize: 13,
          fontWeight: 600
        }}>
          {lead.status}
        </span>
      </div>

      <div style={{
        padding: 20,
        background: 'var(--bg-warm)',
        borderRadius: 'var(--radius-md)',
        marginBottom: 24
      }}>
        <div style={{
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 12,
          color: 'var(--text-dark)'
        }}>
          Event Details
        </div>
        <div style={{
          fontSize: 14,
          color: 'var(--text-dark)',
          marginBottom: 8
        }}>
          <strong>Budget:</strong> {lead.budget_range || 'Not specified'}
        </div>
        {lead.details && (
          <div style={{
            fontSize: 14,
            color: 'var(--text-dark)',
            whiteSpace: 'pre-wrap'
          }}>
            {typeof lead.details === 'string' ? lead.details : JSON.stringify(lead.details, null, 2)}
          </div>
        )}
      </div>

      {lead.details?.vendor_reply && (
        <div style={{
          padding: 16,
          background: '#e0f2fe',
          borderRadius: 'var(--radius-md)',
          marginBottom: 24
        }}>
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 8,
            color: '#0369a1'
          }}>
            Your Reply:
          </div>
          <div style={{
            fontSize: 14,
            color: '#0c4a6e'
          }}>
            {lead.details.vendor_reply}
          </div>
        </div>
      )}

      <div style={{
        padding: 20,
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-md)',
        marginBottom: 20
      }}>
        <div style={{
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 12,
          color: 'var(--text-dark)'
        }}>
          Reply to Lead
        </div>
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Type your reply here..."
          style={{
            width: '100%',
            minHeight: '100px',
            padding: 12,
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
            fontSize: 14,
            fontFamily: 'inherit',
            resize: 'vertical',
            marginBottom: 12
          }}
        />
        <div style={{
          display: 'flex',
          gap: 12
        }}>
          <button
            onClick={() => handleAction('accept')}
            disabled={actionLoading}
            className="btn-primary"
            style={{
              flex: 1,
              opacity: actionLoading ? 0.6 : 1
            }}
          >
            {lead.status === 'in_progress' ? 'Update' : 'Accept Lead'}
          </button>
          <button
            onClick={() => handleAction('reject')}
            disabled={actionLoading}
            style={{
              flex: 1,
              padding: '12px 24px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              background: 'white',
              color: 'var(--text-dark)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              opacity: actionLoading ? 0.6 : 1
            }}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  )
}

function ReviewsSection({ vendorId }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/reviews/list?vendor_id=${vendorId}`)
      .then(r => r.json())
      .then(d => {
        setReviews(d.reviews || [])
        setLoading(false)
      })
  }, [vendorId])

  if (loading) return <div>Loading reviews...</div>

  return (
    <div className="card" style={{ padding: 24 }}>
      <h3 style={{
        fontSize: 20,
        fontWeight: 600,
        marginBottom: 24,
        color: 'var(--text-dark)'
      }}>
        Customer Reviews
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {reviews.map(review => (
          <div
            key={review.id}
            style={{
              padding: 20,
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 12
            }}>
              <div>
                <div style={{
                  fontWeight: 600,
                  marginBottom: 4,
                  color: 'var(--text-dark)'
                }}>
                  {review.users?.name || 'Anonymous'}
                </div>
                <div style={{
                  display: 'flex',
                  gap: 4,
                  alignItems: 'center'
                }}>
                  {'⭐'.repeat(review.rating)}
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {review.rating}/5
                  </span>
                </div>
              </div>
              <div style={{
                fontSize: 12,
                color: 'var(--text-muted)'
              }}>
                {new Date(review.created_at).toLocaleDateString()}
              </div>
            </div>
            {review.review_text && (
              <div style={{
                fontSize: 14,
                color: 'var(--text-dark)',
                lineHeight: 1.6
              }}>
                {review.review_text}
              </div>
            )}
          </div>
        ))}
        {reviews.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: 40,
            color: 'var(--text-muted)'
          }}>
            No reviews yet
          </div>
        )}
      </div>
    </div>
  )
}

function PortfolioSection({ vendor }) {
  const [portfolio, setPortfolio] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const token = await auth.currentUser?.getIdToken()
        const res = await fetch('/api/vendor/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        setPortfolio(data.portfolio || [])
      } catch (err) {
        console.error('Failed to fetch portfolio:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPortfolio()
  }, [])

  if (loading) return <div>Loading portfolio...</div>

  return (
    <div>
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24
        }}>
          <h3 style={{
            fontSize: 20,
            fontWeight: 600,
            margin: 0,
            color: 'var(--text-dark)'
          }}>
            Portfolio ({portfolio.length} items)
          </h3>
          <button className="btn-primary">
            Add New Image
          </button>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 16
        }}>
          {portfolio.map(item => (
            <div
              key={item.id}
              style={{
                position: 'relative',
                paddingTop: '75%',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: 'var(--bg-warm)'
              }}
            >
              <img
                src={item.media_url}
                alt={item.caption}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                padding: 12,
                color: 'white',
                fontSize: 12
              }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  {item.caption || 'Untitled'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>❤️ {item.likes || 0}</span>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: item.approved ? '#10b981' : 'var(--accent-gold)',
                    fontSize: 10
                  }}>
                    {item.approved ? 'Approved' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {portfolio.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: 60,
            color: 'var(--text-muted)'
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🖼️</div>
            <div>No portfolio items yet</div>
            <button className="btn-primary" style={{ marginTop: 16 }}>
              Upload Your First Image
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function AnalyticsSection({ analytics }) {
  const stats = analytics?.overview || {}
  
  return (
    <div>
      {/* Key Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 20,
        marginBottom: 24
      }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Conversion Rate</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent-gold)' }}>
            {stats.conversionRate || 0}%
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            {stats.leadsByStatus?.booked || 0} of {stats.totalLeads || 0} leads
          </div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Avg Response Time</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent-rose)' }}>
            -- hrs
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Coming soon
          </div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Customer Satisfaction</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent-gold)' }}>
            {stats.avgRating || '0.0'} ⭐
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Based on {stats.totalReviews || 0} reviews
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{
          fontSize: 20,
          fontWeight: 600,
          marginBottom: 24,
          color: 'var(--text-dark)'
        }}>
          Monthly Leads Trend
        </h3>
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 16,
          height: 200,
          padding: '20px 0'
        }}>
          {analytics?.monthlyTrends?.map((month, idx) => {
            const maxLeads = Math.max(...analytics.monthlyTrends.map(m => m.leads), 1)
            const height = maxLeads > 0 ? (month.leads / maxLeads) * 160 : 0
            return (
            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: '100%',
                background: 'linear-gradient(to top, var(--accent-rose), var(--accent-gold))',
                height: `${height}px`,
                borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                marginBottom: 8,
                minHeight: month.leads > 0 ? '4px' : '0px',
                transition: 'height 0.3s ease'
              }} />
              <div style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                marginBottom: 4,
                fontWeight: 500
              }}>
                {month.month}
              </div>
              <div style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--text-dark)'
              }}>
                {month.leads}
              </div>
            </div>
            )
          })}
        </div>
      </div>

      {/* Lead Status Distribution */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{
          fontSize: 20,
          fontWeight: 600,
          marginBottom: 24,
          color: 'var(--text-dark)'
        }}>
          Lead Status Distribution
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'New', count: stats.leadsByStatus?.new || 0, color: 'var(--accent-rose)' },
            { label: 'In Progress', count: stats.leadsByStatus?.in_progress || 0, color: 'var(--accent-gold)' },
            { label: 'Booked', count: stats.leadsByStatus?.booked || 0, color: '#10b981' },
            { label: 'Rejected', count: stats.leadsByStatus?.rejected || 0, color: 'var(--text-muted)' }
          ].map(status => {
            const total = stats.totalLeads || 1
            const percentage = (status.count / total) * 100
            return (
              <div key={status.label}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8
                }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-dark)' }}>
                    {status.label}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-dark)' }}>
                    {status.count} ({percentage.toFixed(1)}%)
                  </div>
                </div>
                <div style={{
                  width: '100%',
                  height: 8,
                  background: 'var(--bg-warm)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    background: status.color,
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function InspirationFeedSection({ vendor }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({ media_url: '', caption: '', description: '', category: 'All' })
  const [subscriptionInfo, setSubscriptionInfo] = useState(null)

  useEffect(() => {
    fetchInspirationPosts()
    fetchSubscriptionInfo()
  }, [])

  const fetchInspirationPosts = async () => {
    try {
      const token = await auth.currentUser?.getIdToken()
      // Fetch vendor's inspiration posts
      const res = await fetch(`/api/inspiration-feed?vendor_id=${vendor.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setPosts(data.posts || [])
    } catch (err) {
      console.error('Failed to fetch inspiration posts:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubscriptionInfo = async () => {
    try {
      const res = await fetch(`/api/subscription/check?vendor_id=${vendor.id}`)
      const data = await res.json()
      setSubscriptionInfo(data)
    } catch (err) {
      console.error('Failed to fetch subscription info:', err)
    }
  }

  const handleUpload = async () => {
    if (!formData.media_url) {
      alert('Please provide an image URL')
      return
    }

    setUploading(true)
    try {
      const token = await auth.currentUser?.getIdToken()
      const res = await fetch('/api/inspiration-feed/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          vendor_id: vendor.id,
          ...formData
        })
      })
      const data = await res.json()
      
      if (res.ok) {
        alert('Inspiration post uploaded! Pending admin approval.')
        setFormData({ media_url: '', caption: '', description: '', category: 'All' })
        setShowUpload(false)
        fetchInspirationPosts()
        fetchSubscriptionInfo()
      } else {
        alert(data.error || 'Failed to upload post')
      }
    } catch (err) {
      console.error('Failed to upload:', err)
      alert('Failed to upload post')
    } finally {
      setUploading(false)
    }
  }

  const categories = ['All', 'Decor', 'Photography', 'Catering', 'Venues', 'Fashion', 'Flowers']

  return (
    <div>
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24
        }}>
          <div>
            <h3 style={{
              fontSize: 20,
              fontWeight: 600,
              margin: 0,
              marginBottom: 8,
              color: 'var(--text-dark)'
            }}>
              Inspiration Feed Posts
            </h3>
            {subscriptionInfo && (
              <div style={{
                fontSize: 13,
                color: 'var(--text-muted)'
              }}>
                {subscriptionInfo.current.posts} / {subscriptionInfo.limits.posts} posts this month
                {subscriptionInfo.remaining.posts === 0 && (
                  <span style={{ color: 'var(--accent-rose)', marginLeft: 8 }}>
                    • Limit reached
                  </span>
                )}
              </div>
            )}
          </div>
          <button
            onClick={() => setShowUpload(!showUpload)}
            disabled={subscriptionInfo && subscriptionInfo.remaining.posts === 0}
            className="btn-primary"
            style={{
              opacity: subscriptionInfo && subscriptionInfo.remaining.posts === 0 ? 0.5 : 1
            }}
          >
            {showUpload ? 'Cancel' : '+ Upload Post'}
          </button>
        </div>

        {showUpload && (
          <div style={{
            padding: 20,
            background: 'var(--bg-warm)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 24
          }}>
            <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Upload Inspiration Post</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                  Image URL *
                </label>
                <input
                  type="url"
                  value={formData.media_url}
                  onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    fontSize: 14
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                  Caption
                </label>
                <input
                  type="text"
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  placeholder="Short caption for your post"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    fontSize: 14
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of your work"
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    fontSize: 14,
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    fontSize: 14
                  }}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleUpload}
                disabled={uploading || !formData.media_url}
                className="btn-primary"
                style={{
                  alignSelf: 'flex-start',
                  opacity: uploading || !formData.media_url ? 0.6 : 1
                }}
              >
                {uploading ? 'Uploading...' : 'Upload Post'}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            Loading posts...
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✨</div>
            <div>No inspiration posts yet</div>
            <button
              onClick={() => setShowUpload(true)}
              className="btn-primary"
              style={{ marginTop: 16 }}
            >
              Upload Your First Post
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: 16
          }}>
            {posts.map(post => (
              <div
                key={post.id}
                style={{
                  position: 'relative',
                  paddingTop: '75%',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  background: 'var(--bg-warm)'
                }}
              >
                <img
                  src={post.media_url}
                  alt={post.caption}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                  padding: 12,
                  color: 'white',
                  fontSize: 12
                }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    {post.caption || 'Untitled'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>❤️ {post.likes || 0}</span>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      background: post.approved ? '#10b981' : 'var(--accent-gold)',
                      fontSize: 10
                    }}>
                      {post.approved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SubscriptionSection({ vendor }) {
  const [subscriptionInfo, setSubscriptionInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchSubscriptionInfo()
  }, [])

  const fetchSubscriptionInfo = async () => {
    try {
      const res = await fetch(`/api/subscription/check?vendor_id=${vendor.id}`)
      const data = await res.json()
      setSubscriptionInfo(data)
    } catch (err) {
      console.error('Failed to fetch subscription info:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async () => {
    setProcessing(true)
    try {
      const token = await auth.currentUser?.getIdToken()
      const res = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          vendor_id: vendor.id,
          plan: 'premium'
        })
      })
      const data = await res.json()
      
      if (res.ok && data.order_id) {
        // Initialize Razorpay checkout with payment
        const options = {
          key: data.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: 'INR',
          name: 'Wedeption Premium',
          description: 'Premium Subscription - ₹399/month',
          order_id: data.order_id,
          handler: function (response) {
            alert('Payment successful! Your premium subscription is now active.')
            fetchSubscriptionInfo()
          },
          prefill: {
            name: vendor.business_name,
            email: vendor.email || '',
            contact: vendor.phone || ''
          },
          theme: {
            color: '#E91E63'
          },
          modal: {
            ondismiss: function() {
              setProcessing(false)
            }
          }
        }
        const rzp = new window.Razorpay(options)
        rzp.on('payment.failed', function (response) {
          alert('Payment failed. Please try again.')
          setProcessing(false)
        })
        rzp.open()
      } else {
        alert(data.error || 'Failed to create subscription')
        setProcessing(false)
      }
    } catch (err) {
      console.error('Failed to subscribe:', err)
      alert('Failed to initiate subscription')
      setProcessing(false)
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div>
  }

  const isPremium = subscriptionInfo?.is_premium || false

  return (
    <div>
      {/* Current Status */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>
          Current Subscription
        </h3>
        <div style={{
          padding: 20,
          background: isPremium ? 'linear-gradient(135deg, var(--accent-gold) 0%, #C9A227 100%)' : 'var(--bg-warm)',
          borderRadius: 'var(--radius-md)',
          color: isPremium ? 'white' : 'var(--text-dark)'
        }}>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
            {isPremium ? '⭐ Premium Plan' : 'Free Plan'}
          </div>
          {subscriptionInfo?.subscription && (
            <div style={{ fontSize: 14, opacity: 0.9 }}>
              Valid until {new Date(subscriptionInfo.subscription.end_date).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {/* Usage Stats */}
      {subscriptionInfo && (
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>
            Monthly Usage
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Posts</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent-rose)' }}>
                {subscriptionInfo.current.posts} / {subscriptionInfo.limits.posts}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Portfolio</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent-gold)' }}>
                {subscriptionInfo.current.portfolio} / {subscriptionInfo.limits.portfolio === 999999 ? '∞' : subscriptionInfo.limits.portfolio}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Leads</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#10b981' }}>
                {subscriptionInfo.current.leads} / {subscriptionInfo.limits.leads.max}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Benefits Comparison */}
      <SubscriptionBenefitsComparison isPremium={isPremium} onSubscribe={handleSubscribe} processing={processing} />
    </div>
  )
}

function SubscriptionBenefitsComparison({ isPremium, onSubscribe, processing }) {
  const benefits = {
    free: {
      posts: '10 posts/month',
      portfolio: '10 items',
      leads: '3-5 leads/month',
      visibility: 'Lower visibility',
      features: ['Basic dashboard', 'Lead management', 'Reviews']
    },
    premium: {
      posts: '50 posts/month',
      portfolio: 'Unlimited',
      leads: '5-10 leads/month',
      visibility: 'Higher visibility',
      features: ['All dashboard features', 'Advanced analytics', 'Priority support', 'Premium badge', 'Featured listings']
    }
  }

  return (
    <div className="card" style={{ padding: 24 }}>
      <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24, textAlign: 'center' }}>
        Choose Your Plan
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 24
      }}>
        {/* Free Plan */}
        <div style={{
          padding: 24,
          border: '2px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          background: 'white',
          position: 'relative'
        }}>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Free</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 24 }}>
            ₹0<span style={{ fontSize: 16, fontWeight: 400, color: 'var(--text-muted)' }}>/month</span>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: 24 }}>
            <li style={{ padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
              ✓ {benefits.free.posts}
            </li>
            <li style={{ padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
              ✓ {benefits.free.portfolio}
            </li>
            <li style={{ padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
              ✓ {benefits.free.leads}
            </li>
            <li style={{ padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
              ✓ {benefits.free.visibility}
            </li>
            {benefits.free.features.map((feature, idx) => (
              <li key={idx} style={{ padding: '8px 0', fontSize: 13, color: 'var(--text-muted)' }}>
                • {feature}
              </li>
            ))}
          </ul>
          {isPremium && (
            <div style={{
              padding: '8px 12px',
              background: '#10b981',
              color: 'white',
              borderRadius: 'var(--radius-full)',
              fontSize: 12,
              fontWeight: 600,
              textAlign: 'center'
            }}>
              Current Plan
            </div>
          )}
        </div>

        {/* Premium Plan */}
        <div style={{
          padding: 24,
          border: '2px solid var(--accent-rose)',
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(135deg, rgba(233,30,99,0.05) 0%, rgba(212,175,55,0.03) 100%)',
          position: 'relative'
        }}>
          {!isPremium && (
            <div style={{
              position: 'absolute',
              top: -12,
              right: 24,
              padding: '4px 12px',
              background: 'var(--accent-rose)',
              color: 'white',
              borderRadius: 'var(--radius-full)',
              fontSize: 11,
              fontWeight: 600
            }}>
              RECOMMENDED
            </div>
          )}
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Premium</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--accent-rose)', marginBottom: 24 }}>
            ₹399<span style={{ fontSize: 16, fontWeight: 400, color: 'var(--text-muted)' }}>/month</span>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: 24 }}>
            <li style={{ padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
              ✓ {benefits.premium.posts}
            </li>
            <li style={{ padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
              ✓ {benefits.premium.portfolio}
            </li>
            <li style={{ padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
              ✓ {benefits.premium.leads}
            </li>
            <li style={{ padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
              ✓ {benefits.premium.visibility}
            </li>
            {benefits.premium.features.map((feature, idx) => (
              <li key={idx} style={{ padding: '8px 0', fontSize: 13, color: 'var(--text-dark)', fontWeight: 500 }}>
                ✓ {feature}
              </li>
            ))}
          </ul>
          {isPremium ? (
            <div style={{
              padding: '8px 12px',
              background: '#10b981',
              color: 'white',
              borderRadius: 'var(--radius-full)',
              fontSize: 12,
              fontWeight: 600,
              textAlign: 'center'
            }}>
              Current Plan
            </div>
          ) : (
            <button
              onClick={onSubscribe}
              disabled={processing}
              className="btn-primary"
              style={{
                width: '100%',
                opacity: processing ? 0.6 : 1
              }}
            >
              {processing ? 'Processing...' : 'Subscribe Now'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function getStatusColor(status) {
  const colors = {
    new: 'var(--accent-rose)',
    in_progress: 'var(--accent-gold)',
    booked: '#10b981',
    rejected: 'var(--text-muted)'
  }
  return colors[status] || 'var(--text-muted)'
}

