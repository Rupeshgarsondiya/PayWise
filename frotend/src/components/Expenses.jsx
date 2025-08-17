import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../Photos/logo.png';
import '../assets/css/Dashboard.css'; // Use Dashboard.css for consistent styling

const API_BASE_URL = 'http://127.0.0.1:8000/api/expenses';

const Expenses = () => {
  const navigate = useNavigate();
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState({
    total_expenses: 0,
    month_expenses: 0,
    total_count: 0,
    owed_amount: 0
  });

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category_id: '',
    group_id: '',
    payment_method: '',
    notes: '',
    receipt_image: null
  });

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    fetchExpenses();
    fetchCategories();
    fetchGroups();
    fetchSummary();
  }, []);

  // Navigation handlers
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Your existing functions remain the same...
  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/expenses/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setExpenses(data.results || data);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/categories/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data.results || data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/groups/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setGroups(data.results || data);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/expenses/summary/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'receipt_image') {
      const selectedFile = files?.[0];
      if (selectedFile) {
        if (!selectedFile.type) {
          alert('Invalid file format. Please select a valid image file.');
          e.target.value = '';
          return;
        }
        if (!selectedFile.type.startsWith('image/')) {
          alert('Please select a valid image file (JPG, PNG, WEBP, etc.)');
          e.target.value = '';
          return;
        }
        if (selectedFile.size > 10 * 1024 * 1024) {
          alert('File size too large. Please select an image under 10MB.');
          e.target.value = '';
          return;
        }
        setFormData(prev => ({ ...prev, [name]: selectedFile }));
        handleAutomaticOCRScan(selectedFile);
      } else {
        setFormData(prev => ({ ...prev, [name]: null }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAutomaticOCRScan = async (file) => {
    if (!file || !file.type || !file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) {
      return;
    }

    setOcrLoading(true);
    try {
      const formDataOCR = new FormData();
      formDataOCR.append('receipt_image', file, file.name);
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${API_BASE_URL}/expenses/scan_receipt/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataOCR
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const result = await response.json();
      if (result.success) {
        alert(`✅ SUCCESS! ${result.message}`);
        await fetchExpenses();
        await fetchSummary();
      } else {
        alert(`❌ OCR Failed: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`🚫 Network error: ${error.message}`);
    } finally {
      setOcrLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitFormData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          submitFormData.append(key, formData[key]);
        }
      });

      const token = localStorage.getItem('access_token');
      const url = editingExpense 
        ? `${API_BASE_URL}/expenses/${editingExpense.id}/` 
        : `${API_BASE_URL}/expenses/`;
      const method = editingExpense ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: submitFormData
      });

      if (response.ok) {
        alert(editingExpense ? 'Expense updated!' : 'Expense added!');
        setShowExpenseForm(false);
        setEditingExpense(null);
        resetForm();
        fetchExpenses();
        fetchSummary();
      } else {
        alert('Error: Please try again');
      }
    } catch (error) {
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount,
      date: expense.date,
      category_id: expense.category?.id || '',
      group_id: expense.group?.id || '',
      payment_method: expense.payment_method || '',
      notes: expense.notes || '',
      receipt_image: null
    });
    setShowExpenseForm(true);
  };

  const handleDelete = async (expenseId) => {
    if (window.confirm('Delete this expense?')) {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}/`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          alert('Expense deleted!');
          fetchExpenses();
          fetchSummary();
        }
      } catch (error) {
        alert('Error deleting expense');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category_id: '',
      group_id: '',
      payment_method: '',
      notes: '',
      receipt_image: null
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div className="dashboard-container">
      {/* EXACT SAME SIDEBAR AS DASHBOARD */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <img src={logo} alt="PayWise Logo" className="logo-img" />
            <h2 className="logo-text">PayWise</h2>
          </div>
          <div className="user-profile">
            <div className="user-avatar-large">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-details">
              <h4>{user?.name || 'User'}</h4>
              <p>{user?.email || 'user@paywise.com'}</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h5 className="nav-section-title">MAIN</h5>
            <button 
              className="nav-item"
              onClick={() => navigate('/dashboard')}
            >
              <span className="nav-icon">📊</span>
              <span className="nav-text">Overview</span>
            </button>
            <button 
              className="nav-item active"
            >
              <span className="nav-icon">💰</span>
              <span className="nav-text">Expenses</span>
              <span className="nav-indicator"></span>
            </button>
            <button 
              className="nav-item"
              onClick={() => navigate('/groups')}
            >
              <span className="nav-icon">👥</span>
              <span className="nav-text">Groups</span>
            </button>
            <button 
              className="nav-item"
              onClick={() => navigate('/reports')}
            >
              <span className="nav-icon">📈</span>
              <span className="nav-text">Reports</span>
            </button>
          </div>

          <div className="nav-section">
            <h5 className="nav-section-title">QUICK ACTIONS</h5>
            <button 
              className="nav-item quick-action" 
              onClick={() => setShowExpenseForm(true)}
            >
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
          <button 
            className="nav-item logout-item"
            onClick={handleLogout}
          >
            <span className="nav-icon">🚪</span>
            <span className="nav-text">Logout</span>
          </button>
          <div className="version-info">
            <p>PayWise v2.1.0</p>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="dashboard-main-container">
        {/* Premium Header */}
        <div className="dashboard-header">
          <div className="header-left">
            <div className="greeting-section">
              <h1>💰 Expense Management</h1>
              <p className="header-subtitle">Track and manage your expenses efficiently</p>
            </div>
          </div>
          
          <div className="header-right">
            <button 
              className="quick-add-btn" 
              onClick={() => setShowExpenseForm(true)}
            >
              <span className="btn-icon">➕</span>
              <span className="btn-text">Add Expense</span>
            </button>
            <div className="notification-bell">
              <span className="bell-icon">🔔</span>
              <span className="notification-badge">3</span>
            </div>
          </div>
        </div>

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
              <div className="stat-icon">📅</div>
              <div className="stat-content">
                <h3>This Month</h3>
                <p className="stat-amount">{formatCurrency(summary.month_expenses)}</p>
                <span className="stat-label">Current month spending</span>
              </div>
              <div className="stat-trend down">↘ 8%</div>
            </div>

            <div className="stat-card info">
              <div className="stat-icon">📝</div>
              <div className="stat-content">
                <h3>Total Count</h3>
                <p className="stat-count">{summary.total_count}</p>
                <span className="stat-label">Total expenses recorded</span>
              </div>
              <div className="stat-trend neutral">—</div>
            </div>

            <div className="stat-card warning">
              <div className="stat-icon">🤝</div>
              <div className="stat-content">
                <h3>Amount Owed</h3>
                <p className="stat-amount">{formatCurrency(summary.owed_amount)}</p>
                <span className="stat-label">From group expenses</span>
              </div>
              <div className="stat-trend up">↗ 2</div>
            </div>
          </section>

          {/* Recent Expenses List */}
          <div className="dashboard-card recent-activity">
            <div className="card-header">
              <h2>📋 Recent Expenses</h2>
              <button 
                className="view-all-btn" 
                onClick={() => setShowExpenseForm(true)}
              >
                Add Expense →
              </button>
            </div>
            <div className="activity-content">
              {expenses.length === 0 ? (
                <div className="empty-activity">
                  <div className="empty-icon">📝</div>
                  <h3>No expenses yet</h3>
                  <p>Add your first expense to get started!</p>
                  <button 
                    className="add-expense-link" 
                    onClick={() => setShowExpenseForm(true)}
                  >
                    Add First Expense
                  </button>
                </div>
              ) : (
                expenses.map(expense => (
                  <div key={expense.id} className="activity-item">
                    <div className="activity-icon">
                      {expense.category?.icon || '📝'}
                    </div>
                    <div className="activity-details">
                      <h4>{expense.description}</h4>
                      <p>
                        {expense.date} • {expense.category?.name || expense.ai_detected_category || 'Other'}
                        {expense.group && ` • ${expense.group.name}`}
                        {expense.payment_method && ` • ${expense.payment_method}`}
                      </p>
                      {expense.notes && (
                        <p style={{ fontStyle: 'italic', color: '#6b7280', marginTop: '4px' }}>
                          {expense.notes}
                        </p>
                      )}
                    </div>
                    <div className="activity-amount">
                      {formatCurrency(expense.amount)}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                      <button 
                        onClick={() => handleEdit(expense)}
                        className="action-btn secondary"
                        style={{ padding: '6px 12px', fontSize: '12px', minWidth: 'auto' }}
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDelete(expense.id)}
                        className="action-btn secondary"
                        style={{ 
                          padding: '6px 12px', 
                          fontSize: '12px', 
                          minWidth: 'auto',
                          background: '#ef4444',
                          color: 'white',
                          border: '1px solid #ef4444'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Your existing modal/form code remains the same */}
    </div>
  );
};

export default Expenses;
