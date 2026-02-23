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
    const initAuth = async () => {
      const savedUser = localStorage.getItem('workout-user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        try {
          const res = await fetch(`/api/auth/me?id=${parsed.id}`);
          const contentType = res.headers.get("content-type");
          
          if (res.ok && contentType && contentType.includes("application/json")) {
            const userData = await res.json();
            setUser(userData);
            localStorage.setItem('workout-user', JSON.stringify(userData));
          } else {
            console.warn("Auth check failed or returned non-JSON. Logging out.");
            logout();
          }
        } catch (err) {
          console.error('Auth verification failed', err);
          setUser(parsed); // Fallback to local if server is down
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Login failed');
    }

    const userData = await res.json();
    setUser(userData);
    localStorage.setItem('workout-user', JSON.stringify(userData));
  };

  const register = async (username: string, email: string, password: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Registration failed');
    }

    const userData = await res.json();
    setUser(userData);
    localStorage.setItem('workout-user', JSON.stringify(userData));
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
