import axios from 'axios';

import config_const from '../config/config.json'

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || config_const.AXIOS_URL || 'http://localhost:5000/api/v1',
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 15000
})
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