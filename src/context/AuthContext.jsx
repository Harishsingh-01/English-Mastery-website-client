import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import storageManager from '../utils/storageManager';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const token = storageManager.getItem('token');
            if (token) {
                axios.defaults.headers.common['x-auth-token'] = token;
                try {
                    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`);
                    setUser(res.data);
                    storageManager.setItem('user', JSON.stringify(res.data));
                } catch (error) {
                    console.error("Auth Error:", error);
                    storageManager.removeItem('token');
                    storageManager.removeItem('user');
                    delete axios.defaults.headers.common['x-auth-token'];
                    setUser(null);
                }
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    const loginWithToken = async (token) => {
        storageManager.setItem('token', token);
        axios.defaults.headers.common['x-auth-token'] = token;
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`);
            setUser(res.data);
            storageManager.setItem('user', JSON.stringify(res.data));
        } catch (error) {
            console.error("Login Token Error:", error);
            logout();
        }
    };

    const login = async (email, password) => {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { email, password });
        storageManager.setItem('token', res.data.token);
        storageManager.setItem('user', JSON.stringify(res.data.user));
        axios.defaults.headers.common['x-auth-token'] = res.data.token;
        setUser(res.data.user);
    };

    const signup = async (name, email, password) => {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/signup`, { name, email, password });
        storageManager.setItem('token', res.data.token);
        storageManager.setItem('user', JSON.stringify(res.data.user));
        axios.defaults.headers.common['x-auth-token'] = res.data.token;
        setUser(res.data.user);
    };

    const logout = () => {
        storageManager.removeItem('token');
        storageManager.removeItem('user');
        delete axios.defaults.headers.common['x-auth-token'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loginWithToken, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
