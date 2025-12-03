import axios from 'axios';

// Create the bridge to your Laravel Backend
const api = axios.create({
    baseURL: 'http://localhost/api', // Points to Nginx (Port 80)
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Automatically add the Token to every request
api.interceptors.request.use(config => {
    const token = localStorage.getItem('AUTH_TOKEN');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;