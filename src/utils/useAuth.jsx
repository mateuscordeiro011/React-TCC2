import { useState, useEffect, useContext, createContext } from 'react';
import api from '../service/api';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      checkSession();
    } else {
      setLoading(false);
    }
  }, []);

  const checkSession = async () => {
    try {
      const response = await api.get('/api-salsi/auth/me');
      const sessionData = response.data;

      if (sessionData.logado === true) {
        // ✅ Tenta obter o ID do localStorage como fallback
        const userId = sessionData.id || localStorage.getItem('userId');

        const userData = {
          id: userId,
          nome: sessionData.nome || "Usuário",
          tipo: sessionData.tipo || "CLIENTE",
        };
        setUser(userData);
      } else {
        logout();
      }
    } catch (error) {
      console.error("Erro ao validar sessão:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    if (userData.id) {
      localStorage.setItem('userId', userData.id); // ✅ salva ID
    }
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // ✅ Expor userId diretamente
  const value = {
    user,
    userId: user?.id,
    isAuthenticated: !!user,
    isCliente: user?.tipo === 'CLIENTE',
    isFuncionario: user?.tipo === 'FUNCIONARIO',
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}