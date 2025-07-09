import { apiClient, ApiResponse } from './api';

// Types pour les votes
export interface Vote {
  id: string;
  postId: string;
  authorId: string;
  createdAt: string;
}

export interface VoteCount {
  postId: string;
  count: number;
}

export interface VoteCheck {
  postId: string;
  authorId: string;
  hasVoted: boolean;
}

// Nouvelle interface pour la réponse du toggle
export interface ToggleVoteResponse {
  hasVoted: boolean;
  voteCount: number;
  message: string;
}

// Service pour les opérations de vote
export const voteService = {
  // Basculer un vote (ajouter ou retirer) - Nouvelle implémentation
  async toggleVote(postId: string, authorId: string): Promise<ToggleVoteResponse> {
    try {
      const response = await apiClient.post<ApiResponse<ToggleVoteResponse>>(`/votes/toggle?postId=${postId}&authorId=${authorId}`, {});
      
      // Vérifier que la réponse contient les données attendues
      if (response.data && response.data.data && typeof response.data.data.hasVoted === 'boolean') {
        return response.data.data;
      } else {
        console.warn('Réponse API inattendue pour toggleVote:', response.data);
        // Retourner une réponse par défaut si la structure n'est pas conforme
        return {
          hasVoted: false,
          voteCount: 0,
          message: 'Vote traité avec succès'
        };
      }
    } catch (error) {
      console.error(`Erreur lors du toggle du vote pour le post ${postId}:`, error);
      throw error;
    }
  },

  // Vérifier si un utilisateur a voté pour un post
  async checkVote(postId: string, authorId: string): Promise<boolean> {
    try {
      const response = await apiClient.get<ApiResponse<VoteCheck>>(`/votes/check?postId=${postId}&authorId=${authorId}`);
      if (response.data && response.data.data && typeof response.data.data.hasVoted === 'boolean') {
        return response.data.data.hasVoted;
      } else {
        // Valeur par défaut si la réponse n'est pas conforme
        return false;
      }
    } catch (error) {
      console.error(`Erreur lors de la vérification du vote pour le post ${postId}:`, error);
      throw error;
    }
  },

  // Obtenir le nombre de votes pour un post
  async getVoteCount(postId: string): Promise<number> {
    try {
      const response = await apiClient.get<ApiResponse<VoteCount>>(`/votes/count/${postId}`);
      if (response.data && response.data.data && typeof response.data.data.count === 'number') {
        return response.data.data.count;
      } else {
        console.warn('Réponse API inattendue pour getVoteCount:', response.data);
        return 0; // valeur par défaut si la structure n'est pas conforme
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération du nombre de votes pour le post ${postId}:`, error);
      throw error;
    }
  },

  // Récupérer tous les votes d'un utilisateur
  async getUserVotes(authorId: string): Promise<Vote[]> {
    try {
      const response = await apiClient.get<ApiResponse<Vote[]>>(`/votes/user/${authorId}`);
      return response.data.data || [];
    } catch (error) {
      console.error(`Erreur lors de la récupération des votes de l'utilisateur ${authorId}:`, error);
      throw error;
    }
  },

  // Récupérer tous les votes d'un post
  async getPostVotes(postId: string): Promise<Vote[]> {
    try {
      const response = await apiClient.get<ApiResponse<Vote[]>>(`/votes/post/${postId}`);
      return response.data.data || [];
    } catch (error) {
      console.error(`Erreur lors de la récupération des votes du post ${postId}:`, error);
      throw error;
    }
  },
}; 