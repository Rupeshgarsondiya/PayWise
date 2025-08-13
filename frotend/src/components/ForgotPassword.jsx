import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Handle password reset logic here
    console.log('Password reset requested for:', email);
    setIsSubmitted(true);
    setError('');
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  if (isSubmitted) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="success-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#10b981"/>
              </svg>
            </div>
            <h2>Check your email</h2>
            <p>We've sent a password reset link to <strong>{email}</strong></p>
          </div>

          <div className="reset-instructions">
            <p>Didn't receive the email? Check your spam folder or try again with a different email address.</p>
          </div>

          <button 
            onClick={() => setIsSubmitted(false)} 
            className="btn btn-outline btn-large auth-btn"
          >
            Try another email
          </button>

          <div className="auth-footer">
            <p>
              Remember your password?{' '}
              <Link to="/login" className="auth-link">
                Back to login
              </Link>
            </p>
            <p style={{ marginTop: '12px' }}>
              <Link to="/" className="auth-link">
                ← Back to Home
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Forgot your password?</h2>
          <p>No worries! Enter your email and we'll send you reset instructions.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email"
              className={error ? 'error' : ''}
            />
            {error && <span className="error-message">{error}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-large auth-btn">
            Send reset instructions
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Remember your password?{' '}
            <Link to="/login" className="auth-link">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
