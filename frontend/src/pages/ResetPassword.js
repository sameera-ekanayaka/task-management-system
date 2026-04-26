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

    // Validation
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
      
      // Update user in context
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

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <span style={styles.icon}>🔐</span>
          <h1 style={styles.title}>Reset Your Password</h1>
          <p style={styles.subtitle}>
            Welcome <strong>{user?.name}</strong>! For security, 
            please set a new password before continuing.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={styles.input}
              placeholder="Enter new password (min 8 characters)"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={styles.input}
              placeholder="Confirm your new password"
              required
            />
          </div>

          {/* Password Match Indicator */}
          {confirmPassword && (
            <p style={{
              ...styles.matchIndicator,
              color: newPassword === confirmPassword ? '#16a34a' : '#dc2626'
            }}>
              {newPassword === confirmPassword 
                ? '✅ Passwords match!' 
                : '❌ Passwords do not match'}
            </p>
          )}

          {/* Password Strength */}
          {newPassword && (
            <div style={styles.strengthContainer}>
              <p style={styles.strengthLabel}>Password strength:</p>
              <div style={styles.strengthBar}>
                <div style={{
                  ...styles.strengthFill,
                  width: newPassword.length >= 12 ? '100%' 
                       : newPassword.length >= 8 ? '60%' 
                       : '30%',
                  backgroundColor: newPassword.length >= 12 ? '#16a34a' 
                                 : newPassword.length >= 8 ? '#f59e0b' 
                                 : '#dc2626'
                }} />
              </div>
              <p style={styles.strengthText}>
                {newPassword.length >= 12 ? '💪 Strong' 
               : newPassword.length >= 8 ? '👍 Good' 
               : '⚠️ Too short'}
              </p>
            </div>
          )}

          <button
            type="submit"
            style={loading ? styles.buttonDisabled : styles.button}
            disabled={loading}
          >
            {loading ? 'Resetting...' : '🔐 Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f2f5',
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '440px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  icon: {
    fontSize: '48px',
  },
  title: {
    margin: '12px 0 8px 0',
    fontSize: '24px',
    color: '#1a1a2e',
  },
  subtitle: {
    color: '#666',
    fontSize: '14px',
    lineHeight: '1.5',
    margin: 0,
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#333',
    fontWeight: '500',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
  },
  matchIndicator: {
    fontSize: '13px',
    margin: '-10px 0 16px 0',
  },
  strengthContainer: {
    marginBottom: '20px',
  },
  strengthLabel: {
    fontSize: '13px',
    color: '#666',
    margin: '0 0 6px 0',
  },
  strengthBar: {
    height: '6px',
    backgroundColor: '#f0f0f0',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '4px',
  },
  strengthFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'all 0.3s ease',
  },
  strengthText: {
    fontSize: '12px',
    color: '#666',
    margin: 0,
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#1a73e8',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '8px',
    fontWeight: '600',
  },
  buttonDisabled: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#93b8f5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'not-allowed',
    marginTop: '8px',
    fontWeight: '600',
  },
};

export default ResetPassword;