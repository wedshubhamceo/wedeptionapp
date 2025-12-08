'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 24
      }}>
        <Link href="/" style={{ display: 'flex', gap: 12, alignItems: 'center', textDecoration: 'none' }}>
          <div style={{
            fontWeight: 800,
            background: 'linear-gradient(135deg, var(--accent-rose) 0%, var(--maroon) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: 24,
            letterSpacing: '-0.02em'
          }}>
            Wedeption
          </div>
          <div style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            fontWeight: 500,
            display: 'none'
          }}>
            Plan. Celebrate. Remember.
          </div>
        </Link>
        <nav style={{
          display: 'flex',
          gap: 32,
          alignItems: 'center',
          flex: 1,
          justifyContent: 'center'
        }}>
          <Link href="/inspiration" style={{
            color: 'var(--text-dark)',
            fontWeight: 500,
            fontSize: 15,
            transition: 'color 0.2s ease',
            textDecoration: 'none'
          }}
          onMouseEnter={(e) => e.target.style.color = 'var(--accent-rose)'}
          onMouseLeave={(e) => e.target.style.color = 'var(--text-dark)'}
          >
            Inspiration
          </Link>
          <Link href="/vendors" style={{
            color: 'var(--text-dark)',
            fontWeight: 500,
            fontSize: 15,
            transition: 'color 0.2s ease',
            textDecoration: 'none'
          }}
          onMouseEnter={(e) => e.target.style.color = 'var(--accent-rose)'}
          onMouseLeave={(e) => e.target.style.color = 'var(--text-dark)'}
          >
            Vendors
          </Link>
          <Link href="/compare" style={{
            color: 'var(--text-dark)',
            fontWeight: 500,
            fontSize: 15,
            transition: 'color 0.2s ease',
            textDecoration: 'none'
          }}
          onMouseEnter={(e) => e.target.style.color = 'var(--accent-rose)'}
          onMouseLeave={(e) => e.target.style.color = 'var(--text-dark)'}
          >
            Compare
          </Link>
          <Link href="/ai-planner" style={{
            color: 'var(--text-dark)',
            fontWeight: 500,
            fontSize: 15,
            transition: 'color 0.2s ease',
            textDecoration: 'none'
          }}
          onMouseEnter={(e) => e.target.style.color = 'var(--accent-rose)'}
          onMouseLeave={(e) => e.target.style.color = 'var(--text-dark)'}
          >
            AI Planner
          </Link>
        </nav>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/register-vendor" style={{
            color: 'var(--text-dark)',
            fontWeight: 500,
            fontSize: 15,
            textDecoration: 'none',
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'var(--bg-warm)'
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent'
          }}
          >
            Become a Vendor
          </Link>
          <Link href="/login" className="btn-primary" style={{
            padding: '12px 24px',
            fontSize: 15
          }}>
            Login
          </Link>
        </div>
      </div>
    </header>
  )
}
