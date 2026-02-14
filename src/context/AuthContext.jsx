import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

const API_URL = "http://127.0.0.1:8000/api/auth";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("tw_token"));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            // In a real app, you'd verify the token with the backend here
            const savedUser = JSON.parse(localStorage.getItem("tw_user"));
            if (savedUser) setUser(savedUser);
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
