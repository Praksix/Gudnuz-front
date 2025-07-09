import React, { useEffect } from 'react';
import { ListRenderItemInfo, StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { router } from 'expo-router';
import { useNuzs } from '../hooks/useNuzs';
import { Nuz } from '../services/nuzService';

interface ListNuzProps {
  currentUserId?: string;
  autoRefresh?: boolean;
}

export const ListNuz = ({ currentUserId, autoRefresh = false }: ListNuzProps): React.ReactElement => {
  const { nuzs, loading, error, hasUserVoted, getVoteCount, handleVote, refresh } = useNuzs({
    currentUserId,
    autoRefresh,
  });

  console.log('📱 ListNuz - État actuel:', {
    nuzsCount: nuzs.length,
    loading,
    error,
    hasData: nuzs.length > 0
  });

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

  const handleNuzPress = (nuzId: string) => {
    router.push(`/nuz-detail?id=${nuzId}`);
  };

  const renderElectedNuz = (nuz: Nuz, isLiked: boolean, voteCount: number): React.ReactElement => {
    return (
      <TouchableOpacity 
        style={styles.electedItem} 
        activeOpacity={0.7}
        onPress={() => handleNuzPress(nuz.id)}
      >
        <View style={styles.electedHeader}>
          <View style={styles.crownContainer}>
            <Text style={styles.crownIcon}>👑</Text>
          </View>
          <View style={styles.electedTitleContainer}>
            <Text style={styles.electedTitle}>{nuz.title}</Text>
            <Text style={styles.electedBadge}>NUZ ÉLU</Text>
          </View>
        </View>
        
        <View style={styles.electedContent}>
          <Text style={styles.electedContentText}>
            {nuz.content}
          </Text>
        </View>
        
        <View style={styles.electedFooter}>
          <View style={styles.electedMetaInfo}>
            <Text style={styles.electedAuthor}>Par {nuz.authorUsername}</Text>
            <Text style={styles.electedDate}>{formatDate(nuz.createdAt)}</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.electedLikeButton, isLiked && styles.electedLikedButton]} 
            onPress={(e) => {
              e.stopPropagation();
              handleVote(nuz.id);
            }}
            activeOpacity={0.7}
          >
            <Image 
              source={isLiked ? require('../assets/images/heartfull.png') : require('../assets/images/heart.png')}
              style={[styles.electedLikeIcon, isLiked && styles.electedLikedIcon]}
            />
            <Text style={[styles.electedVoteCount, isLiked && styles.electedLikedText]}>
              {voteCount}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderItem = (info: ListRenderItemInfo<Nuz>): React.ReactElement => {
    const nuz = info.item;
    const isLiked = hasUserVoted(nuz.id);
    const voteCount = getVoteCount(nuz.id);
    
    // Si le Nuz est élu, utiliser le rendu spécial
    if (nuz.status === 'ELECTED') {
      return renderElectedNuz(nuz, isLiked, voteCount);
    }
    
    // Rendu normal pour les autres statuts
    return (
      <TouchableOpacity 
        style={styles.item} 
        activeOpacity={0.7}
        onPress={() => handleNuzPress(nuz.id)}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{nuz.title}</Text>
          <View style={styles.metaInfo}>
            <Text style={styles.author}>Par {nuz.authorUsername}</Text>
            <Text style={styles.date}>{formatDate(nuz.createdAt)}</Text>
          </View>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.contentText} numberOfLines={4}>
            {nuz.content}
          </Text>
        </View>
        
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.likeButton, isLiked && styles.likedButton]} 
            onPress={(e) => {
              e.stopPropagation();
              handleVote(nuz.id);
            }}
            activeOpacity={0.7}
          >
            <Image 
              source={isLiked ? require('../assets/images/heartfull.png') : require('../assets/images/heart.png')}
              style={[styles.likeIcon, isLiked && styles.likedIcon]}
            />
            <Text style={[styles.voteCount, isLiked && styles.likedText]}>
              {voteCount}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.statusContainer}>
            <Text style={[styles.status, getStatusStyle(nuz.status)]}>
              {nuz.status === 'PENDING' ? 'En attente' : 
               nuz.status === 'ELECTED' ? 'Élu' : 'En attente'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && nuzs.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Chargement des Nuz...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Erreur: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      data={nuzs}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucun Nuz trouvé</Text>
          <Text style={styles.emptySubtext}>Soyez le premier à poster un Nuz !</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  item: {
    marginVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  author: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  content: {
    marginBottom: 12,
  },
  contentText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#444',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  likedButton: {
    backgroundColor: '#ffe6e6',
    borderColor: '#ff6b6b',
  },
  likeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  likedIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  voteCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  likedText: {
    color: '#ff6b6b',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  status: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPENDING: {
    backgroundColor: '#fff3cd',
    color: '#856404',
  },
  statusELECTED: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  statusEN_ATTENTE: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  electedItem: {
    marginVertical: 8,
    backgroundColor: '#fffdf0',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#ffd700',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#ffd700',
  },
  electedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  crownContainer: {
    backgroundColor: '#ffd700',
    borderRadius: 12,
    padding: 10,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  crownIcon: {
    fontSize: 24,
  },
  electedTitleContainer: {
    flex: 1,
  },
  electedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 6,
  },
  electedBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8B4513',
    backgroundColor: '#ffd700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
    letterSpacing: 0.5,
  },
  electedContent: {
    marginBottom: 12,
  },
  electedContentText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#2c2c2c',
    fontWeight: '400',
  },
  electedFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#ffd700',
  },
  electedMetaInfo: {
    flex: 1,
    marginRight: 16,
  },
  electedAuthor: {
    fontSize: 14,
    color: '#8B4513',
    fontWeight: '600',
    marginBottom: 4,
  },
  electedDate: {
    fontSize: 12,
    color: '#D2691E',
    fontWeight: '500',
  },
  electedLikeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 22,
    backgroundColor: '#fffbe6',
    borderWidth: 2,
    borderColor: '#ffd700',
  },
  electedLikedButton: {
    backgroundColor: '#ffd700',
    borderColor: '#8B4513',
  },
  electedLikeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  electedLikedIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  electedVoteCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B4513',
  },
  electedLikedText: {
    color: '#8B4513',
  },
});
