import React, { useState } from 'react';
import { Mail, CheckCircle2, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import './NewsletterSection.css';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const cleanEmail = email.trim().substring(0, 100);

    if (!cleanEmail) {
      setErrorMsg('Please enter your email address.');
      setLoading(false);
      return;
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      setErrorMsg('Please enter a valid email address (e.g., alex@company.com).');
      setLoading(false);
      return;
    }

    try {
      let API_URL = import.meta.env.VITE_AUTH_API_URL;
      if (!API_URL) {
        const isLocal = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
        API_URL = isLocal ? 'http://localhost:5050' : '';
      }
      if (!API_URL) {
        throw new Error('Newsletter service is not configured. Please contact support.');
      }

      const response = await fetch(`${API_URL}/api/v1/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubscribed(true);
      } else {
        throw new Error(data.error || 'Failed to subscribe');
      }
    } catch (err) {
      console.error('Subscription Error:', err);
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="newsletter-section">
      <div className="container">
        <div className="glass-card newsletter-card">
          <div className="newsletter-badge">
            <span className="badge badge-cyan">
              <Sparkles size={11} />
              STAY UPDATED
            </span>
          </div>

          <h2 className="newsletter-title">Engineering Insights. Zero Noise.</h2>
          <p className="newsletter-subtitle">
            Weekly engineering deep dives, architecture insights, product updates, and developer resources—straight to your inbox.
          </p>

          {subscribed ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'var(--green)', fontSize: '16px', fontWeight: 600, fontFamily: 'var(--font-display)' }}>
              <CheckCircle2 size={20} />
              <span>✓ You're in! We'll send you our next engineering deep dive.</span>
            </div>
          ) : (
            <form className="newsletter-form" onSubmit={handleSubmit} noValidate>
              <input
                type="email"
                className="glass-input newsletter-input"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                maxLength={100}
                required
              />
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'SUBSCRIBING...' : 'Subscribe'}
                {!loading && <ArrowRight size={15} />}
              </button>
            </form>
          )}

          {errorMsg && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--red)', fontSize: '12px', marginTop: '12px' }}>
              <AlertCircle size={14} />
              <span>{errorMsg}</span>
            </div>
          )}

          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '12px', opacity: 0.6 }}>
            Weekly • No spam • Unsubscribe anytime
          </p>
        </div>
      </div>
    </section>
  );
}
