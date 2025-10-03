// src/Pages/EnderecoCadastro/EnderecoCadastro.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../service/api';
import './EnderecoCadastro.css';

const EnderecoCadastro = () => {
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // Buscar CEP automaticamente
  const buscarCep = async (valor) => {
    const cepLimpo = valor.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      try {
        // ✅ Corrigido: Removido espaço extra na URL
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();

        if (!data.erro) {
          setRua(data.logradouro);
          setBairro(data.bairro);
          setCidade(data.localidade);
          setEstado(data.uf);
        } else {
          throw new Error('CEP não encontrado');
        }
      } catch (err) {
        console.warn('Erro ao buscar CEP:', err.message);
      }
    }
  };

  const handleCepChange = (e) => {
    const value = e.target.value;
    const cepNumeros = value.replace(/\D/g, '');
    if (cepNumeros.length <= 8) {
      if (cepNumeros.length <= 5) {
        setCep(cepNumeros);
      } else {
        setCep(`${cepNumeros.slice(0, 5)}-${cepNumeros.slice(5)}`);
      }
    }

    if (cepNumeros.length === 8) {
      buscarCep(cepNumeros);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cep || !rua || !numero || !bairro || !cidade || !estado) {
      setShowError(true);
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      // ✅ Corrigido: Verificar se userId existe
      const userId = sessionStorage.getItem('userId');
      console.log('UserId encontrado:', userId); // Para debug
      
      if (!userId || userId === 'null' || userId === 'undefined') {
        throw new Error('ID do usuário não encontrado. Faça login novamente.');
      }

      const enderecoData = {
        cep: cep.replace(/\D/g, ''),
        logradouro: rua,
        numero,
        complemento: complemento || null,
        bairro,
        cidade,
        estado,
        principal: true,
      };

      // ✅ Corrigido: Verificar endpoint correto
      console.log('Enviando endereço para userId:', userId);
      await api.post(`/api-salsi/clientes/${userId}/enderecos`, enderecoData);

      // Salvar no sessionStorage
      sessionStorage.setItem('userEndereco', JSON.stringify({
        cep, rua, numero, bairro, cidade, estado
      }));

      // Redirecionar para home
      navigate('/');
    } catch (error) {
      console.log('Erro ao salvar endereço:', error);
      const msg = error.response?.data?.message ||
                 error.response?.data?.mensagem ||
                 error.message ||
                 'Erro ao salvar endereço. Tente novamente.';
      setShowError(true);
      setErrorMessage(msg);
    }
  };

  return (
    <div className="endereco-cadastro">
      <div className="registro-background"></div>
      <div className="signup-wrapper">
        <h2>Endereço</h2>
        <p>Quase lá! Precisamos do seu endereço. 🏡</p>

        <form className="signup-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="CEP (00000-000)"
            value={cep}
            onChange={handleCepChange}
            maxLength="9"
            required
          />

          <input
            type="text"
            placeholder="Logradouro (rua, avenida...)"
            value={rua}
            onChange={(e) => setRua(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Número"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Complemento (opcional)"
            value={complemento}
            onChange={(e) => setComplemento(e.target.value)}
          />

          <input
            type="text"
            placeholder="Bairro"
            value={bairro}
            onChange={(e) => setBairro(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Cidade"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Estado (SP, RJ...)"
            value={estado}
            onChange={(e) => setEstado(e.target.value.toUpperCase())}
            maxLength="2"
            required
          />

          <button type="submit" className="signup-button">
            Finalizar cadastro
          </button>
        </form>
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

export default EnderecoCadastro;