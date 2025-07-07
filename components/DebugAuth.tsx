import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuthContext } from './AuthContext';
import { tokenService } from '../services/tokenService';

export const DebugAuth = () => {
  const { isAuthenticated, isLoading, user, checkAuthStatus, logout } = useAuthContext();

  const handleDebugAuth = async () => {
    console.log('🔍 === DÉBOGAGE AUTHENTIFICATION ===');
    console.log('État actuel:', { isAuthenticated, isLoading, user: user ? 'Présent' : 'Absent' });
    
    try {
      const token = await tokenService.getToken();
      console.log('Token stocké:', token ? 'Oui' : 'Non');
      
      const userData = await tokenService.getUserData();
      console.log('Données utilisateur stockées:', userData ? 'Oui' : 'Non');
      
      const isLoggedIn = await tokenService.isLoggedIn();
      console.log('isLoggedIn (tokenService):', isLoggedIn);
      
      await checkAuthStatus();
    } catch (error) {
      console.error('Erreur lors du débogage:', error);
    }
  };

  const handleForceLogout = async () => {
    console.log('🔄 Forçage de la déconnexion...');
    await logout();
  };

  const handleClearStorage = async () => {
    console.log('🗑️ Nettoyage du stockage...');
    await tokenService.clearUserData();
    await checkAuthStatus();
  };

  if (!__DEV__) return null; // Seulement en mode développement

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 Debug Authentification</Text>
      <Text style={styles.status}>
        État: {isLoading ? 'Chargement...' : isAuthenticated ? 'Connecté' : 'Déconnecté'}
      </Text>
      {user && (
        <Text style={styles.userInfo}>
          Utilisateur: {user.username} ({user.email})
        </Text>
      )}
      
      <TouchableOpacity style={styles.button} onPress={handleDebugAuth}>
        <Text style={styles.buttonText}>🔍 Vérifier l'état</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={handleForceLogout}>
        <Text style={styles.buttonText}>🚪 Forcer déconnexion</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={handleClearStorage}>
        <Text style={styles.buttonText}>🗑️ Nettoyer stockage</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 8,
    minWidth: 200,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  status: {
    color: 'white',
    fontSize: 12,
    marginBottom: 5,
  },
  userInfo: {
    color: 'white',
    fontSize: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 4,
    marginBottom: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
}); 