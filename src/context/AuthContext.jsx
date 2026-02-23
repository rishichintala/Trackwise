import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

// Force relative path on Netlify to ensure branch previews work correctly
const isNetlify = typeof window !== 'undefined' && window.location.hostname.includes('netlify.app');
const API_BASE = (isNetlify || !import.meta.env.VITE_API_BASE_URL)
    ? "/api"
    : import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, "");
const API_URL = `${API_BASE}/auth`;

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("tw_token"));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            try {
                const raw = localStorage.getItem("tw_user");
                const savedUser = raw ? JSON.parse(raw) : null;
                if (savedUser) setUser(savedUser);
            } catch {
                // Corrupt stored user data — clear it and force re-login
                localStorage.removeItem("tw_token");
                localStorage.removeItem("tw_user");
                setToken(null);
            }
        }
        setLoading(false);
    }, [token]);

    const login = async (email, password) => {
        try {
            const res = await axios.post(`${API_URL}/login`, { email, password });
            setUser(res.data.user);
            setToken(res.data.token);
            localStorage.setItem("tw_token", res.data.token);
            localStorage.setItem("tw_user", JSON.stringify(res.data.user));
            return { success: true };
        } catch (err) {
            console.error("Login Error:", err.response?.status, err.response?.data || err.message);
            return { success: false, message: err.response?.data?.message || "Login failed" };
        }
    };

    const register = async (name, email, password) => {
        try {
            const res = await axios.post(`${API_URL}/register`, { name, email, password });
            setUser(res.data.user);
            setToken(res.data.token);
            localStorage.setItem("tw_token", res.data.token);
            localStorage.setItem("tw_user", JSON.stringify(res.data.user));
            return { success: true };
        } catch (err) {
            console.error("Registration Error:", err.response?.status, err.response?.data || err.message);
            return { success: false, message: err.response?.data?.message || "Registration failed" };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("tw_token");
        localStorage.removeItem("tw_user");
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
