'use client';

import { createContext, useContext, useState, useEffect } from 'react';

type User = {
  id: number;
  username: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  jwt: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {

  const [user, setUser] = useState<User | null>(null);
  const [jwt, setJwt] = useState<string | null>(null);

  useEffect(() => {

    const token = localStorage.getItem('jwt');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      setJwt(token);
      setUser(JSON.parse(storedUser));
    }

  }, []);

  const login = (user: User, token: string) => {

    setUser(user);
    setJwt(token);

    localStorage.setItem('jwt', token);
    localStorage.setItem('user', JSON.stringify(user));

  };

  const logout = () => {

    setUser(null);
    setJwt(null);

    localStorage.removeItem('jwt');
    localStorage.removeItem('user');

  };

  return (
    <AuthContext.Provider value={{ user, jwt, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {

  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;

};