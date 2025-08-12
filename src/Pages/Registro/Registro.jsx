import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Registro.css';
import api from '../../service/api';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Registro = () => {
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

  useEffect(() => {
    document.body.classList.add('register-page');
    return () => {
      document.body.classList.remove('register-page');
    };
  }, []);

  const passwordStrength = (value) => {
    let point = 0;
    const widthPower = ['1%', '25%', '50%', '75%', '100%'];
    const colorPower = ['#D73F40', '#DC6551', '#F2B84F', '#BDE952', '#3ba62f'];

    if (value.length >= 6) {
      const arrayTest = [/[0-9]/, /[a-z]/, /[A-Z]/, /[^0-9a-zA-Z]/];
      arrayTest.forEach((item) => {
        if (item.test(value)) {
          point += 1;
        }
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (senha !== confirmPassword) {
      setShowError(true);
      setErrorMessage('As senhas não coincidem');
      return;
    }

    try {
      const response = await api.post('/api-salsi/Cliente', {
        nome,
        email,
        cpf,
        senha,
      });
      if (response.status === 201) {
        sessionStorage.setItem('isLoggedIn', true);
        sessionStorage.setItem('userData', JSON.stringify(response.data)); 
        navigate('/');
      } else {
        setShowError(true);
        setErrorMessage('Erro ao cadastrar. Tente novamente.');
      }
    } catch (error) {
      setShowError(true);
      setErrorMessage('Erro ao cadastrar. Tente novamente.');
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
            id="nome"
            type="text"
            placeholder="Seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <input
            id="email"
            type="email"
            placeholder="Seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
                    <input
            id="cpf"
            type="text"
            placeholder="Seu CPF"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
          />


          <div className="password-container">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Senha"
              value={senha}
              onChange={handlePasswordChange}
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
              id="confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Repita sua Senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              id="power-point"
              style={{
                width: powerPointWidth,
                backgroundColor: powerPointColor,
              }}
            ></div>
          </div>
          <button type="submit">Criar conta</button>
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
