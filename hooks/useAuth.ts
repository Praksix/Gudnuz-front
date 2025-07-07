import { useState, useEffect, useCallback } from 'react';
import { authService, User, LoginRequest, RegisterRequest } from '../services/authService';

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Vérifier l'état d'authentification au démarrage
  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const isLoggedIn = await authService.isLoggedIn();
      
      if (isLoggedIn) {
        const userData = await authService.getUserData();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Erreur lors de la vérification de l\'authentification:', err);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Connexion
  const login = useCallback(async (credentials: LoginRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const authData = await authService.login(credentials);
      setUser(authData.user);
      setIsAuthenticated(true);
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Erreur lors de la connexion';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Inscription
  const register = useCallback(async (userData: RegisterRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const authData = await authService.register(userData);
      setUser(authData.user);
      setIsAuthenticated(true);
      
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Erreur lors de l\'inscription';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Déconnexion
  const logout = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Erreur lors de la déconnexion';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effacer les erreurs
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Vérifier l'authentification au montage du composant
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };
}; 