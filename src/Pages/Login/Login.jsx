import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/useAuth';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../../service/api'; 
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !senha) {
      setErrorMessage('Por favor, preencha todos os campos.');
      setShowError(true);
      return;
    }

    try {
      const response = await api.post('/api-salsi/auth/login', { 
        email, 
        senha 
      });

      const { token, tipo, id, nome } = response.data;

      if (!token || !tipo) {
        throw new Error('Resposta inválida do servidor');
      }

      // ✅ Usa o novo formato: login(email, token, dadosExtras)
      login(email, token, { id, nome, tipo });

      if (tipo === 'FUNCIONARIO') {
        navigate('/home-funcionario');
      } else if (tipo === 'CLIENTE') {
        navigate('/');
      }

    } catch (error) {
      console.error('Erro no login:', error);
      
      if (error.response?.status === 401) {
        setErrorMessage('Email ou senha inválidos.');
      } else if (error.response?.status === 400) {
        setErrorMessage('Dados de login inválidos.');
      } else if (error.response?.status === 500) {
        setErrorMessage('Erro no servidor. Tente novamente mais tarde.');
      } else if (error.request) {
        setErrorMessage('Erro de conexão. Verifique se o servidor está rodando.');
      } else {
        setErrorMessage('Erro inesperado. Tente novamente.');
      }
      
      setShowError(true);
    }
  };

  return (
    <div className="login">
      <div className="login-background"></div>
      <div className="login-container">
        <div className="login-card">
          <h2>Bem-vindo de volta! 👋</h2>
          <p>Entre com sua conta para continuar</p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="email"
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
              />
              <label className="input-label">Email</label>
            </div>

            <div className="input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder=" "
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="input-field"
              />
              <label className="input-label">Senha</label>
              <button
                type="button"
                className="eye-button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <button type="submit" className="login-button">
              Entrar
            </button>
          </form>

          <div className="login-footer">
            <button
              className="link-button"
              onClick={() => navigate('/registro')}
            >
              Criar conta
            </button>
            <button
              className="link-button small"
              onClick={() => navigate('/recuperar-senha')}
            >
              Esqueci minha senha
            </button>
          </div>
        </div>
      </div>

      {showError && (
        <div className="popup">
          <div className="popup-content">
            <p>{errorMessage}</p>
            <button onClick={() => setShowError(false)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;