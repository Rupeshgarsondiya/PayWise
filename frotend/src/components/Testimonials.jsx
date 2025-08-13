import React from 'react';
import '../assets/css/Testimonials.css';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      quote: "Your product is really well designed and intuitive to use. I've been using it for months now and I keep noticing new features, thank you!",
      name: "Sarah Alexander",
      handle: "@sarahalexander",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 2,
      quote: "Loving the app so far. Making the switch over from Splitwise... I had heard about your app on Reddit. So far it's met all my needs!",
      name: "Terrence Snape",
      handle: "@terrencesnape",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 3,
      quote: "I appreciate your commitment to high quality but accessible budgeting tools and software. I found you from your comments on Reddit and I really appreciate it.",
      name: "Bryce Pong",
      handle: "@brycepong",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 4,
      quote: "Thanks for making this website, I completely am hooked now. Perfect! Bye bye Splitwise! Thank you, really, it is a lifesaver!",
      name: "Susanna Banko",
      handle: "@zsuszi",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 5,
      quote: "I just started to use your beautiful app and I love it so far. Incredibly intuitive and easy to use. Thank you!",
      name: "Lauren Doyle",
      handle: "@laurendoyle",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 6,
      quote: "My only feedback for now is that UX of your app is way better compared to Splitwise, appreciate your work man!",
      name: "Martin Moroka",
      handle: "@martinmoroka",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
    }
  ];

  return (
    <section className="testimonials" id="testimonials">
      <div className="container">
        <div className="testimonials-header">
          <h3 className="testimonials-subtitle">Testimonials</h3>
          <h2 className="testimonials-title">Trusted by thousands</h2>
        </div>
        
        <div className="testimonials-grid">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="testimonial-content">
                <p className="testimonial-quote">"{testimonial.quote}"</p>
                <div className="testimonial-author">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="author-avatar"
                  />
                  <div className="author-info">
                    <h4 className="author-name">{testimonial.name}</h4>
                    <p className="author-handle">{testimonial.handle}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
