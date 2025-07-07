import { Image } from 'expo-image';
import { Platform, StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { router } from 'expo-router';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ListNuz } from '@/components/ListNuz';
import { useAuthContext } from '@/components/AuthContext';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useNuzs } from '@/hooks/useNuzs';

export default function HomeScreen() {
  const { user, logout } = useAuthContext();
  const currentUserId = user?.id;
  const { refresh, loading } = useNuzs({ currentUserId });

  const handleLogout = async () => {
    try {
      await logout();
      // La redirection vers la page de connexion sera automatique grâce à AuthNavigator
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <View style={styles.container}>
             <View style={styles.headerSettings}>
             <TouchableOpacity style={styles.settingsButton}>
               <IconSymbol
                 name="menu"
                 size={50}
                 color="#000000"
               />
             </TouchableOpacity>
             <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
               <Text style={styles.logoutButtonText}>Déconnexion</Text>
             </TouchableOpacity>
           </View>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
        headerImage={
          <Image
            source={require('@/assets/images/partial-react-logo.png')}
            style={styles.reactLogo}
          />
        }
        onRefresh={refresh}
        refreshing={loading}>
        <ThemedView style={styles.titleContainer}>
          <View style={styles.headerRow}>
        
            <View style={styles.titleSection}>
              <ThemedText type="title">Gudnuz du jour !</ThemedText>
              <HelloWave />
            </View>
            
          </View>
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <ListNuz currentUserId={currentUserId}></ListNuz>
        </ThemedView>
      </ParallaxScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },

  headerSettings: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'none',
    zIndex: 1000,
    margin: 10,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },

  settingsButton: {
    fontSize: 100,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
