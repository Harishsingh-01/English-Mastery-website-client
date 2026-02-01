import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                axios.defaults.headers.common['x-auth-token'] = token;
                try {
                    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`);
                    setUser(res.data);
                    localStorage.setItem('user', JSON.stringify(res.data));
                } catch (error) {
                    console.error("Auth Error:", error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    delete axios.defaults.headers.common['x-auth-token'];
                    setUser(null);
                }
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    const loginWithToken = async (token) => {
        localStorage.setItem('token', token);
        axios.defaults.headers.common['x-auth-token'] = token;
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`);
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
        } catch (error) {
            console.error("Login Token Error:", error);
            logout();
        }
    };

    const login = async (email, password) => {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        axios.defaults.headers.common['x-auth-token'] = res.data.token;
        setUser(res.data.user);
    };

    const signup = async (name, email, password) => {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/signup`, { name, email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        axios.defaults.headers.common['x-auth-token'] = res.data.token;
        setUser(res.data.user);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['x-auth-token'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loginWithToken, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
