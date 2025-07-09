import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { nuzService } from '../../services/nuzService';
import { authService } from '../../services/authService';

export default function CreateNuzScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Note: On n'utilise pas useNuzs ici car on veut rafraîchir la page d'accueil
  // qui a sa propre instance du hook

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const userData = await authService.getUserData();
        if (userData) {
          setCurrentUserId(userData.id);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      }
    };
    getCurrentUser();
  }, []);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir le titre et le contenu');
      return;
    }

    if (!currentUserId) {
      Alert.alert('Erreur', 'Vous devez être connecté pour publier un Nuz');
      return;
    }

    setLoading(true);
    try {
      await nuzService.createNuz({
        title: title.trim(),
        content: content.trim(),
        authorId: currentUserId,
      });
      
      Alert.alert(
        'Succès',
        'Votre Nuz a été publié avec succès !',
        [
          {
            text: 'OK',
            onPress: () => {
              setTitle('');
              setContent('');
              setAuthor('');
              
              console.log('✅ Nuz publié avec succès, retour à la page d\'accueil');
              
              // Retourner à la page d'accueil avec paramètre de rafraîchissement
              router.push('/(tabs)?refresh=true');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Erreur lors de la création du Nuz:', error);
      Alert.alert('Erreur', 'Impossible de publier le Nuz. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (title.trim() || content.trim()) {
      Alert.alert(
        'Annuler',
        'Voulez-vous vraiment annuler ? Vos modifications seront perdues.',
        [
          { text: 'Continuer l\'édition', style: 'cancel' },
          { text: 'Annuler', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouveau Nuz</Text>
        <TouchableOpacity 
          onPress={handleSubmit} 
          style={[styles.publishButton, (!title.trim() || !content.trim() || loading) && styles.publishButtonDisabled]}
          disabled={!title.trim() || !content.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.publishButtonText}>Publier</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Titre</Text>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={text => setTitle(text)}
            placeholder="Donnez un titre accrocheur à votre Nuz..."
            placeholderTextColor="#999"
            maxLength={100}
            multiline
          />
          <Text style={styles.characterCount}>{title.length}/100</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Contenu</Text>
          <TextInput
            style={styles.contentInput}
            value={content}
            onChangeText={setContent}
            placeholder="Racontez votre histoire, partagez votre expérience..."
            placeholderTextColor="#999"
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Qu'est-ce qu'une bonne Nuz :</Text>
          <Text style={styles.tip}>• Une citation inspirante</Text>
          <Text style={styles.tip}>• Une information utile et importante</Text>
          <Text style={styles.tip}>• Une blague</Text>
          <Text style={styles.tip}>• N'importe quoi qui puisse créer un sourire</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  publishButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  publishButtonDisabled: {
    backgroundColor: '#ccc',
  },
  publishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  titleInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: '500',
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#e9ecef',
    minHeight: 60,
  },
  contentInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#e9ecef',
    minHeight: 200,
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  tipsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  tip: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    lineHeight: 20,
  },
}); 