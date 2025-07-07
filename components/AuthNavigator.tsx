import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuthContext } from './AuthContext';
import { LoginScreen } from './LoginScreen';
import { NuzListExample } from './NuzListExample';

export const AuthNavigator = (): React.ReactElement => {
  const { isAuthenticated, isLoading, user } = useAuthContext();

  // Affichage du loader pendant la vérification de l'authentification
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Affichage de la page de connexion si non authentifié
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Affichage de l'application principale si authentifié
  return <NuzListExample currentUserId={user?.id} />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
}); 