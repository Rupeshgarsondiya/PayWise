import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../Photos/logo.png';
import '../assets/css/Support.css';

const Support = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="support-page">
      <div className="support-header">
        <div className="support-logo">
          <img src={logo} alt="PayWise Logo" />
          <h1>PayWise</h1>
        </div>
        <button className="back-btn" onClick={handleBackToHome}>
          ← Back to Home
        </button>
      </div>

      <div className="support-content">
        <div className="support-hero">
          <h1>Support Center</h1>
          <p>We're here to help you get the most out of PayWise</p>
        </div>

        <div className="support-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>How do I create a group?</h3>
              <p>Click on "Create Group" in your dashboard, add a group name, and invite friends via email or share the unique group link.</p>
            </div>
            <div className="faq-item">
              <h3>Can I edit expenses after adding them?</h3>
              <p>Yes! You can edit any expense details including amount, description, date, and split ratios at any time.</p>
            </div>
            <div className="faq-item">
              <h3>How do I settle up with friends?</h3>
              <p>Use the "Settle Up" feature to see who owes what, then use your preferred payment app to transfer money.</p>
            </div>
            <div className="faq-item">
              <h3>Is my financial data secure?</h3>
              <p>Absolutely! We use bank-level encryption and never store your actual banking credentials.</p>
            </div>
          </div>
        </div>

        <div className="support-section">
          <h2>Contact Methods</h2>
          <div className="contact-grid">
            <div className="contact-item">
              <h3>Email Support</h3>
              <p>Get help via email within 24 hours</p>
              <a href="mailto:support@paywise.com" className="contact-link">support@paywise.com</a>
            </div>
            <div className="contact-item">
              <h3>Live Chat</h3>
              <p>Chat with our support team in real-time</p>
              <button className="contact-btn">Start Chat</button>
            </div>
            <div className="contact-item">
              <h3>Help Center</h3>
              <p>Browse our comprehensive help articles</p>
              <a href="#" className="contact-link">Browse Articles</a>
            </div>
            <div className="contact-item">
              <h3>Community Forum</h3>
              <p>Connect with other PayWise users</p>
              <a href="#" className="contact-link">Join Forum</a>
            </div>
          </div>
        </div>

        <div className="support-section">
          <h2>Getting Started Guide</h2>
          <div className="guide-steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Create Your Account</h3>
                <p>Sign up with your email and create a secure password to get started.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Add Your First Expense</h3>
                <p>Start by adding a shared expense and invite friends to split it with you.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Invite Friends</h3>
                <p>Share your group link with friends so they can join and start splitting expenses.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Settle Up</h3>
                <p>Use the settle up feature to see who owes what and complete payments.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="support-cta">
          <h2>Still need help?</h2>
          <p>Our support team is available 24/7 to assist you with any questions or issues.</p>
          <button className="cta-btn" onClick={() => navigate('/signup')}>
            Get Started Today
          </button>
        </div>
      </div>
    </div>
  );
};

export default Support;
