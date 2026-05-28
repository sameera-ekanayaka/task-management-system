import React, { useState, useEffect } from 'react';
import { getNotifications, markAllAsRead } from '../services/api';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { user, token } = useAuth();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchNotifications();
    const socket = io(process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000');
    socket.emit('register', user?.id);
    socket.on('notification', (data) => {
      setUnreadCount(prev => prev + 1);
      setNotifications(prev => [
        { id: Date.now(), message: data.message, isRead: false, createdAt: new Date() },
        ...prev
      ]);
    });
    return () => socket.disconnect();
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications();
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark as read');
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={styles.bellBtn}
      >
        🔔
        {unreadCount > 0 && (
          <span style={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            style={styles.backdrop}
            onClick={() => setIsOpen(false)}
          />
          <div style={styles.dropdown}>
            {/* Header */}
            <div style={styles.dropdownHeader}>
              <div>
                <h3 style={styles.dropdownTitle}>Notifications</h3>
                {unreadCount > 0 && (
                  <p style={styles.unreadLabel}>{unreadCount} unread</p>
                )}
              </div>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} style={styles.markAllBtn}>
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div style={styles.notifList}>
              {notifications.length === 0 ? (
                <div style={styles.emptyState}>
                  <p style={{ fontSize: '32px' }}>🔕</p>
                  <p style={{ color: '#9ca3af', fontSize: '14px' }}>No notifications</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} style={{
                    ...styles.notifItem,
                    background: n.isRead ? 'white' : '#f3e8ff',
                    borderLeft: n.isRead ? '3px solid transparent' : '3px solid #7c3aed',
                  }}>
                    <div style={styles.notifIcon}>
                      {n.message.includes('URGENT') ? '⚠️' :
                       n.message.includes('assigned') ? '📋' : '📅'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={styles.notifMessage}>{n.message}</p>
                      <p style={styles.notifTime}>
                        {new Date(n.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {!n.isRead && <div style={styles.unreadDot} />}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  bellBtn: {
    position: 'relative',
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  badge: {
    position: 'absolute',
    top: '-6px',
    right: '-6px',
    background: '#dc2626',
    color: 'white',
    borderRadius: '10px',
    minWidth: '18px',
    height: '18px',
    fontSize: '10px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
    border: '2px solid white',
  },
  backdrop: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 999,
  },
  dropdown: {
    position: 'absolute',
    right: 0,
    top: '52px',
    width: '360px',
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    zIndex: 1000,
    overflow: 'hidden',
    border: '1px solid #f3f4f6',
  },
  dropdownHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #f3f4f6',
  },
  dropdownTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a1035',
    margin: 0,
  },
  unreadLabel: {
    fontSize: '12px',
    color: '#7c3aed',
    margin: '2px 0 0',
    fontWeight: '600',
  },
  markAllBtn: {
    background: '#f3e8ff',
    color: '#7c3aed',
    border: 'none',
    borderRadius: '8px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  notifList: {
    maxHeight: '380px',
    overflowY: 'auto',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  notifItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '14px 20px',
    borderBottom: '1px solid #f9fafb',
    transition: 'background 0.15s',
  },
  notifIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: '#f3e8ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    flexShrink: 0,
  },
  notifMessage: {
    fontSize: '13px',
    color: '#1a1035',
    margin: '0 0 4px',
    lineHeight: '1.4',
    fontWeight: '500',
  },
  notifTime: {
    fontSize: '11px',
    color: '#9ca3af',
    margin: 0,
  },
  unreadDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#7c3aed',
    flexShrink: 0,
    marginTop: '4px',
  },
};

export default NotificationBell;