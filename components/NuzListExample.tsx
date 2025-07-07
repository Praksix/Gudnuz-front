import React from 'react';
import { View, StyleSheet, Text, Alert, TouchableOpacity } from 'react-native';
import { ListNuz } from './ListNuz';
import { useAuth } from '../hooks/useAuth';

interface NuzListExampleProps {
  currentUserId?: string;
}

export const NuzListExample = ({ currentUserId }: NuzListExampleProps): React.ReactElement => {
  const { logout, user } = useAuth();

  const handleError = (error: string) => {
    Alert.alert('Erreur', error);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive',
          onPress: logout 
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Gnudnuz</Text>
            <Text style={styles.subtitle}>Découvrez les meilleurs Nuz</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Déconnexion</Text>
          </TouchableOpacity>
        </View>
        {user && (
          <Text style={styles.userInfo}>Connecté en tant que {user.username}</Text>
        )}
      </View>
      
      <ListNuz 
        currentUserId={currentUserId}
        autoRefresh={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  logoutButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  userInfo: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
}); 