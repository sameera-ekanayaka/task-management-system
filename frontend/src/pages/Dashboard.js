import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div style={{ padding: '40px' }}>
      <h1>Welcome, {user?.name}! 👋</h1>
      <p>Role: {user?.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Dashboard;