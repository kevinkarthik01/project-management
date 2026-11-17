import axios from 'axios';
import config_const from '../config/config.json';

const getApiBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return config_const.AXIOS_URL || 'http://localhost:5000/api/v1';
    }
    return 'https://project-management-elso.vercel.app/api/v1';
};

const apiClient = axios.create({
    baseURL: getApiBaseUrl(),
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 20000
});
// Response Interceptor: Catches global errors (Rate limits, Session Timeouts, Server Errors)
apiClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        if (error.response?.status === 429) {
            console.warn('Rate limit exceeded.')
        } else if (error.response?.status === 401) {
            console.warn('ession expired. Redirecting to login...')
        }

        const message = error.response?.data?.message || error.message || 'Something went wrong';
        return Promise.reject(new Error(message));
    }
)

export default apiClient;