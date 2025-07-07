import { useState, useEffect, useCallback } from 'react';
import { nuzService, Nuz } from '../services/nuzService';
import { voteService } from '../services/voteService';

interface UseNuzsOptions {
  currentUserId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useNuzs = (options: UseNuzsOptions = {}) => {
  const { currentUserId, autoRefresh = false, refreshInterval = 30000 } = options;
  
  const [nuzs, setNuzs] = useState<Nuz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());

  // Charger les Nuz depuis l'API
  const loadNuzs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Tentative de récupération des Nuz...');
      const fetchedNuzs = await nuzService.getAllNuzs();
      console.log('✅ Nuz récupérés:', fetchedNuzs.length, 'Nuz trouvés');
      console.log('📋 Détails des Nuz:', fetchedNuzs);
      console.log('🎯 État des Nuz après setState:', fetchedNuzs.length > 0 ? 'Données disponibles' : 'Aucune donnée');
      setNuzs(fetchedNuzs);

      // Si on a un utilisateur connecté, charger ses votes
      if (currentUserId) {
        await loadUserVotes(fetchedNuzs.map(nuz => nuz.id));
      }
    } catch (err) {
      console.error('❌ Erreur dans loadNuzs:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des Nuz');
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  // Charger les votes de l'utilisateur
  const loadUserVotes = useCallback(async (nuzIds: string[]) => {
    if (!currentUserId) {
      console.log('👤 Aucun utilisateur connecté, pas de votes à charger');
      return;
    }

    try {
      console.log('🔍 Chargement des votes pour l\'utilisateur:', currentUserId);
      const votes = new Set<string>();
      
      // Vérifier les votes pour chaque Nuz
      for (const nuzId of nuzIds) {
        try {
          const hasVoted = await voteService.checkVote(nuzId, currentUserId);
          if (hasVoted) {
            votes.add(nuzId);
          }
        } catch (voteError) {
          console.warn(`⚠️ Erreur lors de la vérification du vote pour ${nuzId}:`, voteError);
          // Continue avec les autres votes même si un échoue
        }
      }
      
      setUserVotes(votes);
      console.log('✅ Votes utilisateur chargés:', votes.size, 'votes trouvés');
    } catch (err) {
      console.error('❌ Erreur lors du chargement des votes utilisateur:', err);
      // Ne pas bloquer l'affichage des Nuz si les votes échouent
    }
  }, [currentUserId]);

  // Gérer le vote sur un Nuz
  const handleVote = useCallback(async (nuzId: string) => {
    if (!currentUserId) {
      setError('Vous devez être connecté pour voter');
      return;
    }

    try {
      setError(null);
      
      // Optimistic update
      const updatedNuzs = nuzs.map(nuz => {
        if (nuz.id === nuzId) {
          const hasVoted = userVotes.has(nuzId);
          return {
            ...nuz,
            voteCount: hasVoted ? nuz.voteCount - 1 : nuz.voteCount + 1,
          };
        }
        return nuz;
      });
      setNuzs(updatedNuzs);

      // Mettre à jour l'état des votes utilisateur
      const newUserVotes = new Set(userVotes);
      if (newUserVotes.has(nuzId)) {
        newUserVotes.delete(nuzId);
      } else {
        newUserVotes.add(nuzId);
      }
      setUserVotes(newUserVotes);

      // Appel API
      await voteService.toggleVote(nuzId, currentUserId);
      
      // Recharger les données pour s'assurer de la cohérence
      await loadNuzs();
    } catch (err) {
      // Rollback en cas d'erreur
      await loadNuzs();
      setError(err instanceof Error ? err.message : 'Erreur lors du vote');
    }
  }, [nuzs, userVotes, currentUserId, loadNuzs]);

  // Vérifier si un utilisateur a voté pour un Nuz
  const hasUserVoted = useCallback((nuzId: string): boolean => {
    return userVotes.has(nuzId);
  }, [userVotes]);

  // Créer un nouveau Nuz
  const createNuz = useCallback(async (title: string, content: string) => {
    if (!currentUserId) {
      setError('Vous devez être connecté pour créer un Nuz');
      return null;
    }

    try {
      setError(null);
      const newNuz = await nuzService.createNuz({
        title,
        content,
        authorId: currentUserId,
      });
      
      // Ajouter le nouveau Nuz à la liste
      setNuzs(prev => [newNuz, ...prev]);
      return newNuz;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du Nuz');
      return null;
    }
  }, [currentUserId]);

  // Charger les Nuz au montage du composant
  useEffect(() => {
    loadNuzs();
  }, [loadNuzs]);

  // Auto-refresh si activé
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadNuzs();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadNuzs]);

  return {
    nuzs,
    loading,
    error,
    hasUserVoted,
    handleVote,
    createNuz,
    refresh: loadNuzs,
  };
}; 