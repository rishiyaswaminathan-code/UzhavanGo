import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sprout, ShoppingBag, ShieldCheck, User, Package, MapPin, LogIn } from 'lucide-react';

export function Navbar({ activePage, setActivePage }) {
  const { user, adminUser, switchRole } = useAuth();

  return (
    <header className="navbar">
      <div className="nav-inner">
        {/* Brand */}
        <button className="brand-logo" onClick={() => setActivePage('home')}>
          <img
            src="/assets/uzhavan-go-logo.png"
            alt="UzhavanGo Logo"
            className="brand-logo-img"
          />
          <div className="brand-text">
            <h1>UZHAVANGO</h1>
            <p>Direct from Farm to Table</p>
          </div>
        </button>

        {/* Navigation Links */}
        <nav className="nav-links">
          <button
            className={`nav-btn ${activePage === 'home' ? 'active' : ''}`}
            onClick={() => setActivePage('home')}
          >
            Home
          </button>
          <button
            className={`nav-btn ${activePage === 'market' ? 'active' : ''}`}
            onClick={() => setActivePage('market')}
          >
            <ShoppingBag size={16} />
            Marketplace
          </button>
          <button
            className={`nav-btn ${activePage === 'orders' ? 'active' : ''}`}
            onClick={() => setActivePage('orders')}
          >
            <Package size={16} />
            Orders
          </button>
          <button
            className={`nav-btn ${activePage === 'admin' ? 'active' : ''}`}
            onClick={() => setActivePage('admin')}
            style={{ color: '#7b1fa2' }}
          >
            <ShieldCheck size={16} />
            Admin Portal
          </button>
        </nav>

        {/* Right Actions & Active Role */}
        <div className="nav-actions">
          {user?.location && (
            <div className="location-tag" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#6b7280' }}>
              <MapPin size={14} color="#1e7e34" />
              <span>{user.location}</span>
            </div>
          )}

          {user && (
            <span className={`role-badge ${user.role}`}>
              {user.role}
            </span>
          )}

          {user ? (
            <button
              className={`btn btn-outline ${activePage === 'profile' ? 'active' : ''}`}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
              onClick={() => setActivePage('profile')}
            >
              <User size={15} />
              <span>{user?.name?.split(' ')[0] || 'Profile'}</span>
            </button>
          ) : (
            <button
              className={`btn btn-primary ${activePage === 'profile' ? 'active' : ''}`}
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
              onClick={() => setActivePage('profile')}
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
