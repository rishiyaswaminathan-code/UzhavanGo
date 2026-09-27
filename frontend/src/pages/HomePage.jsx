import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { getProduceImage } from '../utils/produceImages';
import { PlusCircle, ShoppingCart, ArrowRight, ShieldCheck, Truck, Sprout } from 'lucide-react';

export function HomePage({ setActivePage, onOpenPostModal }) {
  const { user } = useAuth();
  const [recentPosts, setRecentPosts] = useState([]);

  useEffect(() => {
    api.getPosts()
      .then(posts => setRecentPosts(posts.slice(0, 4)))
      .catch(console.error);
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ maxWidth: '640px', flex: '1 1 340px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.18)', backdropFilter: 'blur(8px)', padding: '0.35rem 0.85rem', borderRadius: '50px', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
            <img src="/assets/uzhavan-go-logo.png" alt="UzhavanGo" style={{ width: '22px', height: '22px', objectFit: 'contain', borderRadius: '4px', background: 'white' }} />
            <span>Direct Farm to Table Platform</span>
          </div>
          <h1 className="hero-title">
            Direct Farm Discovery &amp; Transparent Bidding
          </h1>
          <p className="hero-subtitle">
            Connecting farmers directly with wholesale and retail buyers. Enjoy confidential bids, zero middleman cuts, and real-time delivery tracking.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {user?.role === 'farmer' ? (
              <button className="btn btn-accent" onClick={onOpenPostModal}>
                <PlusCircle size={18} />
                Post Fresh Harvest
              </button>
            ) : (
              <button className="btn btn-accent" onClick={() => setActivePage('market')}>
                <ShoppingCart size={18} />
                Explore Harvests
              </button>
            )}
            <button
              className="btn btn-outline"
              style={{ background: 'white', color: '#1b5e20' }}
              onClick={() => setActivePage('market')}
            >
              View Marketplace <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div className="hero-logo-badge" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: '0 0 auto' }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: '1.25rem',
            boxShadow: '0 20px 35px -10px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            width: '200px'
          }}>
            <img
              src="/assets/uzhavan-go-logo.png"
              alt="UzhavanGo Official Logo"
              style={{
                width: '150px',
                height: '150px',
                objectFit: 'contain'
              }}
            />
            <span style={{ color: '#174d35', fontWeight: 800, fontSize: '1.05rem', marginTop: '0.4rem', letterSpacing: '-0.3px' }}>
              UZHAVANGO
            </span>
            <span style={{ color: '#6b7280', fontSize: '0.72rem', fontWeight: 600 }}>
              Direct from Farm to Table
            </span>
          </div>
        </div>
      </section>

      {/* Highlights Grid */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem', color: '#1f2937' }}>
          Platform Highlights
        </h2>
        <div className="stat-grid">
          <div className="stat-box">
            <div className="stat-value">{recentPosts.length}</div>
            <div className="stat-label">Active Harvests</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">₹0</div>
            <div className="stat-label">Middleman Fees</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">100%</div>
            <div className="stat-label">Direct Farm Sourcing</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">Instant</div>
            <div className="stat-label">UPI &amp; Card Receipts</div>
          </div>
        </div>
      </section>

      {/* Fresh Listings Preview */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1f2937' }}>
            Fresh Harvests Available Today
          </h2>
          <button className="btn btn-outline" style={{ fontSize: '0.85rem' }} onClick={() => setActivePage('market')}>
            See All Harvests →
          </button>
        </div>

        <div className="grid-cards">
          {recentPosts.map((post) => {
            const displayImage = post.image || getProduceImage(post.productName);
            return (
              <div key={post.id} className="product-card">
                <div className="product-image" style={{ background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {displayImage ? (
                    <img
                      src={displayImage}
                      alt={post.productName}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    style={{
                      display: displayImage ? 'none' : 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                      padding: '1rem',
                      textAlign: 'center',
                      color: '#64748b'
                    }}
                  >
                    <Sprout size={36} color="#16a34a" style={{ marginBottom: '0.4rem', opacity: 0.85 }} />
                    <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>Image not available for this produce yet</span>
                  </div>
                  <span
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: '#166534',
                      color: 'white',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      zIndex: 2
                    }}
                  >
                    {post.status || 'Posted'}
                  </span>
                </div>
                <div className="product-info">
                  <h3 className="product-title">{post.productName}</h3>
                  <div className="product-meta">
                    <span>📍 {post.location}</span>
                    <span>⚖️ {post.quantity} {post.unit}</span>
                  </div>
                  <p className="product-desc">{post.description || 'Fresh crop direct from organic farm soil.'}</p>
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: 'auto' }}
                    onClick={() => setActivePage('market')}
                  >
                    View Details &amp; Offers
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
