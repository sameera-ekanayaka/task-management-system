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

    // Connect to Socket.io
    const socket = io('http://localhost:5000');
    socket.emit('register', user?.id);

    // Listen for real-time notifications
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
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
    } catch (error) {
      console.error('Failed to mark as read');
    }
  };

  return (
    <div style={styles.container}>
      {/* Bell Button */}
      <button onClick={() => setIsOpen(!isOpen)} style={styles.bell}>
        🔔
        {unreadCount > 0 && (
          <span style={styles.badge}>{unreadCount}</span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div style={styles.dropdown}>
          <div style={styles.dropdownHeader}>
            <span style={styles.dropdownTitle}>Notifications</span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} style={styles.markAllBtn}>
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p style={styles.empty}>No notifications</p>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                style={n.isRead ? styles.notifItem : {
                  ...styles.notifItem,
                  ...styles.notifUnread
                }}
              >
                <p style={styles.notifMessage}>{n.message}</p>
                <span style={styles.notifTime}>
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { position: 'relative' },
  bell: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    backgroundColor: 'red',
    color: 'white',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    fontSize: '11px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdown: {
    position: 'absolute',
    right: 0,
    top: '40px',
    width: '320px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    zIndex: 1000,
    maxHeight: '400px',
    overflowY: 'auto',
  },
  dropdownHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderBottom: '1px solid #eee',
  },
  dropdownTitle: {
    fontWeight: '600',
    fontSize: '16px',
  },
  markAllBtn: {
    background: 'none',
    border: 'none',
    color: '#1a73e8',
    cursor: 'pointer',
    fontSize: '12px',
  },
  empty: {
    textAlign: 'center',
    color: '#666',
    padding: '20px',
  },
  notifItem: {
    padding: '12px 16px',
    borderBottom: '1px solid #f0f0f0',
  },
  notifUnread: {
    backgroundColor: '#f0f7ff',
  },
  notifMessage: {
    margin: '0 0 4px 0',
    fontSize: '14px',
    color: '#333',
  },
  notifTime: {
    fontSize: '12px',
    color: '#999',
  },
};

export default NotificationBell;