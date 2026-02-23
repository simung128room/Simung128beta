import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('workout-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, _password: string) => {
    // Simple mock login
    const users = JSON.parse(localStorage.getItem('workout-users') || '[]');
    
    // Check for hardcoded admin
    if (email === 'admin@airse.ai' || email === 'ooD7822429') {
      const adminData = { id: 'admin-id', username: 'ooD7822429', email: 'admin@airse.ai', isAdmin: true };
      setUser(adminData);
      localStorage.setItem('workout-user', JSON.stringify(adminData));
      return;
    }

    const foundUser = users.find((u: any) => u.email === email || u.username === email);
    
    if (foundUser) {
      const userData = { id: foundUser.id, username: foundUser.username, email: foundUser.email, isAdmin: foundUser.username === 'ooD7822429' };
      setUser(userData);
      localStorage.setItem('workout-user', JSON.stringify(userData));
    } else {
      throw new Error('User not found');
    }
  };

  const register = async (username: string, email: string, _password: string) => {
    const users = JSON.parse(localStorage.getItem('workout-users') || '[]');
    if (users.some((u: any) => u.email === email)) {
      throw new Error('User already exists');
    }

    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      email,
    };

    users.push(newUser);
    localStorage.setItem('workout-users', JSON.stringify(users));
    
    setUser(newUser);
    localStorage.setItem('workout-user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('workout-user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
