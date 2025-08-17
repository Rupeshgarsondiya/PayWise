import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../Photos/logo.png';
import '../assets/css/Expenses.css';

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
    navigate('/');
  };

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
        if (!selectedFile.type.startsWith('image/')) {
          alert('Please select a valid image file');
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
    setOcrLoading(true);
    try {
      const formDataOCR = new FormData();
      formDataOCR.append('receipt_image', file);
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
      const url = editingExpense ? `${API_BASE_URL}/expenses/${editingExpense.id}/` : `${API_BASE_URL}/expenses/`;
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
    <div className="dashboard">
      {/* ===== EXACT SAME SIDEBAR AS DASHBOARD ===== */}
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
            <button className="nav-item" onClick={() => navigate('/dashboard')}>
              <span className="nav-icon">📊</span>
              <span className="nav-text">Overview</span>
            </button>
            <button className="nav-item active">
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

      {/* ===== MAIN CONTENT CONTAINER ===== */}
      <div className="dashboard-main-container">
        {/* ===== PREMIUM HEADER ===== */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1>💰 Expenses</h1>
            <p>Track and manage your expenses efficiently</p>
          </div>
          <div className="header-actions">
            <button 
              className="action-btn primary"
              onClick={() => setShowExpenseForm(true)}
            >
              <span>➕</span>
              Add Expense
            </button>
          </div>
          <div className="user-menu">
            <div className="user-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.name || 'User'}</div>
              <div className="user-email">{user?.email || 'user@paywise.com'}</div>
            </div>
          </div>
        </div>

        {/* ===== MAIN CONTENT ===== */}
        <div className="dashboard-main">
          {/* ===== BALANCE CARDS ===== */}
          <div className="balance-cards">
            <div className="balance-card positive">
              <div className="card-icon">💰</div>
              <div className="card-content">
                <h3>Total Expenses</h3>
                <div className="amount">{formatCurrency(summary.total_expenses)}</div>
                <p>All time spending</p>
              </div>
            </div>

            <div className="balance-card neutral">
              <div className="card-icon">📅</div>
              <div className="card-content">
                <h3>This Month</h3>
                <div className="amount">{formatCurrency(summary.month_expenses)}</div>
                <p>Current month spending</p>
              </div>
            </div>

            <div className="balance-card positive">
              <div className="card-icon">📊</div>
              <div className="card-content">
                <h3>Total Count</h3>
                <div className="amount">{summary.total_count}</div>
                <p>Total expenses recorded</p>
              </div>
            </div>

            <div className="balance-card neutral">
              <div className="card-icon">🤝</div>
              <div className="card-content">
                <h3>Owed Amount</h3>
                <div className="amount">{formatCurrency(summary.owed_amount)}</div>
                <p>From group expenses</p>
              </div>
            </div>
          </div>

          {/* ===== RECENT ACTIVITY ===== */}
          <div className="recent-activity">
            <h2>📋 Recent Expenses</h2>
            <div className="activity-list">
              {expenses.length > 0 ? expenses.map(expense => (
                <div key={expense.id} className="activity-item">
                  <div className="activity-icon">
                    {expense.category?.icon || '💰'}
                  </div>
                  <div className="activity-details">
                    <h4>{expense.description}</h4>
                    <p>
                      {expense.date} • {expense.category?.name || expense.ai_detected_category || 'Other'}
                      {expense.group && ` • ${expense.group.name}`}
                      {expense.payment_method && ` • ${expense.payment_method}`}
                    </p>
                    {expense.notes && (
                      <small style={{ color: '#6b7280', fontStyle: 'italic' }}>
                        {expense.notes}
                      </small>
                    )}
                  </div>
                  <div className="activity-amount">
                    {formatCurrency(expense.amount)}
                  </div>
                  <div className="expense-actions">
                    <button 
                      className="action-btn secondary"
                      onClick={() => handleEdit(expense)}
                      title="Edit expense"
                    >
                      ✏️
                    </button>
                    <button 
                      className="action-btn danger"
                      onClick={() => handleDelete(expense.id)}
                      title="Delete expense"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )) : (
                <div className="empty-state">
                  <div className="empty-icon">💸</div>
                  <h3>No Expenses Yet</h3>
                  <p>Add your first expense to get started!</p>
                  <button 
                    className="action-btn primary"
                    onClick={() => setShowExpenseForm(true)}
                  >
                    ➕ Add First Expense
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== EXPENSE FORM MODAL ===== */}
      {showExpenseForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowExpenseForm(false);
                  setEditingExpense(null);
                  resetForm();
                }}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="expense-form">
              <div className="form-group">
                <label>Description *</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter expense description"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Amount *</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Group (Optional)</label>
                  <select
                    name="group_id"
                    value={formData.group_id}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Group</option>
                    {groups.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleInputChange}
                >
                  <option value="">Select Payment Method</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Additional notes (optional)"
                ></textarea>
              </div>

              <div className="form-group">
                <label>Receipt Image</label>
                <input
                  type="file"
                  name="receipt_image"
                  onChange={handleInputChange}
                  accept="image/*"
                  className="file-input"
                />
                {ocrLoading && (
                  <div className="ocr-loading">
                    <span>🔄</span>
                    Processing receipt with OCR...
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="action-btn secondary"
                  onClick={() => {
                    setShowExpenseForm(false);
                    setEditingExpense(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="action-btn primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : editingExpense ? 'Update Expense' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
