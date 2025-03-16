import axios from 'axios';
import { useUserStore } from '@/store/userStore';

const axiosInstance = axios.create({
    baseURL: window.config?.VUE_APP_IMPORT_URL || process.env.VUE_APP_IMPORT_URL,
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

const importer = {
    post(file) {
        const formData = new FormData();
        formData.append("file", file);

        return axiosInstance.post('/import', formData);
    }
};

export default importer;