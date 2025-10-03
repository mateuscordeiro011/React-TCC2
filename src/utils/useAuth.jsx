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
    // console.log("🔍 Iniciando verificação de sessão após refresh...");

    const token = localStorage.getItem('token');
    // console.log("Token encontrado:", token ? "✅ Sim" : "❌ Não");

    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // console.log("✅ Header Authorization configurado globalmente");
      checkSession();
    } else {
      setLoading(false);
    }
  }, []);

  const checkSession = async () => {
    try {
      const response = await api.get('/api-salsi/auth/me');
      const sessionData = response.data;


      // ✅ CORRETO: usa 'logado' (exatamente como seu backend envia)
      if (sessionData.logado === true) {
        const userData = {
          nome: sessionData.nome || "Usuário",
          tipo: sessionData.tipo || "CLIENTE",
          // Seu backend NÃO envia ID, então deixamos null ou omitimos
        };
        setUser(userData);
        // console.log("✅ Sessão válida! Usuário:", userData);
      } else {
        //console.warn("⚠️ Sessão inválida (logado: false)");
        logout();
      }
    } catch (error) {
      console.error("❌ Erro ao validar sessão:", error.response?.status || error.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, token) => {
    console.log("✅ Login bem-sucedido.");
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  const logout = () => {
    console.log("🚪 Logout: encerrando a sessão");
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isCliente: user?.tipo === 'CLIENTE',
    isFuncionario: user?.tipo === 'FUNCIONARIO'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}