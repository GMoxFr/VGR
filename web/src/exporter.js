import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: window.config?.VUE_APP_EXPORT_URL || process.env.VUE_APP_EXPORT_URL,
});

const exporter = {
    get(username) {
        return axiosInstance.get(`/export/${username}`);
    }
};

export default exporter;