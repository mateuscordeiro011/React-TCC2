import { Link } from 'react-router-dom';
import { useAuth } from '../utils/useAuth';

const AcessoNegado = () => {
  const { isAuthenticated, isFuncionario } = useAuth();

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>🚫 Acesso Negado</h1>
      <p>Você não tem permissão para acessar esta página.</p>
      
      {isAuthenticated && isFuncionario ? (
        <Link to="/home-funcionario">Voltar para Home</Link>
      ) : (
        <Link to="/">Voltar para Home</Link>
      )}  
    </div>
  );
};

export default AcessoNegado;