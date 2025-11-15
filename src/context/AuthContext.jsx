// context/AuthContext.jsx
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [authStep, setAuthStep] = useState('login'); // login, register, forgotPassword, resetPassword
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const openAuth = (step = 'login') => {
    setAuthStep(step);
    setIsAuthOpen(true);
  };

  const closeAuth = () => {
    setIsAuthOpen(false);
    setAuthStep('login');
  };

  const value = {
    currentUser,
    setCurrentUser,
    authStep,
    setAuthStep,
    isAuthOpen,
    openAuth,
    closeAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};