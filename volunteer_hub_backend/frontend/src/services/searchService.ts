import axios from 'axios';
import { authService } from './authService';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

const getAuthHeader = () => {
  const token = authService.getToken?.() || localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const searchService = {
  /**
   * Autocomplete users by keyword
   * @param keyword - Search keyword
   * @param limit - Maximum number of results (default: 10)
   */
  autocompleteUsers: async (keyword: string, limit = 10) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/search/autocomplete/users`, {
        params: { keyword, limit },
        headers: getAuthHeader()
      });
      return response.data || [];
    } catch (error) {
      console.error('[searchService] autocompleteUsers error:', error);
      return [];
    }
  }
};
