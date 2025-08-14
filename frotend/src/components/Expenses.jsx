import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../Photos/logo.png';
import '../assets/css/Expenses.css';

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
    // Try refresh
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
        // Retry original request with new token
        const retryHeaders = {
          ...headers,
          Authorization: `Bearer ${newAccess}`,
        };
        response = await fetch(url, { ...options, headers: retryHeaders });
      }
    } else {
      // Refresh failed -> force logout
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }

  return response;
}

const Expenses = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    group: '',
    paidBy: 'me',
    splitWith: []
  });
  const [loading, setLoading] = useState(false);
  const [aiCategory, setAiCategory] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [summary, setSummary] = useState({
    total_expenses: 0,
    month_expenses: 0,
    total_count: 0,
    owed_amount: 0
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchCategories();
      fetchGroups();
      fetchExpenses();
      fetchSummary();
    }
  }, [user]);

  const fetchCategories = async () => {
    try {
      const response = await authFetch(`${API_BASE_URL}/expenses/categories/`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await authFetch(`${API_BASE_URL}/expenses/groups/`);
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await authFetch(`${API_BASE_URL}/expenses/expenses/`);
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      }
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await authFetch(`${API_BASE_URL}/expenses/expenses/summary/`);
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'description' && value.length > 3) {
      detectCategory(value);
    }
  };

  const detectCategory = async (description) => {
    setAiLoading(true);
    try {
      const response = await authFetch(`${API_BASE_URL}/expenses/expenses/detect_category/`, {
        method: 'POST',
        body: JSON.stringify({
          description: description,
          amount: parseFloat(formData.amount) || 0
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiCategory(data.category);
        setFormData(prev => ({ ...prev, category: data.category }));
      } else {
        const fallbackCategory = detectCategoryFallback(description);
        setAiCategory(fallbackCategory);
        setFormData(prev => ({ ...prev, category: fallbackCategory }));
      }
    } catch (error) {
      console.error('AI category detection failed:', error);
      const fallbackCategory = detectCategoryFallback(description);
      setAiCategory(fallbackCategory);
      setFormData(prev => ({ ...prev, category: fallbackCategory }));
    } finally {
      setAiLoading(false);
    }
  };

  const detectCategoryFallback = (description) => {
    const keywords = description.toLowerCase();
    let detectedCategory = 'Other';
    if (keywords.includes('food') || keywords.includes('restaurant') || keywords.includes('dinner') || keywords.includes('lunch') || keywords.includes('breakfast') || keywords.includes('grocery')) {
      detectedCategory = 'Food';
    } else if (keywords.includes('movie') || keywords.includes('cinema') || keywords.includes('game') || keywords.includes('concert') || keywords.includes('party')) {
      detectedCategory = 'Entertainment';
    } else if (keywords.includes('uber') || keywords.includes('taxi') || keywords.includes('fuel') || keywords.includes('parking') || keywords.includes('bus')) {
      detectedCategory = 'Transport';
    } else if (keywords.includes('shirt') || keywords.includes('shoes') || keywords.includes('dress') || keywords.includes('shopping') || keywords.includes('clothes')) {
      detectedCategory = 'Shopping';
    } else if (keywords.includes('electricity') || keywords.includes('water') || keywords.includes('internet') || keywords.includes('rent') || keywords.includes('bill')) {
      detectedCategory = 'Bills';
    } else if (keywords.includes('medicine') || keywords.includes('doctor') || keywords.includes('hospital') || keywords.includes('pharmacy')) {
      detectedCategory = 'Healthcare';
    }
    return detectedCategory;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        date: formData.date,
        category_id: categories.find(c => c.name === formData.category)?.id,
        group_id: groups.find(g => g.name === formData.group)?.id,
        // omit paid_by_id so backend defaults to current user
        notes: `AI detected category: ${aiCategory}`
      };

      let response;
      if (editingExpense) {
        // Try PATCH first
        response = await authFetch(`${API_BASE_URL}/expenses/expenses/${editingExpense.id}/`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        // If Not Found (e.g., stale id or router quirk), try PUT as fallback
        if (response.status === 404) {
          response = await authFetch(`${API_BASE_URL}/expenses/expenses/${editingExpense.id}/`, {
            method: 'PUT',
            body: JSON.stringify(payload),
          });
        }
      } else {
        response = await authFetch(`${API_BASE_URL}/expenses/expenses/`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        const saved = await response.json();
        if (editingExpense) {
          setExpenses(prev => prev.map(exp => exp.id === editingExpense.id ? saved : exp));
        } else {
          setExpenses(prev => [saved, ...prev]);
        }
        setFormData({
          description: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          category: '',
          group: '',
          paidBy: 'me',
          splitWith: []
        });
        setAiCategory('');
        setEditingExpense(null);
        setShowForm(false);
        fetchSummary();
        alert(editingExpense ? 'Expense updated successfully!' : 'Expense added successfully!');
      } else if (response.status === 401) {
        alert('Your session has expired. Please login again.');
        navigate('/login');
      } else {
        const errorData = await response.json();
        alert(`${editingExpense ? 'Failed to update' : 'Failed to add'} expense: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error('Failed to save expense:', error);
      alert('Failed to save expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    const categoryObj = categories.find(c => c.name === category);
    return categoryObj?.icon || '📝';
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="expenses-page">
      <aside className="expenses-sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <img src={logo} alt="PayWise Logo" />
            <span className="logo-text">PayWise</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <button className="nav-item" onClick={() => navigate('/dashboard')}>
            <span className="nav-icon">📊</span>
            <span className="nav-text">Overview</span>
          </button>
          <button className="nav-item active">
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

      <div className="expenses-main">
        <header className="expenses-header">
          <div className="header-content">
            <h1>Expenses</h1>
            <button 
              className="btn btn-primary add-expense-btn"
              onClick={() => {
                setEditingExpense(null);
                setFormData({
                  description: '',
                  amount: '',
                  date: new Date().toISOString().split('T')[0],
                  category: '',
                  group: '',
                  paidBy: 'me',
                  splitWith: []
                });
                setAiCategory('');
                setShowForm(true);
              }}
            >
              <span className="btn-icon">+</span>
              Add New Expense
            </button>
          </div>
          <div className="user-menu">
            <div className="user-avatar">
              <span>{user.first_name ? user.first_name.charAt(0) : user.email.charAt(0).toUpperCase()}</span>
            </div>
            <div className="user-info">
              <span className="user-name">{user.first_name || 'User'}</span>
              <span className="user-email">{user.email}</span>
            </div>
          </div>
        </header>

        <main className="expenses-content">
          {showForm && (
            <div className="expense-form-overlay">
              <div className="expense-form-modal">
                <div className="modal-header">
                  <h2>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h2>
                  <button 
                    className="close-btn"
                    onClick={() => setShowForm(false)}
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="expense-form">
                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <input
                      type="text"
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="What did you spend on?"
                      required
                    />
                    {aiLoading && (
                      <div className="ai-loading">
                        <div className="ai-spinner"></div>
                        <span>AI is detecting category...</span>
                      </div>
                    )}
                    {aiCategory && !aiLoading && (
                      <div className="ai-detection">
                        <span className="ai-icon">🤖</span>
                        <span>AI detected: <strong>{aiCategory}</strong></span>
                      </div>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="amount">Amount (₹)</label>
                      <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="date">Date</label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="category">Category (AI Detected)</label>
                      <input
                        type="text"
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        placeholder="Category will be auto-detected"
                        readOnly
                        className="readonly-input"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="group">Group (Optional)</label>
                      <select
                        id="group"
                        name="group"
                        value={formData.group}
                        onChange={handleChange}
                      >
                        <option value="">No Group</option>
                        {groups.map(group => (
                          <option key={group.id} value={group.name}>{group.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="paidBy">Paid By</label>
                    <select
                      id="paidBy"
                      name="paidBy"
                      value={formData.paidBy}
                      onChange={handleChange}
                      required
                    >
                      <option value="me">You</option>
                      {groups.find(g => g.name === formData.group)?.members.filter(m => m !== 'You').map(member => (
                        <option key={member} value={member}>{member}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="btn btn-outline"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? 'Adding...' : 'Add Expense'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="expenses-summary">
            <div className="summary-card total">
              <div className="card-icon">💰</div>
              <div className="card-content">
                <h3>Total Expenses</h3>
                <p className="amount">{formatCurrency(summary.total_expenses)}</p>
              </div>
            </div>
            <div className="summary-card this-month">
              <div className="card-icon">📅</div>
              <div className="card-content">
                <h3>This Month</h3>
                <p className="amount">{formatCurrency(summary.month_expenses)}</p>
              </div>
            </div>
            <div className="summary-card count">
              <div className="card-icon">📝</div>
              <div className="card-content">
                <h3>Total Count</h3>
                <p className="amount">{summary.total_count}</p>
              </div>
            </div>
            <div className="summary-card owed">
              <div className="card-icon">💳</div>
              <div className="card-content">
                <h3>You're Owed</h3>
                <p className="amount">{formatCurrency(summary.owed_amount)}</p>
              </div>
            </div>
          </div>

          <div className="expenses-list">
            <div className="list-header">
              <h2>Recent Expenses</h2>
              <div className="list-filters">
                <select className="filter-select">
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>{category.name}</option>
                  ))}
                </select>
                <select className="filter-select">
                  <option value="">All Groups</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.name}>{group.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="expenses-grid">
              {expenses.map(expense => (
                <div key={expense.id} className="expense-card">
                  <div className="expense-header">
                    <div className="category-icon">
                      {getCategoryIcon(expense.category?.name || expense.ai_detected_category)}
                    </div>
                    <div className="expense-amount">
                      {formatCurrency(expense.amount)}
                    </div>
                  </div>
                  <div className="expense-details">
                    <h3 className="expense-description">{expense.description}</h3>
                    <p className="expense-meta">
                      <span className="expense-date">{new Date(expense.date).toLocaleDateString()}</span>
                      <span className="expense-category">
                        {expense.category?.name || expense.ai_detected_category || 'Other'}
                      </span>
                    </p>
                    {expense.group && (
                      <p className="expense-group">Group: {expense.group.name}</p>
                    )}
                    <p className="expense-paid-by">Paid by: {expense.paid_by?.first_name || expense.paid_by?.email || 'You'}</p>
                    {expense.ai_detected_category && (
                      <p className="ai-indicator">🤖 AI Detected</p>
                    )}
                    <div className="expense-actions">
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => {
                          setEditingExpense(expense);
                          setFormData({
                            description: expense.description || '',
                            amount: expense.amount != null ? String(expense.amount) : '',
                            date: expense.date,
                            category: expense.category?.name || expense.ai_detected_category || '',
                            group: expense.group?.name || '',
                            paidBy: 'me',
                            splitWith: []
                          });
                          setAiCategory(expense.ai_detected_category || expense.category?.name || '');
                          setShowForm(true);
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Expenses;
