import React, { useState } from 'react';
import Home from './components/Home';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Footer from './components/Footer';
import MovieService from './services/MovieService';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('home');
   const [passwordResetEmail, setPasswordResetEmail] = useState('');

  const onNavigate = (view) => {
    setCurrentView(view);
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Home onNavigate={onNavigate} />;
      case 'signin':
        return <SignIn onNavigate={onNavigate} />;
      case 'signup':
        return <SignUp onNavigate={onNavigate} />;
      case 'forgotPassword':
        return (
          <ForgotPassword
            onOTPSent={(email) => {
              setPasswordResetEmail(email);
              setCurrentView('resetPassword');
            }}
            onBack={() => setCurrentView('login')}
          />
        );
      case 'resetPassword':
        return (
          <ResetPassword
            email={passwordResetEmail}
            onSuccess={() => {
              alert('Password reset successfully! Please login with your new password.');
              setCurrentView('login');
            }}
            onBack={() => setCurrentView('forgotPassword')}
          />
        );
      case 'movieservice':
        return <MovieService userEmail={window.userEmail} onNavigate={onNavigate} />;
      default:
        return <Home onNavigate={onNavigate} />;
    }
  };

  return (
    <div className="App">

            {renderView()}

      {/* Conditionally render Footer - don't show on dashboard, login, or signup pages */}
      {!['home', 'login', 'signup', 'signin'].includes(currentView) && <Footer />}
      

    </div>
  );
}

export default App;