import axios from 'axios';

// =====================================================================
// AXIOS INSTANCE
// =====================================================================
// Instead of using the global 'axios' object, we create a specific instance
// for our backend. This keeps our configuration centralized.
const api = axios.create({
    
    // 1. Base URL
    // All requests will be relative to this.
    // Example: api.get('/products') -> http://localhost/api/products
    baseURL: 'http://localhost/api', 
    
    // 2. Default Headers
    // 'Content-Type': Tells Laravel we are sending JSON data.
    // 'Accept': Tells Laravel we want a JSON response (not HTML errors).
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// =====================================================================
// REQUEST INTERCEPTOR
// =====================================================================
// This function runs automatically BEFORE every single request leaves the browser.
// It acts like a "Middleware" for your frontend.

api.interceptors.request.use(config => {
    
    // 1. Retrieve the Token
    // We try to get the 'AUTH_TOKEN' that was saved during Login.
    const token = localStorage.getItem('AUTH_TOKEN');
    
    // 2. Attach Token (if it exists)
    // If the user is logged in, we add the Authorization header.
    // This satisfies Laravel Sanctum's requirement for "Bearer <token>".
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 3. Proceed with the request
    return config;
}, error => {
    // If setting up the request fails (rare), reject the promise
    return Promise.reject(error);
});

export default api;