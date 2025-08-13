import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../Photos/logo.png';
import '../assets/css/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [balance, setBalance] = useState(0);

  // Get user data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Mock data for demonstration
  useEffect(() => {
    setExpenses([
      {
        id: 1,
        description: 'Dinner at Restaurant',
        amount: 2500,
        paidBy: 'You',
        date: '2025-08-13',
        category: 'Food',
        group: 'Friends Trip'
      },
      {
        id: 2,
        description: 'Movie Tickets',
        amount: 800,
        paidBy: 'Rahul',
        date: '2025-08-12',
        category: 'Entertainment',
        group: 'Weekend Fun'
      },
      {
        id: 3,
        description: 'Grocery Shopping',
        amount: 1200,
        paidBy: 'You',
        date: '2025-08-11',
        category: 'Food',
        group: 'Roommates'
      }
    ]);

    setGroups([
      {
        id: 1,
        name: 'Friends Trip',
        members: ['You', 'Rahul', 'Priya', 'Amit'],
        totalExpenses: 4500,
        yourShare: 1125,
        youOwe: 0,
        owedToYou: 375
      },
      {
        id: 2,
        name: 'Weekend Fun',
        members: ['You', 'Rahul', 'Neha'],
        totalExpenses: 1200,
        yourShare: 400,
        youOwe: 0,
        owedToYou: 400
      },
      {
        id: 3,
        name: 'Roommates',
        members: ['You', 'Priya', 'Amit'],
        totalExpenses: 3600,
        yourShare: 1200,
        youOwe: 0,
        owedToYou: 0
      }
    ]);

    setBalance(775); // Net positive balance
  }, []);

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
          <button className="nav-item">
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
                  <p className="amount">{formatCurrency(balance)}</p>
                </div>
              </div>
              
              <div className="balance-card neutral">
                <div className="card-icon">📊</div>
                <div className="card-content">
                  <h3>Total Expenses</h3>
                  <p className="amount">{formatCurrency(expenses.reduce((sum, exp) => sum + exp.amount, 0))}</p>
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
