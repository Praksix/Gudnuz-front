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
    
    // Si l'erreur est 401 (non autorisé) et qu'on n'a pas déjà tenté de rafraîchir le token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Pour l'instant, on déconnecte directement l'utilisateur
        // Vous pouvez implémenter le rafraîchissement de token plus tard
        await tokenService.clearUserData();
        console.error('Token expiré, déconnexion automatique');
      } catch (refreshError) {
        console.error('Erreur lors de la déconnexion:', refreshError);
      }
    }
    
    // Amélioration de la gestion des erreurs
    if (error.code === 'ECONNABORTED') {
      console.error('Erreur API: Timeout - La requête a pris trop de temps');
    } else if (error.response) {
      console.error('Erreur API:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url
      });
    } else if (error.request) {
      console.error('Erreur API: Pas de réponse du serveur - Vérifiez votre connexion');
    } else {
      console.error('Erreur API:', error.message);
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