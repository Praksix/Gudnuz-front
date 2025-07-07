import { apiClient, ApiResponse } from './api';

// Types pour les Nuz
export interface Nuz {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author?: string;
  voteCount: number;
  createdAt: string;
  status: string;
}

export interface CreateNuzRequest {
  title: string;
  content: string;
  authorId: string;
}

// Service pour les opérations sur les Nuz
export const nuzService = {
  // Récupérer tous les Nuz
  async getAllNuzs(): Promise<Nuz[]> {
    try {
      console.log('🌐 Appel API vers:', '/nuzs');
      const response = await apiClient.get<ApiResponse<Nuz[]>>('/nuzs');
      console.log('📡 Réponse API reçue:', response.data);
      
      // Gérer les deux formats possibles de réponse
      let nuzs: Nuz[] = [];
      if (Array.isArray(response.data)) {
        // Format direct: [{...}, {...}]
        nuzs = response.data;
        console.log('✅ Format direct détecté, Nuz récupérés:', nuzs.length);
      } else if (response.data && response.data.data) {
        // Format wrapper: {data: [...], success: true}
        nuzs = response.data.data;
        console.log('✅ Format wrapper détecté, Nuz récupérés:', nuzs.length);
      } else {
        console.log('⚠️ Format de réponse inattendu:', response.data);
      }
      
      return nuzs;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des Nuz:', error);
      throw error;
    }
  },

  // Récupérer un Nuz par ID
  async getNuzById(id: string): Promise<Nuz> {
    try {
      const response = await apiClient.get<ApiResponse<Nuz>>(`/nuzs/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du Nuz ${id}:`, error);
      throw error;
    }
  },

  // Créer un nouveau Nuz
  async createNuz(nuzData: CreateNuzRequest): Promise<Nuz> {
    try {
      const response = await apiClient.post<ApiResponse<Nuz>>('/nuzs', nuzData);
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors de la création du Nuz:', error);
      throw error;
    }
  },

 

  // Supprimer un Nuz
  async deleteNuz(id: string): Promise<void> {
    try {
      await apiClient.delete(`/nuzs/${id}`);
    } catch (error) {
      console.error(`Erreur lors de la suppression du Nuz ${id}:`, error);
      throw error;
    }
  },

  // Récupérer les Nuz les plus votés
  async getTopNuzs(limit: number = 10): Promise<Nuz[]> {
    try {
      const response = await apiClient.get<ApiResponse<Nuz[]>>(`/votes/top?limit=${limit}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des top Nuz:', error);
      throw error;
    }
  },

  // Récupérer le Nuz gagnant
  async getWinnerNuz(): Promise<Nuz | null> {
    try {
      const response = await apiClient.get<ApiResponse<Nuz>>('/votes/winner');
      return response.data.data || null;
    } catch (error) {
      console.error('Erreur lors de la récupération du Nuz gagnant:', error);
      throw error;
    }
  },
}; 