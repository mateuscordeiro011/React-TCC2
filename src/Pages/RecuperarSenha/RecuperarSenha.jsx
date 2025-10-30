// src/Pages/RecuperarSenha/RecuperarSenha.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../../service/api';
import './Recuperar.css';

const RecuperarSenha = () => {
  const [etapa, setEtapa] = useState(1);
  const [identificador, setIdentificador] = useState('');
  const [tokenRecuperacao, setTokenRecuperacao] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleBuscarUsuario = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Enviando identificador:', identificador);
      
      const response = await api.get('/api-salsi/clientes/esqueci-senha', {
        params: { identificador: identificador.trim() }
      });

      console.log('Resposta do servidor:', response.data);

      const { token } = response.data;
      if (!token) {
        throw new Error('Token não retornado pelo servidor');
      }

      setTokenRecuperacao(token);
      setEtapa(2);
      setSuccess('Token gerado! Redefina sua senha.');
    } catch (err) {
      console.error('Erro completo:', err);
      console.error('Resposta do erro:', err.response?.data);
      
      const mensagem = err.response?.data?.mensagem ||
                       'Usuário não encontrado. Verifique email ou CPF.';
      setError(mensagem);
    } finally {
      setLoading(false);
    }
  };


  const handleRedefinirSenha = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (novaSenha !== confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }

    if (novaSenha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/api-salsi/clientes/redefinir-senha', null, {
        params: {
          token: tokenRecuperacao,
          novaSenha: novaSenha
        }
      });

      setSuccess('Senha redefinida com sucesso!');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const mensagem = err.response?.data?.mensagem ||
                       'Erro ao redefinir senha. Token inválido ou expirado.';
      setError(mensagem);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recuperar-senha">
      <div className="recuperar-background"></div>

      <div className="recuperar-container">
        <div className="recuperar-card">
          <h2>{etapa === 1 ? 'Recuperar Senha' : 'Redefinir Senha'}</h2>
          <p>{etapa === 1 ? 'Informe seu email ou CPF' : 'Digite sua nova senha'}</p>

          {success && <div className="alert success">{success}</div>}
          {error && <div className="alert error">{error}</div>}

          {etapa === 1 ? (
            <form onSubmit={handleBuscarUsuario}>
              <div className="input-group">
                <input
                  type="text"
                  placeholder=" "
                  value={identificador}
                  onChange={(e) => setIdentificador(e.target.value)}
                  required
                  className="input-field"
                />
                <label className="input-label">Email ou CPF</label>
              </div>

              <button type="submit" className="login-button" disabled={loading}>
                {loading ? 'Gerando token...' : 'Recuperar senha'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRedefinirSenha}>
              <div className="input-group">
                <input
                  type={showNovaSenha ? 'text' : 'password'}
                  placeholder=" "
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  required
                  className="input-field"
                />
                <label className="input-label">Nova senha</label>
                <button
                  type="button"
                  className="eye-button"
                  onClick={() => setShowNovaSenha(!showNovaSenha)}
                >
                  {showNovaSenha ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div className="input-group">
                <input
                  type={showConfirmarSenha ? 'text' : 'password'}
                  placeholder=" "
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  required
                  className="input-field"
                />
                <label className="input-label">Confirmar senha</label>
                <button
                  type="button"
                  className="eye-button"
                  onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                >
                  {showConfirmarSenha ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <button type="submit" className="login-button" disabled={loading}>
                {loading ? 'Atualizando...' : 'Redefinir senha'}
              </button>
            </form>
          )}

          <button
            className="link-button small mt-2"
            onClick={() => navigate('/login')}
          >
            Voltar ao login
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecuperarSenha;