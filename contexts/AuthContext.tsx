import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState } from 'react';

import { checkAuthService, loginService, logoutService, registerService } from '../service/authService';

interface User {
  id: string;
  fullName: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const data = await checkAuthService();
      setUser(data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // login
  const login = async (email: string, password: string): Promise<void> => {
    const data = await loginService({ email, password });

    // store token
    await SecureStore.setItemAsync('accessToken', data.accessToken);

    setUser(data.user);
  };

  // signup
  const signup = async (name: string, email: string, password: string): Promise<void> => {
    const data = await registerService({
      fullName: name,
      email,
      password,
    });

    await SecureStore.setItemAsync('accessToken', data.accessToken);

    setUser(data.user);
  };

  // logout
  const logout = async () => {
    await logoutService();
    await SecureStore.deleteItemAsync('accessToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
