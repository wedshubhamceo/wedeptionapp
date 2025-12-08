'use client'

import Hero from '../components/Hero';
import VendorCard from '../components/VendorCard';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const [popularVendors, setPopularVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vendorsRes, categoriesRes] = await Promise.all([
        fetch('/api/vendors?sort_by=popular&limit=6'),
        fetch('/api/categories')
      ]);
      
      const vendorsData = await vendorsRes.json();
      const categoriesData = await categoriesRes.json();
      
      if (vendorsRes.ok) {
        setPopularVendors(vendorsData.vendors || []);
      }
      
      if (categoriesRes.ok) {
        setCategories(categoriesData.categories || []);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const categoryIcons = {
    'Venues': '🏛️',
    'Photographers': '📸',
    'Caterers': '🍽️',
    'Decorators': '🎨',
    'Makeup Artists': '💄',
    'Entertainment': '🎵',
    'Videographers': '🎥',
    'Mehendi Artists': '🎨',
    'DJs': '🎧',
    'Bands': '🎸',
    'Music & Entertainment': '🎵',
    'Choreographers': '💃',
    'Cake Artists': '🎂',
    'Bartenders': '🍸',
    'Invitation Designers': '✉️',
    'Gifts & Favours': '🎁',
    'Bridal Wear': '👗',
    'Groom Wear': '👔',
    'Clothes Designers': '✂️',
    'Jewellery': '💍',
    'Accessories': '👑',
    'Pandits/Priests': '🕉️',
    'Transportation': '🚗',
    'Honeymoon Packages': '✈️',
    'Entertainment Artists': '🎭'
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Hero />
      
      {/* Categories Section */}
      <section style={{ padding: '80px 0', background: 'white' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 style={{
              fontSize: 'clamp(28px, 4vw, 40px)',
              fontWeight: 700,
              marginBottom: 48,
              textAlign: 'center',
              color: 'var(--text-dark)'
            }}>
              Browse by Category
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 20,
              maxWidth: '1000px',
              margin: '0 auto'
            }}>
              {categories.slice(0, 6).map((cat, idx) => (
                <Link
                  key={cat.id}
                  href={`/vendors?category=${encodeURIComponent(cat.name)}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    whileHover={{ y: -4 }}
                    style={{
                      padding: '24px',
                      borderRadius: 'var(--radius-lg)',
                      background: 'var(--bg-warm)',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: '1px solid var(--border-light)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'white'
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--bg-warm)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <div style={{ fontSize: 40, marginBottom: 12 }}>
                      {categoryIcons[cat.name] || '🎉'}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 4 }}>
                      {cat.name}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      Browse vendors
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Popular Vendors Section */}
      <section style={{ padding: '80px 0', background: 'var(--bg-cream)' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 48
            }}
          >
            <div>
              <h2 style={{
                fontSize: 'clamp(28px, 4vw, 40px)',
                fontWeight: 700,
                marginBottom: 8,
                color: 'var(--text-dark)'
              }}>
                Popular Vendors
              </h2>
              <p style={{
                fontSize: 16,
                color: 'var(--text-muted)',
                margin: 0
              }}>
                Handpicked premium vendors for your special day
              </p>
            </div>
            <Link href="/vendors" className="btn-secondary" style={{
              padding: '12px 24px',
              fontSize: 15
            }}>
              View All
            </Link>
          </motion.div>
          {loading ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: 'var(--text-muted)'
            }}>
              Loading vendors...
            </div>
          ) : popularVendors.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: 'var(--text-muted)'
            }}>
              No vendors available yet. Check back soon!
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 24
            }}>
              {popularVendors.map((vendor, idx) => (
                <motion.div
                  key={vendor.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                >
                  <VendorCard v={vendor} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '100px 0',
        background: 'linear-gradient(135deg, var(--accent-rose) 0%, var(--maroon) 100%)',
        color: 'white',
        textAlign: 'center'
      }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 style={{
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 700,
              marginBottom: 24,
              color: 'white'
            }}>
              Ready to Plan Your Dream Wedding?
            </h2>
            <p style={{
              fontSize: 'clamp(16px, 2vw, 20px)',
              marginBottom: 40,
              opacity: 0.95,
              maxWidth: '600px',
              margin: '0 auto 40px'
            }}>
              Join thousands of couples who found their perfect vendors on Wedeption
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/vendors" style={{
                background: 'white',
                color: 'var(--accent-rose)',
                padding: '16px 32px',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                fontSize: 16,
                textDecoration: 'none',
                boxShadow: 'var(--shadow-lg)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = 'var(--shadow-xl)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = 'var(--shadow-lg)'
              }}
              >
                Start Planning
              </Link>
              <Link href="/register-vendor" style={{
                background: 'transparent',
                color: 'white',
                padding: '16px 32px',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                fontSize: 16,
                textDecoration: 'none',
                border: '2px solid white',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent'
              }}
              >
                Join as Vendor
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
