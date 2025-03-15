import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.VUE_APP_PALETTE_URL,
});

const palette = {
    get(name, type = 'Company') {
        return axiosInstance.get(`/palette`, {
            params: {
                type,
                name,
            },
            responseType: 'blob',
        });
    }
};

export default palette;