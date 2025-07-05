import React, { useState, useEffect } from "react";
import Home from "./components/Home";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import Footer from "./components/Footer";
import MovieService from "./services/MovieService";
import "./App.css";
import { checkAuth } from "./services/authService";
import { getUserEmail } from "./services/authService";

function App() {
  const [currentView, setCurrentView] = useState("home");
  const [passwordResetEmail, setPasswordResetEmail] = useState("");

  // [FIX]: Add useEffect to check auth state on initial load
  useEffect(() => {
    const { isAuthenticated } = checkAuth();
    if (isAuthenticated) {
      setCurrentView("movieservice");
    }
  }, []);

  const onNavigate = (view) => {
    setCurrentView(view);
  };

  const renderView = () => {
    switch (currentView) {
      case "home":
        return <Home onNavigate={onNavigate} />;
      case "signin":
        return <SignIn onNavigate={onNavigate} />;
      case "signup":
        return <SignUp onNavigate={onNavigate} />;

      case "movieservice":
        return (
          <MovieService userEmail={getUserEmail()} onNavigate={onNavigate} />
        );
      default:
        return <Home onNavigate={onNavigate} />;
    }
  };

  return (
    <div className="App">
      {renderView()}

      {/* Conditionally render Footer - don't show on dashboard, login, or signup pages */}
      {!["home", "login", "signup", "signin"].includes(currentView) && (
        <Footer />
      )}
    </div>
  );
}

export default App;
