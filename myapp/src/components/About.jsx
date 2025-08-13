import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../Photos/logo.png';
import '../assets/css/About.css';

const About = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="about-page">
      <div className="about-header">
        <div className="about-logo">
          <img src={logo} alt="PayWise Logo" />
          <h1>PayWise</h1>
        </div>
        <button className="back-btn" onClick={handleBackToHome}>
          ← Back to Home
        </button>
      </div>

      <div className="about-content">
        <div className="about-hero">
          <h1>Customer focused, always.</h1>
          <p>
            PayWise was built to alleviate the pain of bill splits with friends. Feel confident and empowered when going on trips with friends, to be able to split and get your money back easily. Splitting bills is never fun, so we've optimized the process to save time!
          </p>
          <p>
            We continue to invest, innovate, and build out PayWise for the long run. We pride ourselves on adopting the latest technologies (AI, infrastructure, security, powerful APIs) to underpin game changing features and product experiences. Have thoughts? We're always open to feedback comments or questions, please reach out to us.
          </p>
        </div>

        <div className="about-stats">
          <div className="stat-item">
            <h3>Founded</h3>
            <p>Jan 2024</p>
          </div>
          <div className="stat-item">
            <h3>Employees</h3>
            <p>5</p>
          </div>
          <div className="stat-item">
            <h3>Capital raised</h3>
            <p>$50K</p>
          </div>
          <div className="stat-item">
            <h3>Owned by</h3>
            <p>PayWise Solutions Inc.</p>
          </div>
        </div>

        <div className="about-mission">
          <h2>Our Mission</h2>
          <p>
            To simplify financial management between friends and groups, making expense splitting transparent, fair, and hassle-free. We believe that money shouldn't come between relationships.
          </p>
        </div>

        <div className="about-values">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-item">
              <h3>Transparency</h3>
              <p>Clear and honest expense tracking for everyone involved.</p>
            </div>
            <div className="value-item">
              <h3>Simplicity</h3>
              <p>Making complex financial calculations simple and intuitive.</p>
            </div>
            <div className="value-item">
              <h3>Security</h3>
              <p>Protecting your financial data with enterprise-grade security.</p>
            </div>
            <div className="value-item">
              <h3>Innovation</h3>
              <p>Continuously improving our platform with cutting-edge technology.</p>
            </div>
          </div>
        </div>

        <div className="about-cta">
          <h2>Ready to get started?</h2>
          <p>Join thousands of users who trust PayWise for their expense management needs.</p>
          <button className="cta-btn" onClick={() => navigate('/signup')}>
            Get Started Today
          </button>
        </div>
      </div>
    </div>
  );
};

export default About;
