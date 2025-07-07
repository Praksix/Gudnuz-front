import { Image } from 'expo-image';
import { Platform, StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { router } from 'expo-router';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ListNuz } from '@/components/ListNuz';

export default function HomeScreen() {
  const handleCreateNuz = () => {
    router.push('/create-nuz');
  };

  return (
    <View style={styles.container}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
        headerImage={
          <Image
            source={require('@/assets/images/partial-react-logo.png')}
            style={styles.reactLogo}
          />
        }>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Gudnuz du jour !</ThemedText>
          <HelloWave />
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <ListNuz></ListNuz>
        </ThemedView>
      </ParallaxScrollView>
      
      <TouchableOpacity style={styles.floatingButton} onPress={handleCreateNuz} activeOpacity={0.8}>
        <Text style={styles.floatingButtonText}>+</Text>
        <Text style={styles.floatingButtonLabel}>Proposer une Gud Nuz</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#007AFF',
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  floatingButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 8,
  },
  floatingButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
