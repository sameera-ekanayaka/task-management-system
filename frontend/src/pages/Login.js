import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginAPI } from '../services/api';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await loginAPI({ email, password });
      const { token, user } = response.data;
      login(user, token);
      toast.success('Welcome back!');
      if (user.mustResetPassword) {
        navigate('/reset-password');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Left Panel */}
      <div style={styles.leftPanel}>
        <div style={styles.brandSection}>
          <div style={styles.logoIcon}>✓</div>
          <h1 style={styles.brandName}>TaskManager</h1>
          <p style={styles.brandTagline}>
            Manage your tasks efficiently and collaborate with your team seamlessly.
          </p>
        </div>
        <div style={styles.featuresSection}>
          {[
            { icon: '📋', text: 'Kanban Task Board' },
            { icon: '🔔', text: 'Real-time Notifications' },
            { icon: '👥', text: 'Team Collaboration' },
            { icon: '📊', text: 'Progress Tracking' },
          ].map((f, i) => (
            <div key={i} style={styles.featureItem}>
              <span style={styles.featureIcon}>{f.icon}</span>
              <span style={styles.featureText}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div style={styles.rightPanel}>
        <div style={styles.loginCard}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Welcome back</h2>
            <p style={styles.cardSubtitle}>Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-modern"
                placeholder="Enter your email"
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-modern"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '15px', marginTop: '8px' }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div style={styles.footer}>
              <p style={styles.footerText}>
                  Don't have an account? Contact your administrator.
                </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
  },
  leftPanel: {
    flex: 1,
    background: 'linear-gradient(135deg, #1a1035 0%, #2d1b69 50%, #1a1035 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '60px',
  },
  brandSection: {
    marginBottom: '48px',
  },
  logoIcon: {
    width: '48px',
    height: '48px',
    background: '#7c3aed',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    color: 'white',
    marginBottom: '20px',
    fontWeight: 'bold',
  },
  brandName: {
    color: 'white',
    fontSize: '36px',
    fontWeight: '700',
    marginBottom: '12px',
  },
  brandTagline: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '16px',
    lineHeight: '1.6',
    maxWidth: '360px',
  },
  featuresSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  featureIcon: {
    width: '36px',
    height: '36px',
    background: 'rgba(124,58,237,0.2)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
  },
  featureText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '15px',
  },
  rightPanel: {
    width: '480px',
    background: '#f5f6fa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },
  loginCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '40px',
    width: '100%',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
  cardHeader: {
    marginBottom: '32px',
  },
  cardTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1035',
    marginBottom: '8px',
  },
  cardSubtitle: {
    color: '#6b7280',
    fontSize: '15px',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  passwordWrapper: {
    position: 'relative',
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
  },
  footerText: {
    color: '#9ca3af',
    fontSize: '12px',
  },
};

export default Login;