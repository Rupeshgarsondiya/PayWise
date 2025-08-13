import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../Photos/logo.png';
import '../assets/css/Terms.css';

const Terms = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="terms-page">
      <div className="terms-header">
        <div className="terms-logo">
          <img src={logo} alt="PayWise Logo" />
          <h1>PayWise</h1>
        </div>
        <button className="back-btn" onClick={handleBackToHome}>
          ← Back to Home
        </button>
      </div>

      <div className="terms-content">
        <div className="terms-hero">
          <h1>Terms of Service</h1>
          <p>Last updated: January 2025</p>
        </div>

        <div className="terms-section">
          <h2>Acceptance of Terms</h2>
          <p>
            By accessing and using PayWise, you accept and agree to be bound by the terms and 
            provision of this agreement. If you do not agree to abide by the above, please do 
            not use this service.
          </p>
        </div>

        <div className="terms-section">
          <h2>Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of PayWise for personal, 
            non-commercial transitory viewing only. This is the grant of a license, not a 
            transfer of title, and under this license you may not:
          </p>
          <ul>
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose</li>
            <li>Attempt to reverse engineer any software contained in PayWise</li>
            <li>Remove any copyright or other proprietary notations</li>
            <li>Transfer the materials to another person</li>
          </ul>
        </div>

        <div className="terms-section">
          <h2>User Responsibilities</h2>
          <p>As a user of PayWise, you agree to:</p>
          <ul>
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Use the service only for lawful purposes</li>
            <li>Not interfere with the service or other users</li>
            <li>Report any security concerns immediately</li>
          </ul>
        </div>

        <div className="terms-section">
          <h2>Payment and Subscription</h2>
          <p>
            PayWise offers both free and premium subscription plans. Premium features require 
            a valid payment method and will be billed according to the selected plan. 
            Subscriptions automatically renew unless cancelled before the renewal date.
          </p>
        </div>

        <div className="terms-section">
          <h2>Limitation of Liability</h2>
          <p>
            PayWise shall not be held liable for any indirect, incidental, special, 
            consequential, or punitive damages, including without limitation, loss of profits, 
            data, use, goodwill, or other intangible losses.
          </p>
        </div>

        <div className="terms-section">
          <h2>Termination</h2>
          <p>
            We may terminate or suspend your account and bar access to the service immediately, 
            without prior notice or liability, under our sole discretion, for any reason 
            whatsoever and without limitation.
          </p>
        </div>

        <div className="terms-section">
          <h2>Changes to Terms</h2>
          <p>
            We reserve the right to modify or replace these Terms at any time. If a revision 
            is material, we will provide at least 30 days notice prior to any new terms 
            taking effect.
          </p>
        </div>

        <div className="terms-cta">
          <h2>Questions about our terms?</h2>
          <p>We're here to help clarify any questions you might have about our service.</p>
          <button className="cta-btn" onClick={() => navigate('/support')}>
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default Terms;
