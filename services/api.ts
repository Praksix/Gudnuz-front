import axios from 'axios';
import { getMobileApiUrl } from '../config/environment';
import { tokenService } from './tokenService';

// Configuration de base de l'API
const API_BASE_URL = getMobileApiUrl();

// Instance axios configurée avec un timeout plus long pour le développement
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Augmenté à 30 secondes pour le développement
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter automatiquement le token d'authentification
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await tokenService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs et le rafraîchissement de token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = error.config?.url;
    
    // Ignorer les erreurs 403/401 pour certains endpoints non critiques
    const isNonCriticalEndpoint = url?.includes('/auth/logout') || url?.includes('/votes/check');
    
    // Si l'erreur est 401 (non autorisé) et qu'on n'a pas déjà tenté de rafraîchir le token
    // ET que ce n'est pas un endpoint d'authentification
    if (status === 401 && !originalRequest._retry && !url?.includes('/auth/')) {
      originalRequest._retry = true;
      
      try {
        // Vérifier si le token existe et est expiré avant de déconnecter
        const token = await tokenService.getToken();
        if (token) {
          await tokenService.clearUserData();
          console.log('🔐 Token expiré, déconnexion automatique');
        }
      } catch (refreshError) {
        console.error('❌ Erreur lors de la déconnexion:', refreshError);
      }
    }
    
    // Gestion des erreurs avec filtrage pour les endpoints non critiques
    if (error.code === 'ECONNABORTED') {
      console.error('⏰ Erreur API: Timeout - La requête a pris trop de temps');
    } else if (error.response) {
      // Ne pas logger les erreurs 403/401 pour les endpoints non critiques
      if (!isNonCriticalEndpoint || (status !== 403 && status !== 401)) {
        console.error('❌ Erreur API:', {
          status: status,
          data: error.response.data,
          url: url
        });
      } else {
        console.log(`ℹ️ Erreur ${status} pour ${url} (non critique)`);
      }
    } else if (error.request) {
      console.error('🌐 Erreur API: Pas de réponse du serveur - Vérifiez votre connexion');
    } else {
      console.error('❌ Erreur API:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Types pour les réponses API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Configuration pour le développement mobile
// Note: Pour les tests sur émulateur Android, utilisez 10.0.2.2 au lieu de localhost
// Pour les tests sur appareil physique, utilisez l'IP de votre machine
export const getApiUrl = () => {
  // Vous pouvez changer cette URL selon votre environnement
  return API_BASE_URL;
}; 