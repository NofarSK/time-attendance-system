const API_BASE_URL = 'http://localhost:5000/api';

export const loginUser = async (userName, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userName, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Authentication failed');
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};


export const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};


export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};


export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
        return JSON.parse(userStr);
    } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
    }
};

export const hasRole = (role) => {
    const user = getCurrentUser();
    return user && user.role === role;
};