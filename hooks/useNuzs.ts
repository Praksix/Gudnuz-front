import { useState, useEffect, useCallback } from 'react';
import { nuzService, Nuz } from '../services/nuzService';
import { voteService, ToggleVoteResponse } from '../services/voteService';

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
  const [voteCounts, setVoteCounts] = useState<Map<string, number>>(new Map());

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

      // Initialiser les compteurs de votes
      const initialVoteCounts = new Map();
      fetchedNuzs.forEach(nuz => {
        initialVoteCounts.set(nuz.id, nuz.voteCount);
      });
      setVoteCounts(initialVoteCounts);

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

    // 1. Sauvegarder l’état précédent pour rollback si besoin
    const prevVoteCount = voteCounts.get(nuzId) || 0;
    const prevHasVoted = userVotes.has(nuzId);

    // 2. Optimistic update immédiat
    setVoteCounts(prevCounts => {
      const newVoteCounts = new Map(prevCounts);
      newVoteCounts.set(nuzId, prevHasVoted ? prevVoteCount - 1 : prevVoteCount + 1);
      return newVoteCounts;
    });
    setUserVotes(prevVotes => {
      const newUserVotes = new Set(prevVotes);
      if (prevHasVoted) {
        newUserVotes.delete(nuzId);
      } else {
        newUserVotes.add(nuzId);
      }
      return newUserVotes;
    });

    // 3. Appel API en arrière-plan
    try {
      await voteService.toggleVote(nuzId, currentUserId);
      // On ne touche à rien d’autre, on garde l’état visuel
    } catch (err) {
      // 4. Rollback en cas d’erreur
      setVoteCounts(prevCounts => {
        const newVoteCounts = new Map(prevCounts);
        newVoteCounts.set(nuzId, prevVoteCount);
        return newVoteCounts;
      });
      setUserVotes(prevVotes => {
        const newUserVotes = new Set(prevVotes);
        if (prevHasVoted) {
          newUserVotes.add(nuzId);
        } else {
          newUserVotes.delete(nuzId);
        }
        return newUserVotes;
      });
      setError('Erreur lors du vote, veuillez réessayer.');
    }
  }, [currentUserId, voteCounts, userVotes]);

  // Vérifier si un utilisateur a voté pour un Nuz
  const hasUserVoted = useCallback((nuzId: string): boolean => {
    return userVotes.has(nuzId);
  }, [userVotes]);

  // Obtenir le nombre de votes pour un Nuz
  const getVoteCount = useCallback((nuzId: string): number => {
    return voteCounts.get(nuzId) || 0;
  }, [voteCounts]);

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
      
      // Initialiser le compteur de votes pour le nouveau Nuz
      const newVoteCounts = new Map(voteCounts);
      newVoteCounts.set(newNuz.id, newNuz.voteCount);
      setVoteCounts(newVoteCounts);
      
      return newNuz;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du Nuz');
      return null;
    }
  }, [currentUserId, voteCounts]);

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
    getVoteCount,
    handleVote,
    createNuz,
    refresh: loadNuzs,
  };
}; 