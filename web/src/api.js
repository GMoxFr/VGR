import axios from 'axios';
import { useUserStore } from '@/store/userStore';

const axiosInstance = axios.create({
    baseURL: window.config?.VUE_APP_API_URL || process.env.VUE_APP_API_URL,
});

axiosInstance.interceptors.request.use(
    (config) => {
        const userStore = useUserStore();

        if (userStore.token) {
            config.headers.Authorization = `Bearer ${userStore.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const api = {
    profile: {
        async getUser() {
            return axiosInstance.get('/api/profile');
        },
        async deleteUser() {
            return axiosInstance.delete('/api/profile');
        }
    },
    auth: {
        async signup(data) {
            return axiosInstance.post('/api/auth/signup', data);
        },
        async signin(data) {
            return axiosInstance.post('/api/auth/signin', data);
        },
    },
    games: {
        async list() {
            return axiosInstance.get('/api/games');
        },
        async get(gameId) {
            return axiosInstance.get(`/api/games/${gameId}`);
        },
        async search(data) {
            return axiosInstance.post('/api/games/search', data);
        },
        async popular(data) {
            return axiosInstance.post('/api/games/popular', data);
        }
    },
    library: {
        async add(gameId) {
            return axiosInstance.post(`/api/library/add/${gameId}`);
        },
        async remove(gameId) {
            return axiosInstance.delete(`/api/library/add/${gameId}`);
        },
        async owned(gameId) {
            return axiosInstance.get(`/api/library/add/${gameId}`);
        },
        async myGames(data) {
            return axiosInstance.post('/api/library/list', data);
        },
        async games(username, data) {
            return axiosInstance.post(`/api/library/list/${username}`, data);
        }
    },
    company: {
        async get(companyId, develop = false, publish = false) {
            return axiosInstance.get(`/api/company/${companyId}`, {
                params: { develop, publish }
            });
        }
    },
    genre: {
        async get(genreId, page = 1, maxResults = 10) {
            return axiosInstance.get(`/api/genre/${genreId}`, {
                params: {
                    page,
                    maxResults
                }
            });
        }
    },
    platform: {
        async get(platformId, page = 1, maxResults = 10) {
            return axiosInstance.get(`/api/platform/${platformId}`, {
                params: {
                    page,
                    maxResults
                }
            });
        }
    },
    serie: {
        async get(serieId, page = 1, maxResults = 10) {
            return axiosInstance.get(`/api/series/${serieId}`, {
                params: {
                    page,
                    maxResults
                }
            });
        }
    },
    franchise: {
        async get(franchiseId, page = 1, maxResults = 10) {
            return axiosInstance.get(`/api/franchises/${franchiseId}`, {
                params: {
                    page,
                    maxResults
                }
            });
        }
    },
    gameEngine: {
        async get(engineId, page = 1, maxResults = 10) {
            return axiosInstance.get(`/api/engines/${engineId}`, {
                params: {
                    page,
                    maxResults
                }
            });
        }
    },
    rating: {
        async get(ratingId, page = 1, maxResults = 10) {
            return axiosInstance.get(`/api/ratings/${ratingId}`, {
                params: {
                    page,
                    maxResults
                }
            });
        }
    },
    user: {
        async getAll() {
            return axiosInstance.get('/api/users');
        }
    }
}

export default api;