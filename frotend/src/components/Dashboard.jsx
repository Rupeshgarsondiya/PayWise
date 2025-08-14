import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../Photos/logo.png';
import '../assets/css/Dashboard.css';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

async function authFetch(url, options = {}) {
  const accessToken = localStorage.getItem('access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  const doFetch = async () => fetch(url, { ...options, headers });

  let response = await doFetch();

  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return response;

    const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      const newAccess = data.access;
      if (newAccess) {
        localStorage.setItem('access_token', newAccess);
        const retryHeaders = {
          ...headers,
          Authorization: `Bearer ${newAccess}`,
        };
        response = await fetch(url, { ...options, headers: retryHeaders });
      }
    } else {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }

  return response;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [summary, setSummary] = useState({ total_expenses: 0, owed_amount: 0 });

  // Get user data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Load live summary and groups
  useEffect(() => {
    const loadData = async () => {
      try {
        const [summaryRes, groupsRes] = await Promise.all([
          authFetch(`${API_BASE_URL}/expenses/expenses/summary/`),
          authFetch(`${API_BASE_URL}/expenses/groups/`),
        ]);

        if (summaryRes.ok) {
          const s = await summaryRes.json();
          setSummary({
            total_expenses: s.total_expenses || 0,
            owed_amount: s.owed_amount || 0,
          });
        }

        if (groupsRes.ok) {
          const g = await groupsRes.json();
          setGroups(g || []);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to load dashboard data', e);
      }
    };

    if (user) loadData();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Food': '🍕',
      'Entertainment': '🎬',
      'Transport': '🚗',
      'Shopping': '🛍️',
      'Bills': '📄',
      'Other': '📝'
    };
    return icons[category] || '📝';
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard">
      {/* Left Sidebar Navigation */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <img src={logo} alt="PayWise Logo" />
            <span className="logo-text">PayWise</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <button className="nav-item active">
            <span className="nav-icon">📊</span>
            <span className="nav-text">Overview</span>
          </button>
          <button className="nav-item" onClick={() => navigate('/expenses')}>
            <span className="nav-icon">💰</span>
            <span className="nav-text">Expenses</span>
          </button>
          <button className="nav-item">
            <span className="nav-icon">👥</span>
            <span className="nav-text">Groups</span>
          </button>
          <button className="nav-item">
            <span className="nav-icon">💳</span>
            <span className="nav-text">Settlements</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="dashboard-main-container">
        {/* Top Header */}
        <header className="dashboard-header">
          <div className="header-content">
            <h1>Dashboard</h1>
            <div className="user-menu">
              <div className="user-avatar">
                <span>{user.first_name ? user.first_name.charAt(0) : user.email.charAt(0).toUpperCase()}</span>
              </div>
              <div className="user-info">
                <span className="user-name">{user.first_name || 'User'}</span>
                <span className="user-email">{user.email}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - Overview Only */}
        <main className="dashboard-main">
          <div className="overview-tab">
            <div className="overview-header">
              <h1>Welcome back! 👋</h1>
              <p>Here's what's happening with your expenses</p>
            </div>

            {/* Balance Cards */}
            <div className="balance-cards">
              <div className="balance-card positive">
                <div className="card-icon">💰</div>
                <div className="card-content">
                  <h3>You're owed</h3>
                  <p className="amount">{formatCurrency(Number(summary.owed_amount || 0))}</p>
                </div>
              </div>
              
              <div className="balance-card neutral">
                <div className="card-icon">📊</div>
                <div className="card-content">
                  <h3>Total Expenses</h3>
                  <p className="amount">{formatCurrency(Number(summary.total_expenses || 0))}</p>
                </div>
              </div>
              
              <div className="balance-card neutral">
                <div className="card-icon">👥</div>
                <div className="card-content">
                  <h3>Active Groups</h3>
                  <p className="amount">{groups.length}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
