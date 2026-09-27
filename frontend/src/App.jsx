import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Toast } from './components/Toast';
import { HomePage } from './pages/HomePage';
import { MarketPage } from './pages/MarketPage';
import { OrdersPage } from './pages/OrdersPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPortal } from './pages/AdminPortal';

function MainApp() {
  const [activePage, setActivePage] = useState('home');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  return (
    <div className="app-container">
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      <main className="main-content">
        {activePage === 'home' && (
          <HomePage
            setActivePage={setActivePage}
            onOpenPostModal={() => setActivePage('market')}
          />
        )}
        {activePage === 'market' && <MarketPage showToast={showToast} setActivePage={setActivePage} />}
        {activePage === 'orders' && <OrdersPage showToast={showToast} setActivePage={setActivePage} />}
        {activePage === 'profile' && (
          <ProfilePage showToast={showToast} setActivePage={setActivePage} />
        )}
        {activePage === 'admin' && <AdminPortal showToast={showToast} />}
      </main>

      {/* Official Footer with Logo */}
      <footer className="app-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <img
              src="/assets/uzhavan-go-logo.png"
              alt="UzhavanGo Logo"
              className="footer-logo-img"
            />
            <div>
              <div className="footer-brand-title">UZHAVANGO</div>
              <p className="footer-brand-tagline">Direct from Farm to Table &bull; Transparent Bidding &bull; Fair Prices</p>
            </div>
          </div>
          <div className="footer-links">
            <button onClick={() => setActivePage('home')}>Home</button>
            <button onClick={() => setActivePage('market')}>Marketplace</button>
            <button onClick={() => setActivePage('orders')}>Orders</button>
            <button onClick={() => setActivePage('profile')}>Profile</button>
            <button onClick={() => setActivePage('admin')}>Admin Portal</button>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} UzhavanGo. Empowering Farmers &amp; Direct Buyers across Tamil Nadu.
        </div>
      </footer>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
