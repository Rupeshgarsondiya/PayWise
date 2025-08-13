import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../Photos/logo.png';
import '../assets/css/Privacy.css';

const Privacy = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="privacy-page">
      <div className="privacy-header">
        <div className="privacy-logo">
          <img src={logo} alt="PayWise Logo" />
          <h1>PayWise</h1>
        </div>
        <button className="back-btn" onClick={handleBackToHome}>
          ← Back to Home
        </button>
      </div>

      <div className="privacy-content">
        <div className="privacy-hero">
          <h1>Privacy Policy</h1>
          <p>Last updated: January 2025</p>
        </div>

        <div className="privacy-section">
          <h2>Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you create an account, 
            add expenses, or contact our support team. This may include your name, email address, 
            phone number, and payment information.
          </p>
          <p>
            We also automatically collect certain information when you use our service, including 
            your IP address, browser type, device information, and usage patterns.
          </p>
        </div>

        <div className="privacy-section">
          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Send technical notices, updates, and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Monitor and analyze trends and usage</li>
          </ul>
        </div>

        <div className="privacy-section">
          <h2>Information Sharing</h2>
          <p>
            We do not sell, trade, or otherwise transfer your personal information to third parties 
            without your consent, except as described in this policy. We may share your information 
            with service providers who assist us in operating our platform.
          </p>
        </div>

        <div className="privacy-section">
          <h2>Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information against 
            unauthorized access, alteration, disclosure, or destruction. However, no method of 
            transmission over the internet is 100% secure.
          </p>
        </div>

        <div className="privacy-section">
          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access and update your personal information</li>
            <li>Delete your account and associated data</li>
            <li>Opt-out of marketing communications</li>
            <li>Request data portability</li>
          </ul>
        </div>

        <div className="privacy-section">
          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at 
            <a href="mailto:privacy@paywise.com"> privacy@paywise.com</a>
          </p>
        </div>

        <div className="privacy-cta">
          <h2>Questions about privacy?</h2>
          <p>We're committed to protecting your data and being transparent about how we use it.</p>
          <button className="cta-btn" onClick={() => navigate('/support')}>
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
