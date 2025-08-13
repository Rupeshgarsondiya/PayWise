import React from 'react';
import '../assets/css/HowItWorks.css';

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      title: "Create a Group",
      description: "Start by creating a group for your roommates, trip, or event. Add members with their email addresses.",
      icon: "👥"
    },
    {
      id: 2,
      title: "Add Expenses",
      description: "Record shared expenses as they happen. Include the amount, description, and who paid.",
      icon: "➕"
    },
    {
      id: 3,
      title: "Split Automatically",
      description: "Our smart algorithm automatically calculates how much each person owes or is owed.",
      icon: "⚡"
    },
    {
      id: 4,
      title: "Settle Up",
      description: "Use the built-in settlement feature to mark debts as paid and keep track of balances.",
      icon: "✅"
    }
  ];

  return (
    <section className="how-it-works" id="how-it-works">
      <div className="container">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Get started in just 4 simple steps</p>
        </div>
        
        <div className="steps-container">
          {steps.map((step, index) => (
            <div key={step.id} className="step">
              <div className="step-number">{step.id}</div>
              <div className="step-content">
                <div className="step-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
              {index < steps.length - 1 && <div className="step-connector"></div>}
            </div>
          ))}
        </div>

        <div className="how-it-works-cta">
          <h3>Ready to simplify your expense tracking?</h3>
          <button className="btn btn-primary btn-large">Start Your First Group</button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
