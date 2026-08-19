import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ExternalLink, Menu, X, ArrowUpRight } from 'lucide-react';
import './Navbar.css';

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isBlogActive = location.pathname === '/' || location.pathname.startsWith('/blog');

  return (
    <header className="glass-navbar">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <img
              src="/logo.png"
              alt="Praman Network Logo"
              width="144"
              height="48"
              decoding="async"
              className="navbar-logo-img"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="nav-links-desktop">
            <a href="https://www.praman.network/#protocol" className="nav-item">Protocol</a>
            <a href="https://www.praman.network/#verify-stack" className="nav-item">Verify Stack</a>
            <a href="https://www.praman.network/dashboard" className="nav-item">Developer API ⚙️</a>
            <a href="https://docs.praman.network" target="_blank" rel="noopener noreferrer" className="nav-item">
              Docs <ExternalLink size={12} />
            </a>
            <Link to="/" className={`nav-item ${isBlogActive ? 'active' : ''}`}>
              Blog
            </Link>
            <a href="https://www.praman.network/contact" className="nav-item">Contact</a>
          </nav>

          {/* Console CTA & Mobile Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <a href="https://www.praman.network/dashboard" className="btn-console">
              CONSOLE <ArrowUpRight size={14} />
            </a>

            <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="mobile-drawer">
          <div className="mobile-drawer-header">
            <Link to="/" className="navbar-logo" onClick={() => setMobileOpen(false)}>
              <img
                src="/logo.png"
                alt="Praman Network Logo"
                width="144"
                height="48"
                decoding="async"
                className="navbar-logo-img"
              />
            </Link>
            <button className="btn-icon" onClick={() => setMobileOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="mobile-nav-links">
            <a href="https://www.praman.network/#protocol" className="mobile-nav-item">Protocol</a>
            <a href="https://www.praman.network/#verify-stack" className="mobile-nav-item">Verify Stack</a>
            <a href="https://www.praman.network/dashboard" className="mobile-nav-item">Developer API</a>
            <a href="https://docs.praman.network" target="_blank" rel="noopener noreferrer" className="mobile-nav-item">Docs ↗</a>
            <Link to="/" className="mobile-nav-item active" onClick={() => setMobileOpen(false)}>Blog</Link>
            <a href="https://www.praman.network/contact" className="mobile-nav-item">Contact</a>
          </div>
        </div>
      )}
    </header>
  );
}
