import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: window.config?.VUE_APP_GRAPHS_URL || process.env.VUE_APP_GRAPHS_URL,
});

const graphs = {
    genre_distribution: {
        get(companyName) {
            return axiosInstance.get(`/graphs/genre-distribution/${companyName}`);
        },
    },
    platform_distribution: {
        get(companyName) {
            return axiosInstance.get(`/graphs/platform-distribution/${companyName}`);
        },
    },
};

export default graphs;