import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useNuzs } from '@/hooks/useNuzs';
import { useAuthContext } from '@/components/AuthContext';

export default function NuzDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuthContext();
  const currentUserId = user?.id;
  const { nuzs, hasUserVoted, getVoteCount, handleVote } = useNuzs({ currentUserId });
  const [nuz, setNuz] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && nuzs.length > 0) {
      const foundNuz = nuzs.find(n => n.id === id);
      if (foundNuz) {
        setNuz(foundNuz);
      }
      setLoading(false);
    }
  }, [id, nuzs]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'À l\'instant';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInHours < 48) return 'Hier';
    if (diffInHours > 48) return 'Il y a quelques jours';
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays}j`;
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDING':
        return styles.statusPENDING;
      case 'ELECTED':
        return styles.statusELECTED;
      case 'EN_ATTENTE':
        return styles.statusEN_ATTENTE;
      default:
        return styles.statusPENDING;
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Chargement du Nuz...</Text>
      </View>
    );
  }

  if (!nuz) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Nuz non trouvé</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isLiked = hasUserVoted(nuz.id);
  const voteCount = getVoteCount(nuz.id);

  return (
    <View style={styles.container}>
      {/* Header avec bouton retour */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <IconSymbol name="arrow-left" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{nuz.title}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Titre */}
        <View style={styles.titleSection}>
          {nuz.status === 'ELECTED' && (
            <View style={styles.crownContainer}>
              <Text style={styles.crownIcon}>👑</Text>
              <Text style={styles.electedBadge}>NUZ ÉLU</Text>
            </View>
          )}
        </View>

        {/* Contenu complet */}
        <View style={styles.contentSection}>
          <Text style={styles.contentText}>{nuz.content}</Text>
        </View>

        {/* Informations de l'auteur et date */}
        <View style={styles.metaSection}>
          <Text style={styles.author}>Par {nuz.authorUsername}</Text>
          <Text style={styles.date}>{formatDate(nuz.createdAt)}</Text>
        </View>

        {/* Statut */}
        <View style={styles.statusSection}>
          <Text style={[styles.status, getStatusStyle(nuz.status)]}>
            {nuz.status === 'PENDING' ? 'En attente' : 
             nuz.status === 'ELECTED' ? 'Élu' : 'En attente'}
          </Text>
        </View>

        {/* Bouton de vote */}
        <View style={styles.voteSection}>
          <TouchableOpacity 
            style={[styles.likeButton, isLiked && styles.likedButton]} 
            onPress={() => handleVote(nuz.id)}
            activeOpacity={0.7}
          >
            <Image 
              source={isLiked ? require('../assets/images/heartfull.png') : require('../assets/images/heart.png')}
              style={[styles.likeIcon, isLiked && styles.likedIcon]}
            />
            <Text style={[styles.voteCount, isLiked && styles.likedText]}>
              {voteCount} vote{voteCount > 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
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
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#000',
  },
  headerSpacer: {
    width: 24,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  titleSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
    lineHeight: 36,
  },
  crownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  crownIcon: {
    fontSize: 24,
  },
  electedBadge: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
    backgroundColor: '#FFF8DC',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  contentSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  metaSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  author: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  date: {
    fontSize: 14,
    color: '#999',
  },
  statusSection: {
    marginBottom: 24,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusPENDING: {
    backgroundColor: '#FFF3CD',
    color: '#856404',
  },
  statusELECTED: {
    backgroundColor: '#D4EDDA',
    color: '#155724',
  },
  statusEN_ATTENTE: {
    backgroundColor: '#F8D7DA',
    color: '#721C24',
  },
  voteSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  likedButton: {
    backgroundColor: '#FFE6E6',
  },
  likeIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  likedIcon: {
    tintColor: '#FF3B30',
  },
  voteCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  likedText: {
    color: '#FF3B30',
  },
}); 