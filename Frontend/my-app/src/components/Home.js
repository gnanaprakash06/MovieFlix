import React from 'react';
const Home = ({ onNavigate }) => {
  return (
    <div className="home-container">
      <nav className="navbar">
        <div 
          onClick={() => onNavigate('home')} 
          className="movieflix-logo"
          style={{ cursor: 'pointer' }}
        >
          MovieFlix
        </div>
        <div 
          onClick={() => onNavigate('signin')} 
          className="signin-btn"
          style={{ cursor: 'pointer' }}
        >
          Sign In
        </div>
      </nav>
      
      <div className="hero-section">
        <h1 className="hero-title">
          Unlimited movies, TV shows, and more.
        </h1>
        <h2 className="hero-subtitle">
          Watch anywhere. Cancel anytime.
        </h2>
        <button 
          onClick={() => onNavigate('signup')}
          className="get-started-btn"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default Home;