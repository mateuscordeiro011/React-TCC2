import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../service/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Função auxiliar para verificar se o token JWT está expirado
const isTokenExpired = (token) => {
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) return true;

    const payloadStr = atob(tokenParts[1]);
    const payload = JSON.parse(payloadStr);
    const currentTime = Math.floor(Date.now() / 1000);
    return typeof payload.exp === 'number' && payload.exp < currentTime;
  } catch (e) {
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔍 Verificando sessão no localStorage...");

    const restoreSession = () => {
      try {
        const token = localStorage.getItem('token');
        console.log("Token no localStorage:", token ? `${token.substring(0, 30)}...` : '❌ Não encontrado');

        if (!token) {
          setLoading(false);
          return;
        }

        if (isTokenExpired(token)) {
          console.warn("⚠️ Token expirado. Limpando sessão.");
          localStorage.removeItem('token');
          setLoading(false);
          return;
        }

        const tokenParts = token.split('.');
        const payloadStr = atob(tokenParts[1]);
        const payload = JSON.parse(payloadStr);

        console.log("✅ Payload decodificado:", payload);

        const userData = {
          tipo: payload.tipo,
          id: payload.id,
          email: payload.sub,
        };

        setUser(userData);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error("🚨 Erro ao restaurar sessão:", error);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = (userData, token) => {
    console.log("✅ Login realizado com sucesso");
    setUser(userData);
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    console.log("🚪 Logout realizado");
    setUser(null);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};