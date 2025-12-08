'use client'

import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    'For Couples': [
      { name: 'Browse Vendors', href: '/vendors' },
      { name: 'Wedding Inspiration', href: '/inspiration' },
      { name: 'Compare Vendors', href: '/compare' },
      { name: 'AI Wedding Planner', href: '/ai-planner' },
      { name: 'Wedding Checklist', href: '/checklist' },
    ],
    'For Vendors': [
      { name: 'Join as Vendor', href: '/register-vendor' },
      { name: 'Vendor Dashboard', href: '/vendor/dashboard' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Success Stories', href: '/success-stories' },
      { name: 'Resources', href: '/resources' },
    ],
    'Company': [
      { name: 'About Us', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' },
      { name: 'Contact', href: '/contact' },
    ],
    'Support': [
      { name: 'Help Center', href: '/help' },
      { name: 'Safety', href: '/safety' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cancellation Policy', href: '/cancellation' },
    ],
  }

  return (
    <footer style={{
      marginTop: 80,
      padding: '60px 0 24px',
      background: 'white',
      borderTop: '1px solid var(--border-light)'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 48,
          marginBottom: 48
        }}>
          {/* Brand Section */}
          <div>
            <div style={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, var(--accent-rose) 0%, var(--maroon) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: 24,
              letterSpacing: '-0.02em',
              marginBottom: 12
            }}>
              Wedeption
            </div>
            <p style={{
              fontSize: 14,
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              marginBottom: 20
            }}>
              Your trusted partner in planning the perfect wedding. Discover premium vendors and create unforgettable memories.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <a href="#" style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'var(--bg-warm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--accent-rose)'
                e.target.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'var(--bg-warm)'
                e.target.style.transform = 'translateY(0)'
              }}
              >
                <span style={{ color: 'var(--text-dark)' }}>f</span>
              </a>
              <a href="#" style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'var(--bg-warm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--accent-rose)'
                e.target.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'var(--bg-warm)'
                e.target.style.transform = 'translateY(0)'
              }}
              >
                <span style={{ color: 'var(--text-dark)' }}>in</span>
              </a>
              <a href="#" style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'var(--bg-warm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--accent-rose)'
                e.target.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'var(--bg-warm)'
                e.target.style.transform = 'translateY(0)'
              }}
              >
                <span style={{ color: 'var(--text-dark)' }}>ig</span>
              </a>
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--text-dark)',
                marginBottom: 16,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {title}
              </h4>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}>
                {links.map((link) => (
                  <li key={link.name} style={{ marginBottom: 12 }}>
                    <Link href={link.href} style={{
                      fontSize: 14,
                      color: 'var(--text-muted)',
                      textDecoration: 'none',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--accent-rose)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div style={{
          paddingTop: 32,
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div style={{
            fontSize: 14,
            color: 'var(--text-muted)'
          }}>
            © {currentYear} Wedeption. All rights reserved.
          </div>
          <div style={{
            display: 'flex',
            gap: 24,
            fontSize: 14,
            color: 'var(--text-muted)'
          }}>
            <Link href="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>
              Privacy
            </Link>
            <Link href="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>
              Terms
            </Link>
            <Link href="/sitemap" style={{ color: 'inherit', textDecoration: 'none' }}>
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
