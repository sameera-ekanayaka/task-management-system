import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, login, token } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters!');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ newPassword });
      const updatedUser = { ...user, mustResetPassword: false };
      login(updatedUser, token);
      toast.success('Password reset successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const getStrength = () => {
    if (newPassword.length === 0) return null;
    if (newPassword.length < 8) return { label: '⚠️ Too short', color: '#dc2626', width: '25%' };
    if (newPassword.length < 12) return { label: '👍 Good', color: '#f59e0b', width: '60%' };
    return { label: '💪 Strong', color: '#10b981', width: '100%' };
  };

  const strength = getStrength();

  return (
    <div style={styles.container}>
      {/* Left Panel */}
      <div style={styles.leftPanel}>
        <div style={styles.logoSection}>
          <div style={styles.logoIcon}>✓</div>
          <h1 style={styles.brandName}>TaskManager</h1>
        </div>
        <div style={styles.infoCard}>
          <h2 style={styles.infoTitle}>🔐 Security First</h2>
          <p style={styles.infoText}>
            For your security, please set a new password before accessing the system.
          </p>
          <div style={styles.tipsList}>
            {[
              'Use at least 8 characters',
              'Mix letters and numbers',
              'Add special characters',
              'Avoid common passwords',
            ].map((tip, i) => (
              <div key={i} style={styles.tipItem}>
                <span style={styles.tipIcon}>✅</span>
                <span style={styles.tipText}>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={styles.rightPanel}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.iconCircle}>🔑</div>
            <h2 style={styles.cardTitle}>Reset Password</h2>
            <p style={styles.cardSubtitle}>
              Welcome, <strong>{user?.name}</strong>! Set your new password.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-modern"
                placeholder="Min. 8 characters"
                required
              />
              {strength && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ background: '#f3f4f6', borderRadius: '4px', height: '6px', marginBottom: '4px' }}>
                    <div style={{ width: strength.width, background: strength.color, borderRadius: '4px', height: '6px', transition: 'all 0.3s' }} />
                  </div>
                  <p style={{ fontSize: '12px', color: strength.color, margin: 0 }}>{strength.label}</p>
                </div>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-modern"
                placeholder="Repeat your password"
                required
              />
              {confirmPassword && (
                <p style={{ fontSize: '12px', margin: '6px 0 0', color: newPassword === confirmPassword ? '#10b981' : '#dc2626' }}>
                  {newPassword === confirmPassword ? '✅ Passwords match!' : '❌ Passwords do not match'}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '15px', marginTop: '8px' }}
              disabled={loading}
            >
              {loading ? 'Resetting...' : '🔐 Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', minHeight: '100vh' },
  leftPanel: {
    flex: 1,
    background: 'linear-gradient(135deg, #1a1035 0%, #2d1b69 100%)',
    padding: '60px',
    display: 'flex',
    flexDirection: 'column',
  },
  logoSection: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' },
  logoIcon: {
    width: '40px', height: '40px', background: '#7c3aed',
    borderRadius: '10px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '20px', color: 'white', fontWeight: 'bold',
  },
  brandName: { color: 'white', fontSize: '22px', fontWeight: '700', margin: 0 },
  infoCard: {
    background: 'rgba(255,255,255,0.06)',
    borderRadius: '16px', padding: '28px',
  },
  infoTitle: { color: 'white', fontSize: '22px', fontWeight: '700', margin: '0 0 12px' },
  infoText: { color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: '1.6', margin: '0 0 24px' },
  tipsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  tipItem: { display: 'flex', alignItems: 'center', gap: '10px' },
  tipIcon: { fontSize: '16px' },
  tipText: { color: 'rgba(255,255,255,0.8)', fontSize: '14px' },
  rightPanel: {
    width: '480px',
    background: '#f5f6fa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },
  card: {
    background: 'white', borderRadius: '20px',
    padding: '40px', width: '100%',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
  cardHeader: { textAlign: 'center', marginBottom: '32px' },
  iconCircle: {
    width: '64px', height: '64px', background: '#f3e8ff',
    borderRadius: '16px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '28px', margin: '0 auto 16px',
  },
  cardTitle: { fontSize: '26px', fontWeight: '700', color: '#1a1035', margin: '0 0 8px' },
  cardSubtitle: { color: '#6b7280', fontSize: '15px', margin: 0 },
  formGroup: { marginBottom: '20px' },
  label: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#374151' },
};

export default ResetPassword;