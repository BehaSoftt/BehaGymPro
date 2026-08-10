import axios from 'axios';
import Storage from './Storage';

const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`;
const UPLOADS_BASE_URL = import.meta.env.VITE_UPLOADS_URL || `http://${window.location.hostname}:5000`;

// Merkezi Axios Instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request Interceptor: Her isteğe token ekle
apiClient.interceptors.request.use(config => {
    const token = Storage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export const getApiUrl = (endpoint) => {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${API_BASE_URL}/${cleanEndpoint}`;
};

export const getUploadUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${UPLOADS_BASE_URL}${cleanPath}`;
};

export default {
    apiClient,
    getApiUrl,
    getUploadUrl,
    API_BASE_URL,
    UPLOADS_BASE_URL
};
