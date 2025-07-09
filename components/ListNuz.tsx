import React, { useEffect } from 'react';
import { ListRenderItemInfo, StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
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

  const renderItem = (info: ListRenderItemInfo<Nuz>): React.ReactElement => {
    const nuz = info.item;
    const isLiked = hasUserVoted(nuz.id);
    const voteCount = getVoteCount(nuz.id);
    
    return (
      <TouchableOpacity style={styles.item} activeOpacity={0.7}>
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
            onPress={() => handleVote(nuz.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.likeIcon, isLiked && styles.likedIcon]}>
              {isLiked ? '❤️' : '🤍'}
            </Text>
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
    shadowOpacity: 0.1,
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
});
