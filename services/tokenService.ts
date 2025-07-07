import AsyncStorage from '@react-native-async-storage/async-storage';

// Clés pour AsyncStorage
const STORAGE_KEYS = {
  USER_TOKEN: 'user_token',
  USER_DATA: 'user_data',
  IS_LOGGED_IN: 'is_logged_in',
};

// Service de gestion des tokens
export const tokenService = {
  // Récupérer le token
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      return null;
    }
  },

  // Sauvegarder le token
  async saveToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du token:', error);
      throw error;
    }
  },

  // Supprimer le token
  async clearToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
    } catch (error) {
      console.error('Erreur lors de la suppression du token:', error);
      throw error;
    }
  },

  // Vérifier si l'utilisateur est connecté
  async isLoggedIn(): Promise<boolean> {
    try {
      const isLoggedIn = await AsyncStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
      const token = await this.getToken();
      
      return isLoggedIn === 'true' && !!token;
    } catch (error) {
      console.error('Erreur lors de la vérification de connexion:', error);
      return false;
    }
  },

  // Récupérer les données utilisateur
  async getUserData(): Promise<any | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
      return null;
    }
  },

  // Sauvegarder les données utilisateur
  async saveUserData(userData: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      await AsyncStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données utilisateur:', error);
      throw error;
    }
  },

  // Supprimer toutes les données utilisateur
  async clearUserData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.USER_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA),
        AsyncStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN),
      ]);
    } catch (error) {
      console.error('Erreur lors de la suppression des données utilisateur:', error);
      throw error;
    }
  },
}; 