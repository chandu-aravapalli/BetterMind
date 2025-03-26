import { useState, useEffect } from 'react';
import { authService, User, SignupCredentials } from '@/services/api';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = authService.getToken();
      if (token) {
        const userData = await authService.getCurrentUser(token);
        setUser(userData);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Authentication failed');
      }
      authService.removeToken();
    } finally {
      setLoading(false);
    }
  };

  const signup = async (credentials: SignupCredentials) => {
    try {
      setLoading(true);
      setError(null);
      const userData = await authService.signup(credentials);
      // After successful signup, automatically login
      const response = await authService.login({
        email: credentials.email,
        password: credentials.password,
      });
      authService.setToken(response.access_token);
      setUser(userData);
      return userData;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Signup failed');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login({ email, password });
      authService.setToken(response.access_token);
      const userData = await authService.getCurrentUser(response.access_token);
      setUser(userData);
      return userData;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.removeToken();
    setUser(null);
  };

  return {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    isAuthenticated: authService.isAuthenticated(),
  };
} 