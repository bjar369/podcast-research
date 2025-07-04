import axios from 'axios';
import type { Episode } from '../types/content';

const API_BASE_URL = 'https://listen-api.listennotes.com/api/v2';

const listenNotesApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'X-ListenAPI-Key': process.env.LISTEN_NOTES_API_KEY,
  },
});

export const searchPodcastsByPerson = async (
  personName: string,
  limit: number = 25
): Promise<Episode[]> => {
  try {
    const searchQuery = `"${personName}" interview OR guest OR conversation`;
    
    const response = await listenNotesApi.get('/search', {
      params: {
        q: searchQuery,
        type: 'episode',
        len_min: limit,
        safe_mode: 1,
        published_after: Date.now() - (365 * 24 * 60 * 60 * 1000),
      },
    });
    
    return response.data.results;
  } catch (error) {
    console.error('Error searching podcasts by person:', error);
    throw error;
  }
};