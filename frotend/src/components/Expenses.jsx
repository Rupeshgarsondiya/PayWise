import React, { useState, useEffect } from 'react';
import '../assets/css/Expenses.css';

const API_BASE_URL = 'http://127.0.0.1:8000/api/expenses';

const Expenses = () => {
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
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
    fetchExpenses();
    fetchCategories();
    fetchGroups();
    fetchSummary();
  }, []);

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE_URL}/expenses/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  // ✅ FIXED: Enhanced input change handler with proper file validation
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'receipt_image') {
      const selectedFile = files?.[0];
      
      if (selectedFile) {
        // ✅ FIX: Check if file.type exists before using startsWith
        if (!selectedFile.type) {
          alert('Invalid file format. Please select a valid image file.');
          e.target.value = ''; // Clear the input
          return;
        }
        
        // ✅ FIX: Now safely check file type
        if (!selectedFile.type.startsWith('image/')) {
          alert('Please select a valid image file (JPG, PNG, WEBP, etc.)');
          e.target.value = ''; // Clear the input
          return;
        }
        
        // ✅ FIX: Check file size
        if (selectedFile.size > 10 * 1024 * 1024) {
          alert('File size too large. Please select an image under 10MB.');
          e.target.value = ''; // Clear the input
          return;
        }
        
        setFormData(prev => ({ ...prev, [name]: selectedFile }));
        
        // Trigger automatic OCR scan
        handleAutomaticOCRScan(selectedFile);
      } else {
        setFormData(prev => ({ ...prev, [name]: null }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // ✅ COMPLETELY FIXED: OCR scanning function with comprehensive error handling
  const handleAutomaticOCRScan = async (file) => {
    console.log('File received:', file);
    
    // ✅ FIX: Enhanced validation with null/undefined checks
    if (!file) {
      alert('Please select an image file first');
      return;
    }

    // ✅ FIX: Check if file.type exists before using startsWith
    if (!file.type) {
      alert('Invalid file format. Please select a valid image file.');
      return;
    }

    // ✅ FIX: Now safely check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, etc.)');
      return;
    }

    // ✅ FIX: Validate file size with proper checks
    if (file.size && file.size > 10 * 1024 * 1024) {
      alert('File size too large. Please select an image under 10MB.');
      return;
    }

    setOcrLoading(true);
    
    try {
      const formDataOCR = new FormData();
      formDataOCR.append('receipt_image', file, file.name);

      // Debug: Log FormData contents
      console.log('FormData contents:');
      for (let [key, value] of formDataOCR.entries()) {
        console.log(key, value);
      }

      const token = localStorage.getItem('access_token');
      console.log('Making OCR request to:', `${API_BASE_URL}/expenses/scan_receipt/`);
      
      const response = await fetch(`${API_BASE_URL}/expenses/scan_receipt/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData - let browser set it
        },
        body: formDataOCR
      });

      console.log('Response status:', response.status);
      
      // ✅ FIX: Better error handling for HTTP errors
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Response data:', result);

      if (result.success) {
        alert(`✅ SUCCESS! ${result.message}`);
        // Refresh the expenses list and summary to show the new expense
        await fetchExpenses();
        await fetchSummary();
        console.log('Created expense:', result.expense_created);
        console.log('OCR data:', result.ocr_data);
      } else {
        alert(`❌ OCR Failed: ${result.message || result.error || 'Unknown error'}`);
        console.error('OCR Error Details:', result);
      }
    } catch (error) {
      console.error('OCR Request Error:', error);
      alert(`🚫 Network error: ${error.message}. Please check your connection and try again.`);
    } finally {
      setOcrLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitFormData = new FormData();
      
      // Add all form fields
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
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitFormData
      });

      if (response.ok) {
        alert(editingExpense ? 'Expense updated successfully!' : 'Expense added successfully!');
        setShowExpenseForm(false);
        setEditingExpense(null);
        resetForm();
        fetchExpenses();
        fetchSummary();
      } else {
        const errorData = await response.json();
        alert('Error: ' + JSON.stringify(errorData));
      }
    } catch (error) {
      console.error('Error submitting expense:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
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
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          alert('Expense deleted successfully!');
          fetchExpenses();
          fetchSummary();
        } else {
          alert('Error deleting expense');
        }
      } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Something went wrong. Please try again.');
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
    <div className="expenses-container">
      {/* Navigation */}
      <nav className="expense-nav">
        <h1>💰 PayWise - Expenses</h1>
        <button 
          onClick={() => setShowExpenseForm(true)}
          className="add-expense-btn"
        >
          ➕ Add New Expense
        </button>
      </nav>

      {/* Summary Cards */}
      <div className="summary-section">
        <div className="summary-card">
          <h3>💰 Total Expenses</h3>
          <p>{formatCurrency(summary.total_expenses)}</p>
        </div>
        <div className="summary-card">
          <h3>📅 This Month</h3>
          <p>{formatCurrency(summary.month_expenses)}</p>
        </div>
        <div className="summary-card">
          <h3>📝 Total Count</h3>
          <p>{summary.total_count}</p>
        </div>
        <div className="summary-card">
          <h3>🤝 Amount Owed</h3>
          <p>{formatCurrency(summary.owed_amount)}</p>
        </div>
      </div>

      {/* Expense Form Modal */}
      {showExpenseForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingExpense ? '✏️ Edit Expense' : '➕ Add New Expense'}</h2>
              <button 
                onClick={() => {
                  setShowExpenseForm(false);
                  setEditingExpense(null);
                  resetForm();
                }}
                className="close-btn"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="expense-form">
              <div className="form-group">
                <label htmlFor="description">📝 Description *</label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter expense description"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="amount">💰 Amount *</label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="date">📅 Date *</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category_id">🏷️ Category</label>
                  <select
                    id="category_id"
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="group_id">👥 Group</label>
                  <select
                    id="group_id"
                    name="group_id"
                    value={formData.group_id}
                    onChange={handleInputChange}
                  >
                    <option value="">Personal (No Group)</option>
                    {groups.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="payment_method">💳 Payment Method</label>
                <input
                  type="text"
                  id="payment_method"
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleInputChange}
                  placeholder="e.g., Cash, Credit Card, UPI"
                />
              </div>

              {/* ✅ FIXED: Receipt upload with proper validation */}
              <div className="form-group">
                <label htmlFor="receipt_image">📷 Receipt Image (Auto OCR)</label>
                <input
                  type="file"
                  id="receipt_image"
                  name="receipt_image"
                  onChange={handleInputChange}
                  accept="image/*"
                  className="file-input"
                />
                <p className="file-help">
                  📸 Upload receipt for automatic data extraction
                </p>
                {ocrLoading && (
                  <div className="ocr-loading">
                    ⏳ Processing receipt with AI OCR...
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="notes">📋 Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Additional notes about this expense"
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button"
                  onClick={() => {
                    setShowExpenseForm(false);
                    setEditingExpense(null);
                    resetForm();
                  }}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="submit-btn"
                >
                  {loading ? '⏳ Processing...' : (editingExpense ? '💾 Update' : '➕ Add Expense')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expenses List */}
      <div className="expenses-list">
        <h2>📋 Recent Expenses</h2>
        {expenses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No expenses yet</h3>
            <p>Add your first expense to get started!</p>
            <button 
              onClick={() => setShowExpenseForm(true)}
              className="add-first-expense-btn"
            >
              ➕ Add First Expense
            </button>
          </div>
        ) : (
          <div className="expenses-grid">
            {expenses.map(expense => (
              <div key={expense.id} className="expense-card">
                <div className="expense-header">
                  <div className="expense-category">
                    {expense.category?.icon || '📝'} {expense.category?.name || expense.ai_detected_category || 'Other'}
                  </div>
                  <div className="expense-amount">
                    {formatCurrency(expense.amount)}
                  </div>
                </div>
                
                <div className="expense-content">
                  <h3 className="expense-description">{expense.description}</h3>
                  <div className="expense-meta">
                    <span className="expense-date">📅 {expense.date}</span>
                    {expense.group && (
                      <span className="expense-group">👥 {expense.group.name}</span>
                    )}
                    {expense.payment_method && (
                      <span className="expense-payment">💳 {expense.payment_method}</span>
                    )}
                  </div>
                  {expense.notes && (
                    <p className="expense-notes">{expense.notes}</p>
                  )}
                </div>
                
                <div className="expense-actions">
                  <button 
                    onClick={() => handleEdit(expense)}
                    className="edit-btn"
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(expense.id)}
                    className="delete-btn"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Expenses;
