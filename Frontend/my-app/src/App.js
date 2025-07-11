import React, { useState, useEffect } from "react";
import Home from "./components/Home";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import Footer from "./components/Footer";
import MovieService from "./services/MovieService";
import "./App.css";
import { checkAuth } from "./services/authService";
import { getUserEmail } from "./services/authService";

function App() {
  const [currentView, setCurrentView] = useState("home");
  const [navigationData, setNavigationData] = useState(null);
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    userEmail: null,
    username: null
  });

  useEffect(() => {
    const authInfo = checkAuth();
    setAuthState(authInfo);
    if (authInfo.isAuthenticated) {
      setCurrentView("movieservice");
    }
  }, []);

  const onNavigate = (view, data) => {
    setCurrentView(view);
    if (data) {
      setNavigationData(data);
    } else {
      setNavigationData(null);
    }

    if (view === "movieservice") {
      const authInfo = checkAuth();
      setAuthState(authInfo);
    } else if (view === "signin" || view === "signup") {
      setAuthState({
        isAuthenticated: false,
        userEmail: null,
        username: null
      });
    } else if (view === "home") {
      const authInfo = checkAuth();
      setAuthState(authInfo);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case "home":
        return <Home onNavigate={onNavigate} />;
      case "signin":
        return <SignIn onNavigate={onNavigate} />;
      case "signup":
        return <SignUp onNavigate={onNavigate} />;
      case "forgotpassword":
        return <ForgotPassword onNavigate={onNavigate} />;
      case "resetpassword":
        return (
          <ResetPassword
            onNavigate={onNavigate}
            email={navigationData?.email}
          />
        );
      case "movieservice":
        return (
          <MovieService
            userEmail={getUserEmail()}
            onNavigate={onNavigate}
          />
        );
      default:
        return <Home onNavigate={onNavigate} />;
    }
  };

  const viewsWithFooter = ["movieservice"];

  return (
    <div className="App">
      {renderView()}
      {viewsWithFooter.includes(currentView) && <Footer />}
    </div>
  );
}

export default App;