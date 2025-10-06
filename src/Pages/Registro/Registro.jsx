// src/Pages/Registro/Registro.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/useAuth'; // Importe o hook de autenticação
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../../service/api';
import './Registro.css';

const Registro = () => {
  const { login } = useAuth(); // Pegue a função de login do contexto
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [powerPointWidth, setPowerPointWidth] = useState('1%');
  const [powerPointColor, setPowerPointColor] = useState('#D73F40');
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const formatarCPF = (value) => {
    const numeros = value.replace(/\D/g, '');
    if (numeros.length <= 11) {
      if (numeros.length <= 3) return numeros;
      if (numeros.length <= 6) return `${numeros.slice(0, 3)}.${numeros.slice(3)}`;
      if (numeros.length <= 9) return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6)}`;
      return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`;
    }
    return value.slice(0, -1);
  };

  // ✅ Função handleCpfChange (deve vir antes de ser usada)
  const handleCpfChange = (e) => {
    const value = e.target.value;
    setCpf(formatarCPF(value));
  };

  // Validação de força da senha
  const passwordStrength = (value) => {
    let point = 0;
    const widthPower = ['1%', '25%', '50%', '75%', '100%'];
    const colorPower = ['#D73F40', '#DC6551', '#F2B84F', '#BDE952', '#3ba62f'];

    if (value.length >= 6) {
      const tests = [/[0-9]/, /[a-z]/, /[A-Z]/, /[^0-9a-zA-Z]/];
      tests.forEach((test) => {
        if (test.test(value)) point += 1;
      });
    }

    setPowerPointWidth(widthPower[point]);
    setPowerPointColor(colorPower[point]);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setSenha(value);
    passwordStrength(value);
  };

  // Validação de CPF
  const validarCPF = (cpf) => {
    const match = cpf.match(/\d/g);
    if (!match || match.length !== 11) return false;

    const [a, b, c, d, e, f, g, h, i, j, k] = match.map(Number);
    const soma1 = a * 10 + b * 9 + c * 8 + d * 7 + e * 6 + f * 5 + g * 4 + h * 3 + i * 2;
    const resto1 = (soma1 * 10) % 11 % 10;
    const soma2 = a * 11 + b * 10 + c * 9 + d * 8 + e * 7 + f * 6 + g * 5 + h * 4 + i * 3 + j * 2;
    const resto2 = (soma2 * 10) % 11 % 10;

    return resto1 === j && resto2 === k;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (senha !== confirmPassword) {
      setShowError(true);
      setErrorMessage('As senhas não coincidem');
      return;
    }

    if (senha.length < 6) {
      setShowError(true);
      setErrorMessage('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (!validarCPF(cpf)) {
      setShowError(true);
      setErrorMessage('CPF inválido');
      return;
    }

    try {
      const response = await api.post('/api-salsi/auth/register', {
        nome,
        email,
        cpf,
        senha,
        tipo: 'CLIENTE'
      });

      const { id, token, tipo, nome, email } = response.data;

      console.log('Resposta do registro:', response.data);

      if (token && id) {
        // ✅ Salvar no contexto de autenticação (com ID!)
        login({ id, nome, email, tipo }, token);

        // ✅ Também salva no localStorage como fallback (opcional, mas seguro)
        localStorage.setItem('userId', id);

        alert('Cadastro realizado com sucesso!');
        navigate('/endereco-cadastro');
      } else {
        alert('Erro: resposta incompleta do servidor.');
        navigate('/login');
      }

    } catch (error) {
      console.log('Erro no registro:', error);
      let mensagem = 'Erro ao cadastrar. Tente novamente.';

      if (error.response?.data) {
        mensagem = error.response.data;
      } else if (error.response?.status === 400) {
        mensagem = 'Dados inválidos ou já cadastrados.';
      }

      setShowError(true);
      setErrorMessage(mensagem);
    }
  };

  return (
    <div className="register">
      <div className="registro-background"></div>
      <div className="signup-wrapper">
        <h2>Registro</h2>
        <p>Crie sua conta! 🚀</p>

        <form className="signup-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Seu CPF (000.000.000-00)"
            value={cpf}
            onChange={handleCpfChange}
            maxLength="14"
            required
          />

          <div className="password-container">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Senha"
              value={senha}
              onChange={handlePasswordChange}
              required
            />
            <button
              type="button"
              className="eye-button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="password-container">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Repita sua senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="eye-button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="power-container">
            <div
              className="power-point"
              style={{
                width: powerPointWidth,
                backgroundColor: powerPointColor,
              }}
            ></div>
          </div>

          <button type="submit" className="signup-button">
            Criar conta
          </button>

          <button
            type="button"
            className="login-link-button"
            onClick={() => navigate('/login')}
          >
            Já tem uma conta? Faça login
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

export default Registro;