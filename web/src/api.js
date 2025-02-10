import axios from 'axios';
import { useUserStore } from '@/store/userStore';

const axiosInstance = axios.create({
    baseURL: process.env.VUE_APP_API_URL,
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
        },
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
        }
    },
    library: {
        async add(data) {
            return axiosInstance.post('/api/library', data);
        },
        async remove(gameId) {
            return axiosInstance.delete(`/api/library/${gameId}`);
        },
        async owned(gameId) {
            return axiosInstance.get(`/api/library/${gameId}`);
        }
    },
}

export default api;