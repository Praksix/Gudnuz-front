import { apiClient, ApiResponse } from './api';
import { tokenService } from './tokenService';
import { SECRETS, isTokenExpired, getTokenInfo } from '../config/secrets';

// Types pour l'authentification
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Clés pour AsyncStorage
const STORAGE_KEYS = {
  USER_TOKEN: 'user_token',
  USER_DATA: 'user_data',
  IS_LOGGED_IN: 'is_logged_in',
};

// Service d'authentification
export const authService = {
  // Connexion
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(SECRETS.AUTH_ENDPOINTS.LOGIN, credentials);
      
      // Validation de la réponse
      if (!response.data || !response.data.data) {
        throw new Error('Réponse API invalide: données manquantes');
      }
      
      const authData = response.data.data;
      
      // Validation des données d'authentification
      if (!authData.token || !authData.user) {
        throw new Error('Données d\'authentification incomplètes');
      }
      
      // Vérifier si le token est valide
      if (isTokenExpired(authData.token)) {
        throw new Error('Token reçu est déjà expiré');
      }
      
      // Log des informations du token en mode debug
      if (__DEV__) {
        const tokenInfo = getTokenInfo(authData.token);
        console.log('Token info:', tokenInfo);
      }
      
      // Sauvegarder les données utilisateur
      await this.saveUserData(authData);
      
      return authData;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  },

  // Inscription
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(SECRETS.AUTH_ENDPOINTS.REGISTER, userData);
      
      // Validation de la réponse
      if (!response.data || !response.data.data) {
        throw new Error('Réponse API invalide: données manquantes');
      }
      
      const authData = response.data.data;
      
      // Validation des données d'authentification
      if (!authData.token || !authData.user) {
        throw new Error('Données d\'authentification incomplètes');
      }
      
      // Vérifier si le token est valide
      if (isTokenExpired(authData.token)) {
        throw new Error('Token reçu est déjà expiré');
      }
      
      // Log des informations du token en mode debug
      if (__DEV__) {
        const tokenInfo = getTokenInfo(authData.token);
        console.log('Token info:', tokenInfo);
      }
      
      // Sauvegarder les données utilisateur
      await this.saveUserData(authData);
      
      return authData;
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    }
  },

  // Déconnexion
  async logout(): Promise<void> {
    try {
      // Appel API pour invalider le token (optionnel)
      const token = await tokenService.getToken();
      if (token) {
        await apiClient.post(SECRETS.AUTH_ENDPOINTS.LOGOUT, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      // Supprimer les données locales
      await this.clearUserData();
    }
  },

  // Vérifier si l'utilisateur est connecté
  async isLoggedIn(): Promise<boolean> {
    try {
      const token = await tokenService.getToken();
      if (!token) return false;
      
      // Vérifier si le token n'est pas expiré
      if (isTokenExpired(token)) {
        await this.clearUserData();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la vérification de connexion:', error);
      return false;
    }
  },

  // Récupérer les données utilisateur
  async getUserData(): Promise<User | null> {
    return await tokenService.getUserData();
  },

  // Récupérer le token
  async getToken(): Promise<string | null> {
    const token = await tokenService.getToken();
    
    // Vérifier si le token est expiré
    if (token && isTokenExpired(token)) {
      console.log('Token expiré, suppression des données');
      await this.clearUserData();
      return null;
    }
    
    return token;
  },

  // Sauvegarder les données utilisateur
  async saveUserData(authData: AuthResponse): Promise<void> {
    try {
      // Validation des données avant sauvegarde
      if (!authData || !authData.token || !authData.user) {
        throw new Error('Données d\'authentification invalides pour la sauvegarde');
      }
      
      await Promise.all([
        tokenService.saveToken(authData.token),
        tokenService.saveUserData(authData.user),
      ]);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données utilisateur:', error);
      throw error;
    }
  },

  // Supprimer les données utilisateur
  async clearUserData(): Promise<void> {
    return await tokenService.clearUserData();
  },

  // Rafraîchir le token (optionnel)
  async refreshToken(): Promise<string | null> {
    try {
      const response = await apiClient.post<ApiResponse<{ token: string }>>(SECRETS.AUTH_ENDPOINTS.REFRESH);
      
      // Validation de la réponse
      if (!response.data || !response.data.data || !response.data.data.token) {
        throw new Error('Réponse de rafraîchissement invalide');
      }
      
      const newToken = response.data.data.token;
      
      // Vérifier si le nouveau token est valide
      if (isTokenExpired(newToken)) {
        throw new Error('Nouveau token expiré');
      }
      
      await tokenService.saveToken(newToken);
      return newToken;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      await this.clearUserData();
      return null;
    }
  },
}; 