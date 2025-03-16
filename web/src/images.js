import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: window.config?.VUE_APP_IMAGES_URL || process.env.VUE_APP_IMAGES_URL,
});

const images = {
    image: {
        get(imageId, type = 'cover', size = 'cover_big', retina = false) {
            return axiosInstance.get(`/images/image/${imageId}`, {
                params: {
                    type,
                    size,
                    retina,
                },
                responseType: 'blob',
            });
        }
    },
    colors: {
        get(imageId) {
            return axiosInstance.get(`/images/colors/${imageId}`);
        }
    },
};

export default images;