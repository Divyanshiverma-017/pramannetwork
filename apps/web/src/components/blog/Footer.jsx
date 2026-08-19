import React from 'react';
import { Twitter, Linkedin, Github } from 'lucide-react';
import './Footer.css';

export function Footer() {
  return (
    <footer className="footer-container">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Col */}
          <div className="footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src="/logo.png"
                alt="Praman Network Logo"
                width="108"
                height="36"
                loading="lazy"
                decoding="async"
                className="navbar-logo-img"
              />
            </div>

            <p className="footer-tagline">
              Replacing trust with proof. Zero-knowledge biometric identity and Sybil resistance infrastructure for Web3 applications.
            </p>

            <div className="footer-socials">
              <a href="https://twitter.com/ChaudharyjiTec4" target="_blank" rel="noopener noreferrer" className="btn-icon">
                <Twitter size={16} />
              </a>
              <a href="https://linkedin.com/in/rahul-chaudhary-b31b2a297" target="_blank" rel="noopener noreferrer" className="btn-icon">
                <Linkedin size={16} />
              </a>
              <a href="https://github.com/Rahulchaudharyji2" target="_blank" rel="noopener noreferrer" className="btn-icon">
                <Github size={16} />
              </a>
            </div>
          </div>

          {/* Col 2: Developers */}
          <div className="footer-column">
            <h4 className="footer-title">Developers</h4>
            <div className="footer-links">
              <a href="https://docs.praman.network" target="_blank" rel="noopener noreferrer" className="footer-link">Documentation</a>
              <a href="https://github.com/Praman-Network" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub Organization</a>
              <a href="https://www.praman.network/dashboard" className="footer-link">Console & API Keys</a>
              <a href="https://docs.praman.network/circuits" target="_blank" rel="noopener noreferrer" className="footer-link">Circom Circuit Specs</a>
            </div>
          </div>

          {/* Col 3: Ecosystem */}
          <div className="footer-column">
            <h4 className="footer-title">Ecosystem</h4>
            <div className="footer-links">
              <a href="https://www.praman.network/#protocol" className="footer-link">PramanAuth Engine</a>
              <a href="https://explorer.praman.network" target="_blank" rel="noopener noreferrer" className="footer-link">Rollup Explorer</a>
              <a href="https://www.praman.network/talent" className="footer-link">Praman Talent</a>
              <a href="https://www.praman.network/contact" className="footer-link">Support & Relations</a>
            </div>
          </div>

          {/* Col 4: Legal */}
          <div className="footer-column">
            <h4 className="footer-title">Legal & Security</h4>
            <div className="footer-links">
              <a href="https://www.praman.network/privacy" className="footer-link">Privacy Policy</a>
              <a href="https://www.praman.network/terms" className="footer-link">Terms of Service</a>
              <a href="https://docs.praman.network/audits" target="_blank" rel="noopener noreferrer" className="footer-link">Security Audits</a>
              <span className="footer-link" style={{ color: 'var(--text-muted)' }}>GPL-3.0 License</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <span>© 2026 Praman Network. All rights reserved.</span>

          <div className="network-status">
            <span className="status-dot"></span>
            <span>praman-mainnet operational (v1.4.2)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
