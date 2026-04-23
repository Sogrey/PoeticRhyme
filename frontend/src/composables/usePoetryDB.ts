import { ref, onMounted } from 'vue';
import { apiService, initializeDb } from '../services/apiService';

export function usePoetryDB() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const isDataLoaded = ref(false);

  const initData = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      await initializeDb();
      isDataLoaded.value = true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to initialize database:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const searchPoems = async (keyword: string, options?: {
    dynasty?: string;
    author?: string;
    limit?: number;
    offset?: number;
  }) => {
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;
    const result = await apiService.search(keyword, limit);
    return {
      total: result.total,
      data: offset > 0 ? result.data.slice(offset, offset + limit) : result.data.slice(0, limit),
    };
  };

  const getPoems = async (options?: {
    page?: number;
    limit?: number;
    dynasty?: string;
    author?: string;
  }) => {
    return apiService.getPoems(options || {});
  };

  const getAuthors = async (options?: {
    page?: number;
    limit?: number;
    dynasty?: string;
  }) => {
    return apiService.getAuthors(options || {});
  };

  const getStats = async () => {
    return apiService.getStats();
  };

  const getPoemById = async (id: string) => {
    return apiService.getPoemById(id);
  };

  onMounted(() => {
    initData();
  });

  return {
    isLoading,
    error,
    isDataLoaded,
    searchPoems,
    getPoems,
    getAuthors,
    getStats,
    getPoemById,
  };
}
