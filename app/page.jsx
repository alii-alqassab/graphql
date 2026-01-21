'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { handleLogin } from './login';
import { sanitizeTokenString } from './token-utils';

export default function LoginPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const jwt = sanitizeTokenString(localStorage.getItem('jwt'));
    const isLikelyJwt =
      jwt && jwt.length >= 20 && jwt.split('.').length === 3;

    if (isLikelyJwt) {
      router.replace('/profile');
      return;
    }

    setCheckingSession(false);
  }, [router]);

  const onSubmit = (event) =>
    handleLogin({
      event,
      identifier,
      password,
      router,
      setError,
      setLoading,
    });

  if (checkingSession) {
    return null;
  }

  return (
    <main className="f1-login-page">
      <div className="carbon-fiber-texture" />

      <div className="checkered-flag-pattern">
        <div className="checkered-grid">
          {Array.from({ length: 36 }).map((_, i) => {
            const row = Math.floor(i / 6);
            const col = i % 6;
            const isBlack = (row + col) % 2 === 0;
            return (
              <div
                key={i}
                className={isBlack ? 'checkered-black' : 'checkered-white'}
              />
            );
          })}
        </div>
      </div>

      <div className="speed-lines">
        <div className="speed-line speed-line-top" />
        <div className="speed-line speed-line-bottom" />
      </div>

      <div className="gradient-overlay" />

      <div className="login-container">
        <div className="racing-stripe-top">
          <div className="stripe-left" />
          <div className="stripe-center" />
          <div className="stripe-right" />
        </div>
        
        <div className="login-card">
          <div className="corner-accent corner-top-left" />
          <div className="corner-accent corner-bottom-right" />
          
          <div className="login-content">
            <div className="header-section">
              <div className="title-stripes">
                <div className="title-stripe title-stripe-red" />
                <div className="title-stripe title-stripe-white" />
              </div>
              <h1 className="login-title">REBOOT01</h1>
            </div>
            <p className="login-subtitle">Driver Access Portal</p>

            <form onSubmit={onSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="identifier" className="form-label">
                  Username
                </label>
                <input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="f1-input"
                  placeholder="ENTER USERNAME"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="f1-input"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="error-alert">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="f1-button"
              >
                <span className="button-text">
                  {loading ? 'STARTING ENGINE...' : 'LIGHTS OUT'}
                </span>
                <div className="button-shine" />
              </button>
            </form>
          </div>

          <div className="card-bottom-stripe">
            <div className="bottom-stripe-left" />
            <div className="bottom-stripe-center" />
            <div className="bottom-stripe-right" />
          </div>
        </div>
          <div className="drift-car"></div>
        </div>
    </main>
  );
}
