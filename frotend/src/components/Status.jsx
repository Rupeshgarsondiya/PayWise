import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../Photos/logo.png';
import '../assets/css/Status.css';

const Status = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="status-page">
      <div className="status-header">
        <div className="status-logo">
          <img src={logo} alt="PayWise Logo" />
          <h1>PayWise</h1>
        </div>
        <button className="back-btn" onClick={handleBackToHome}>
          ← Back to Home
        </button>
      </div>

      <div className="status-content">
        <div className="status-hero">
          <h1>System Status</h1>
          <p>Real-time updates on PayWise services and performance</p>
        </div>

        <div className="status-overview">
          <div className="status-indicator operational">
            <div className="status-dot"></div>
            <div className="status-text">
              <h3>All Systems Operational</h3>
              <p>Last updated: Just now</p>
            </div>
          </div>
        </div>

        <div className="status-section">
          <h2>Service Status</h2>
          <div className="service-grid">
            <div className="service-item operational">
              <div className="service-header">
                <h3>Web Application</h3>
                <span className="status-badge operational">Operational</span>
              </div>
              <p>Main web interface and dashboard</p>
              <div className="uptime">Uptime: 99.9%</div>
            </div>
            
            <div className="service-item operational">
              <div className="service-header">
                <h3>Mobile App</h3>
                <span className="status-badge operational">Operational</span>
              </div>
              <p>iOS and Android applications</p>
              <div className="uptime">Uptime: 99.8%</div>
            </div>
            
            <div className="service-item operational">
              <div className="service-header">
                <h3>API Services</h3>
                <span className="status-badge operational">Operational</span>
              </div>
              <p>Backend services and integrations</p>
              <div className="uptime">Uptime: 99.9%</div>
            </div>
            
            <div className="service-item operational">
              <div className="service-header">
                <h3>Payment Processing</h3>
                <span className="status-badge operational">Operational</span>
              </div>
              <p>Transaction processing and settlements</p>
              <div className="uptime">Uptime: 99.9%</div>
            </div>
          </div>
        </div>

        <div className="status-section">
          <h2>Recent Incidents</h2>
          <div className="incidents-list">
            <div className="incident-item resolved">
              <div className="incident-header">
                <span className="incident-status resolved">Resolved</span>
                <span className="incident-date">Dec 15, 2024</span>
              </div>
              <h3>Scheduled Maintenance</h3>
              <p>Routine system maintenance completed successfully. All services are now running normally.</p>
            </div>
            
            <div className="incident-item resolved">
              <div className="incident-header">
                <span className="incident-status resolved">Resolved</span>
                <span className="incident-date">Nov 28, 2024</span>
              </div>
              <h3>Performance Optimization</h3>
              <p>Database optimization completed. Response times improved by 15% across all services.</p>
            </div>
            
            <div className="incident-item resolved">
              <div className="incident-header">
                <span className="incident-status resolved">Resolved</span>
                <span className="incident-date">Nov 10, 2024</span>
              </div>
              <h3>Security Update</h3>
              <p>Security patches applied successfully. No user data was compromised.</p>
            </div>
          </div>
        </div>

        <div className="status-section">
          <h2>Performance Metrics</h2>
          <div className="metrics-grid">
            <div className="metric-item">
              <h3>Response Time</h3>
              <div className="metric-value">45ms</div>
              <p>Average API response time</p>
            </div>
            <div className="metric-item">
              <h3>Uptime</h3>
              <div className="metric-value">99.9%</div>
              <p>Monthly uptime percentage</p>
            </div>
            <div className="metric-item">
              <h3>Active Users</h3>
              <div className="metric-value">50K+</div>
              <p>Daily active users</p>
            </div>
            <div className="metric-item">
              <h3>Transactions</h3>
              <div className="metric-value">1M+</div>
              <p>Monthly processed transactions</p>
            </div>
          </div>
        </div>

        <div className="status-cta">
          <h2>Stay Updated</h2>
          <p>Get notified about service updates and incidents via email or SMS.</p>
          <button className="cta-btn" onClick={() => navigate('/signup')}>
            Subscribe to Updates
          </button>
        </div>
      </div>
    </div>
  );
};

export default Status;
