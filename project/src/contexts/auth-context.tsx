'use client';
import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode
} from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { getUserFromToken, isTokenExpired } from '@/lib/auth';

type User = {
    username: string;
    email: string;
    isAdmin: boolean;
    nome?: string;
    codigo?: number;
};

type AuthContextType = {
    user: User | null;
    isLoading: boolean;
    login: (token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: false,
    login: () => {},
    logout: () => {},
    isAuthenticated: false
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const interceptor = axios.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        return () => {
            axios.interceptors.request.eject(interceptor);
        };
    }, []);

    useEffect(() => {
        const initAuth = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');

                if (token && !isTokenExpired(token)) {
                    const userData = getUserFromToken(token);
                    setUser(userData);
                }
            } catch (error) {
                console.error('Erro ao verificar autenticação:', error);
            }
            setIsLoading(false);
        };
        initAuth();
    }, []);

    const login = (token: string) => {
        localStorage.setItem('token', token);
        const userData = getUserFromToken(token);
        setUser(userData);
        router.push('/home');
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        router.push('/auth/login');
    };

    const isAuthenticated = !!user;
    const contextValue = {
        user,
        isLoading,
        login,
        logout,
        isAuthenticated
    };
    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
