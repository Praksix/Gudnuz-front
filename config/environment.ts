import { Platform } from 'react-native';

// Configuration des environnements
export const ENV = {
  development: {
    API_BASE_URL: 'http://localhost:8080/api',
    // Pour émulateur Android, utilisez: 'http://10.0.2.2:8080/api'
    // Pour appareil physique, utilisez l'IP de votre machine
  },
  staging: {
    API_BASE_URL: 'https://staging-api.gnudnuz.com/api',
  },
  production: {
    API_BASE_URL: 'https://api.gnudnuz.com/api',
  },
};

// Environnement actuel (à changer selon votre environnement)
const currentEnv = 'development';

export const config = ENV[currentEnv as keyof typeof ENV];

// Fonction pour obtenir l'URL de l'API selon la plateforme
export const getApiUrl = () => {
  return config.API_BASE_URL;
};

// Configuration pour le développement mobile
export const getMobileApiUrl = () => {
  // Pour les tests sur émulateur Android
  if (__DEV__) {
    if (Platform.OS === 'android') {
      // Pour émulateur Android
      return 'http://10.0.2.2:8080/api';
      // Pour appareil physique Android, décommentez et remplacez par votre IP
      // return 'http://192.168.1.100:8080/api';
    } else if (Platform.OS === 'ios') {
      // Pour simulateur iOS
      return 'http://localhost:8080/api';
      // Pour appareil physique iOS, décommentez et remplacez par votre IP
      // return 'http://192.168.1.100:8080/api';
    }
  }
  
  return config.API_BASE_URL;
}; 