import React from 'react';
import { useNavigate } from 'react-router-dom';
import newExpenseImage from '../Photos/new-expense.webp';
import debtImage from '../Photos/debt.jpg';
import graphImage from '../Photos/graph.webp';
import '../assets/css/Features.css';

const Features = () => {
  const navigate = useNavigate();

  const handleCreateAccount = () => {
    navigate('/signup');
  };

  const features = [
    {
      id: 1,
      title: "Easy Expense Entry",
      description: "Add new expenses in seconds with our intuitive interface. Support for multiple currencies and categories.",
      image: newExpenseImage,
      icon: "💰"
    },
    {
      id: 2,
      title: "Smart Debt Tracking",
      description: "Automatically calculate who owes what to whom. Never lose track of shared expenses again.",
      image: debtImage,
      icon: "📊"
    },
    {
      id: 3,
      title: "Visual Analytics",
      description: "Beautiful charts and reports to understand your spending patterns and group expenses.",
      image: graphImage,
      icon: "📈"
    }
  ];

  return (
    <section className="features" id="features">
      <div className="container">
        <div className="section-header">
          <h2>Why Choose Paywise?</h2>
          <p>Powerful features designed to make expense tracking simple and efficient</p>
        </div>
        
        <div className="features-grid">
          {features.map((feature) => (
            <div key={feature.id} className="feature-card">
              <div className="feature-image">
                <img src={feature.image} alt={feature.title} />
              </div>
              <div className="feature-content">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="features-cta">
          <h3>Ready to get started?</h3>
          <p>Join thousands of users who are already tracking their expenses efficiently</p>
          <button className="btn btn-primary btn-large" onClick={handleCreateAccount}>Create Free Account</button>
        </div>
      </div>
    </section>
  );
};

export default Features;
