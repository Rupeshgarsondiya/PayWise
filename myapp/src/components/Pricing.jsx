import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/Pricing.css';

const Pricing = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/signup');
  };

  return (
    <section className="pricing" id="pricing">
      <div className="pricing-container">
        <div className="pricing-header">
          <h2>Upgrade to save time</h2>
          <p>Find the best plan for your expected usage. No hidden fees and you can cancel your subscription at any time.</p>
        </div>
        
        <div className="pricing-plans">
          {/* Free Plan */}
          <div className="pricing-plan">
            <div className="plan-header">
              <h3>Free</h3>
              <p className="plan-description">Everything you need, free forever.</p>
              <div className="plan-price">
                <span className="price">₹0</span>
                <span className="period">/month</span>
              </div>
            </div>
            
            <div className="plan-features">
              <div className="feature">
                <svg className="check-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
                </svg>
                <span>Add expenses, split, settle up</span>
              </div>
              <div className="feature">
                <svg className="check-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
                </svg>
                <span>Import expenses up to 1 month old</span>
              </div>
            </div>
            
            <button className="btn btn-outline btn-large plan-btn" onClick={handleGetStarted}>Get started</button>
          </div>

          {/* Starter Plan */}
          <div className="pricing-plan popular">
            <div className="popular-badge">Most popular</div>
            <div className="plan-header">
              <h3>Starter</h3>
              <p className="plan-description">AI receipts & link one credit card/bank account.</p>
              <div className="plan-price">
                <span className="price">₹129</span>
                <span className="period">/month</span>
              </div>
            </div>
            
            <div className="plan-features">
              <div className="feature">
                <svg className="check-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
                </svg>
                <span>Add expenses, split, settle up</span>
              </div>
              <div className="feature">
                <svg className="check-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
                </svg>
                <span>Import expenses up to 3 months old</span>
              </div>
              <div className="feature">
                <svg className="check-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
                </svg>
                <span>AI receipt itemization: 10 per month</span>
              </div>
              <div className="feature">
                <svg className="check-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
                </svg>
                <span>Link one card or bank account for daily auto expense imports</span>
              </div>
            </div>
            
            <button className="btn btn-primary btn-large plan-btn" onClick={handleGetStarted}>Get started</button>
          </div>

          {/* Unlimited Plan */}
          <div className="pricing-plan">
            <div className="plan-header">
              <h3>Unlimited</h3>
              <p className="plan-description">Link all of your credit cards and bank accounts.</p>
              <div className="plan-price">
                <span className="price"> ₹349 </span>
                <span className="period">/month</span>
              </div>
            </div>
            
            <div className="plan-features">
              <div className="feature">
                <svg className="check-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
                </svg>
                <span>Add expenses, split, settle up</span>
              </div>
              <div className="feature">
                <svg className="check-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
                </svg>
                <span>Import expenses with no date limits</span>
              </div>
              <div className="feature">
                <svg className="check-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
                </svg>
                <span>AI receipt itemization: unlimited</span>
              </div>
              <div className="feature">
                <svg className="check-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
                </svg>
                <span>Link all your cards and bank accounts for daily auto expense imports</span>
              </div>
            </div>
            
            <button className="btn btn-outline btn-large plan-btn" onClick={handleGetStarted}>Get started</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
