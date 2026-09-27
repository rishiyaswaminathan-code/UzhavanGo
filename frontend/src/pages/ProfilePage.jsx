import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Phone, MapPin, ShieldCheck, LogIn, LogOut, UserCheck } from 'lucide-react';

export function ProfilePage({ showToast, setActivePage }) {
  const { user, loginUser, logout } = useAuth();
  const [roleInput, setRoleInput] = useState(user?.role || 'farmer');
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [phoneInput, setPhoneInput] = useState(user?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync inputs if user state changes externally
  useEffect(() => {
    if (user) {
      setRoleInput(user.role || 'farmer');
      setNameInput(user.name || '');
      setPhoneInput(user.phone || '');
    }
  }, [user]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      showToast(roleInput === 'farmer' ? 'Please enter your name.' : 'Please enter your business name.', 'error');
      return;
    }
    if (!phoneInput.trim()) {
      showToast('Please enter your phone number.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await loginUser(phoneInput.trim(), roleInput, nameInput.trim());
      showToast(`Welcome, ${nameInput.trim()}! Signed in successfully as ${roleInput === 'farmer' ? 'Farmer' : 'Buyer'}.`, 'success');
    } catch (err) {
      showToast(err.message || 'Authentication failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = () => {
    logout();
    setNameInput('');
    setPhoneInput('');
    setRoleInput('farmer');
    showToast('Signed out successfully.', 'info');
  };

  return (
    <div className="profile-page" style={{ maxWidth: '680px', margin: '0 auto' }}>
      {/* Brand / Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', background: 'white', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <img
          src="/assets/uzhavan-go-logo.png"
          alt="UzhavanGo Logo"
          style={{ width: '56px', height: '56px', objectFit: 'contain', borderRadius: '10px', background: '#f0fdf4', padding: '4px', border: '1px solid #bbf7d0', flexShrink: 0 }}
        />
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1f2937', margin: 0 }}>
            {user ? 'My Profile & Account' : 'Account Sign In'}
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '0.2rem', margin: 0 }}>
            {user ? `Signed in as ${user.name} (${user.role})` : 'Enter your details to sign in or register as a Farmer or Buyer.'}
          </p>
        </div>
      </div>

      {/* Active User Card (if logged in) */}
      {user && (
        <div className="card" style={{ marginBottom: '1.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: user.role === 'farmer' ? '#1b5e20' : '#1565c0',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.3rem',
                fontWeight: 700
              }}>
                {user.role === 'farmer' ? '👨‍🌾' : '🧑‍💼'}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1f2937', margin: 0 }}>
                    {user.name}
                  </h3>
                  <span className={`role-badge ${user.role}`}>
                    {user.role}
                  </span>
                </div>
                <p style={{ color: '#4b5563', fontSize: '0.85rem', margin: '0.25rem 0 0 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone size={14} color="#15803d" />
                  <span>{user.phone}</span>
                  {user.location && (
                    <>
                      <span>•</span>
                      <MapPin size={14} color="#15803d" />
                      <span>{user.location}</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <button
              className="btn btn-outline"
              style={{ color: '#dc2626', borderColor: '#fca5a5', background: 'white' }}
              onClick={handleSignOut}
            >
              <LogOut size={15} /> Sign Out / Switch User
            </button>
          </div>
        </div>
      )}

      {/* Sign-In / Account Form */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem', color: '#1f2937' }}>
          {user ? 'Update Profile Details' : 'Sign In / Register'}
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1.25rem' }}>
          {user ? 'Modify your account name or switch roles below:' : 'Select your account role and enter your details to get started.'}
        </p>

        <form onSubmit={handleSignIn}>
          {/* Role Selection */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
              Select Account Role
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                className={`btn ${roleInput === 'farmer' ? 'btn-primary' : 'btn-outline'}`}
                style={{
                  background: roleInput === 'farmer' ? '#1b5e20' : 'white',
                  borderColor: roleInput === 'farmer' ? '#1b5e20' : '#e5e7eb',
                  color: roleInput === 'farmer' ? 'white' : '#374151',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem'
                }}
                onClick={() => setRoleInput('farmer')}
              >
                <span>👨‍🌾</span>
                <strong>Farmer (Seller)</strong>
              </button>

              <button
                type="button"
                className={`btn ${roleInput === 'buyer' ? 'btn-primary' : 'btn-outline'}`}
                style={{
                  background: roleInput === 'buyer' ? '#1565c0' : 'white',
                  borderColor: roleInput === 'buyer' ? '#1565c0' : '#e5e7eb',
                  color: roleInput === 'buyer' ? 'white' : '#374151',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem'
                }}
                onClick={() => setRoleInput('buyer')}
              >
                <span>🧑‍💼</span>
                <strong>Buyer (Bidder)</strong>
              </button>
            </div>
          </div>

          {/* Name Field */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label" style={{ fontWeight: 600 }}>
              {roleInput === 'farmer' ? 'Farmer Name' : 'Business / Buyer Name'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                className="form-input"
                placeholder={roleInput === 'farmer' ? 'Enter your name' : 'Enter your business name'}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            </div>
          </div>

          {/* Phone Number Field */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ fontWeight: 600 }}>
              Phone Number
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="tel"
                required
                className="form-input"
                placeholder="Enter your phone number"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', marginTop: '0.5rem' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : user ? (
              <>
                <UserCheck size={18} /> Update &amp; Save Profile
              </>
            ) : (
              <>
                <LogIn size={18} /> Sign In / Continue
              </>
            )}
          </button>
        </form>
      </div>

      {/* Admin Portal Gateway */}
      <div className="card" style={{ border: '1px solid #e1bee7', background: '#faf5ff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h4 style={{ fontWeight: 800, color: '#6b21a8', margin: '0 0 0.2rem 0' }}>Platform Administrator Portal</h4>
            <p style={{ fontSize: '0.8rem', color: '#7e22ce', margin: 0 }}>Secure moderation, platform metrics, and audit logs.</p>
          </div>
          <button
            className="btn btn-primary"
            style={{ background: '#7b1fa2', borderColor: '#7b1fa2' }}
            onClick={() => setActivePage('admin')}
          >
            <ShieldCheck size={16} /> Open Admin
          </button>
        </div>
      </div>
    </div>
  );
}
