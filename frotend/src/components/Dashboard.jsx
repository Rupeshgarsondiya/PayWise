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
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [summary, setSummary] = useState({ 
    total_expenses: 0, 
    month_expenses: 0,
    total_count: 0,
    owed_amount: 0,
    category_breakdown: []
  });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Get user data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Load all dashboard data
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        const [summaryRes, groupsRes, expensesRes] = await Promise.all([
          authFetch(`${API_BASE_URL}/expenses/expenses/summary/`),
          authFetch(`${API_BASE_URL}/expenses/groups/`),
          authFetch(`${API_BASE_URL}/expenses/expenses/?limit=5`)
        ]);

        if (summaryRes.ok) {
          const s = await summaryRes.json();
          setSummary({
            total_expenses: s.total_expenses || 0,
            month_expenses: s.month_expenses || 0,
            total_count: s.total_count || 0,
            owed_amount: s.owed_amount || 0,
            category_breakdown: s.category_breakdown || []
          });
        }

        if (groupsRes.ok) {
          const g = await groupsRes.json();
          setGroups(g.results || g || []);
        }

        if (expensesRes.ok) {
          const e = await expensesRes.json();
          setRecentExpenses(e.results || e.slice(0, 5) || []);
        }
      } catch (e) {
        console.error('Failed to load dashboard data', e);
      } finally {
        setLoading(false);
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
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return '🌅 Good Morning';
    if (hour < 17) return '☀️ Good Afternoon';
    return '🌙 Good Evening';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Food': '🍽️',
      'Entertainment': '🎬',
      'Transport': '🚗',
      'Shopping': '🛍️',
      'Bills': '📄',
      'Healthcare': '🏥',
      'Education': '📚',
      'Travel': '✈️',
      'Home': '🏠',
      'Other': '📝'
    };
    return icons[category] || '📝';
  };

  if (!user || loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">⏳</div>
        <h2>Loading Your Financial Overview...</h2>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Premium Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <img src={logo} alt="PayWise Logo" className="logo-img" />
            <h2 className="logo-text">PayWise</h2>
          </div>
          <div className="user-profile">
            <div className="user-avatar-large">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-details">
              <h4>{user.name || 'User'}</h4>
              <p>{user.email || 'user@paywise.com'}</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h5 className="nav-section-title">MAIN</h5>
            <button className="nav-item active">
              <span className="nav-icon">📊</span>
              <span className="nav-text">Overview</span>
              <span className="nav-indicator"></span>
            </button>
            <button className="nav-item" onClick={() => navigate('/expenses')}>
              <span className="nav-icon">💰</span>
              <span className="nav-text">Expenses</span>
            </button>
            <button className="nav-item" onClick={() => navigate('/groups')}>
              <span className="nav-icon">👥</span>
              <span className="nav-text">Groups</span>
            </button>
            <button className="nav-item" onClick={() => navigate('/reports')}>
              <span className="nav-icon">📈</span>
              <span className="nav-text">Reports</span>
            </button>
          </div>

          <div className="nav-section">
            <h5 className="nav-section-title">QUICK ACTIONS</h5>
            <button className="nav-item quick-action" onClick={() => navigate('/expenses')}>
              <span className="nav-icon">➕</span>
              <span className="nav-text">Add Expense</span>
            </button>
            <button className="nav-item quick-action">
              <span className="nav-icon">📤</span>
              <span className="nav-text">Split Bill</span>
            </button>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout-item" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            <span className="nav-text">Logout</span>
          </button>
          <div className="version-info">
            <p>PayWise v2.1.0</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main-container">
        {/* Premium Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <div className="greeting-section">
              <h1>{getGreeting()}, {user.name || 'User'}!</h1>
              <p className="header-subtitle">Here's your financial overview for today</p>
              <div className="current-time">
                {currentTime.toLocaleDateString('en-IN', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
          
          <div className="header-right">
            <button className="quick-add-btn" onClick={() => navigate('/expenses')}>
              <span className="btn-icon">➕</span>
              <span className="btn-text">Add Expense</span>
            </button>
            <div className="notification-bell">
              <span className="bell-icon">🔔</span>
              <span className="notification-badge">3</span>
            </div>
          </div>
        </header>

        {/* Premium Content */}
        <div className="dashboard-content">
          {/* Hero Stats Section */}
          <section className="hero-stats">
            <div className="stat-card primary">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>Total Expenses</h3>
                <p className="stat-amount">{formatCurrency(summary.total_expenses)}</p>
                <span className="stat-label">All time spending</span>
              </div>
              <div className="stat-trend up">↗ 12%</div>
            </div>

            <div className="stat-card success">
              <div className="stat-icon">🤝</div>
              <div className="stat-content">
                <h3>You're Owed</h3>
                <p className="stat-amount">{formatCurrency(summary.owed_amount)}</p>
                <span className="stat-label">From group expenses</span>
              </div>
              <div className="stat-trend neutral">—</div>
            </div>

            <div className="stat-card info">
              <div className="stat-icon">📅</div>
              <div className="stat-content">
                <h3>This Month</h3>
                <p className="stat-amount">{formatCurrency(summary.month_expenses)}</p>
                <span className="stat-label">Current month spending</span>
              </div>
              <div className="stat-trend down">↘ 8%</div>
            </div>

            <div className="stat-card warning">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>Active Groups</h3>
                <p className="stat-count">{groups.length}</p>
                <span className="stat-label">Shared expense groups</span>
              </div>
              <div className="stat-trend up">↗ 2</div>
            </div>
          </section>

          {/* Dashboard Sections Grid */}
          <div className="dashboard-grid">
            {/* Spending Breakdown */}
            <section className="dashboard-card spending-breakdown">
              <div className="card-header">
                <h2>💡 Spending Breakdown</h2>
                <button className="view-all-btn" onClick={() => navigate('/reports')}>
                  View Details →
                </button>
              </div>
              <div className="breakdown-content">
                {summary.category_breakdown && summary.category_breakdown.length > 0 ? (
                  summary.category_breakdown.slice(0, 5).map((category, index) => {
                    const percentage = summary.total_expenses > 0 
                      ? ((category.total / summary.total_expenses) * 100).toFixed(1) 
                      : 0;
                    
                    return (
                      <div key={index} className="category-breakdown-item">
                        <div className="category-info">
                          <span className="category-icon">
                            {getCategoryIcon(category.category__name)}
                          </span>
                          <div className="category-details">
                            <h4>{category.category__name || 'Other'}</h4>
                            <p>{category.count} expenses</p>
                          </div>
                        </div>
                        <div className="category-stats">
                          <div className="category-amount">{formatCurrency(category.total)}</div>
                          <div className="category-progress">
                            <div className="progress-bar">
                              <div 
                                className="progress-fill" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="percentage">{percentage}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="empty-breakdown">
                    <div className="empty-icon">📊</div>
                    <h3>No spending data yet</h3>
                    <p>Add some expenses to see your spending breakdown</p>
                    <button className="add-expense-link" onClick={() => navigate('/expenses')}>
                      Add First Expense
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Recent Activity */}
            <section className="dashboard-card recent-activity">
              <div className="card-header">
                <h2>📋 Recent Activity</h2>
                <button className="view-all-btn" onClick={() => navigate('/expenses')}>
                  View All →
                </button>
              </div>
              <div className="activity-content">
                {recentExpenses.length > 0 ? (
                  recentExpenses.map((expense) => (
                    <div key={expense.id} className="activity-item">
                      <div className="activity-icon">
                        {expense.category?.icon || getCategoryIcon(expense.ai_detected_category) || '📝'}
                      </div>
                      <div className="activity-details">
                        <h4>{expense.description}</h4>
                        <p>
                          {expense.date} • {expense.category?.name || expense.ai_detected_category || 'Other'}
                          {expense.group && ` • ${expense.group.name}`}
                        </p>
                      </div>
                      <div className="activity-amount">
                        {formatCurrency(expense.amount)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-activity">
                    <div className="empty-icon">📝</div>
                    <h3>No recent activity</h3>
                    <p>Your recent expenses will appear here</p>
                    <button className="add-expense-link" onClick={() => navigate('/expenses')}>
                      Add Expense
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Quick Actions Panel */}
            <section className="dashboard-card quick-actions">
              <div className="card-header">
                <h2>⚡ Quick Actions</h2>
              </div>
              <div className="actions-grid">
                <button 
                  className="action-card primary"
                  onClick={() => navigate('/expenses')}
                >
                  <div className="action-icon">➕</div>
                  <div className="action-content">
                    <h3>Add Expense</h3>
                    <p>Record a new expense</p>
                  </div>
                </button>

                <button 
                  className="action-card secondary"
                  onClick={() => navigate('/groups')}
                >
                  <div className="action-icon">👥</div>
                  <div className="action-content">
                    <h3>Create Group</h3>
                    <p>Start splitting expenses</p>
                  </div>
                </button>

                <button 
                  className="action-card tertiary"
                  onClick={() => navigate('/reports')}
                >
                  <div className="action-icon">📈</div>
                  <div className="action-content">
                    <h3>View Reports</h3>
                    <p>Analyze your spending</p>
                  </div>
                </button>

                <button className="action-card quaternary">
                  <div className="action-icon">📷</div>
                  <div className="action-content">
                    <h3>Scan Receipt</h3>
                    <p>Auto-extract expenses</p>
                  </div>
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
