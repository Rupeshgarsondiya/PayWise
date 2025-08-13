import React from 'react';
import { useNavigate } from 'react-router-dom';
import heroImage from '../Photos/hero_two.jpg';
import '../assets/css/Hero.css';

const Hero = () => {
  const navigate = useNavigate();

  const handleStartTracking = () => {
    navigate('/signup');
  };

  return (
    <section className="hero" id="home">
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            Split Expenses <span className="highlight">Easily</span> with Friends & Family
          </h1>
          <p className="hero-description">
            Track shared expenses, split bills, and settle debts with the most user-friendly expense tracker. 
            Perfect for roommates, trips, and group activities.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-large" onClick={handleStartTracking}>Start Tracking Expenses</button>
            <button className="btn btn-outline btn-large">Watch Demo</button>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">50K+</span>
              <span className="stat-label">Active Users</span>
            </div>
            <div className="stat">
              <span className="stat-number">2M+</span>
              <span className="stat-label">Expenses Tracked</span>
            </div>
            <div className="stat">
              <span className="stat-number">4.8★</span>
              <span className="stat-label">User Rating</span>
            </div>
          </div>
        </div>
        <div className="hero-image">
          <img src={heroImage} alt="Expense tracking illustration" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
