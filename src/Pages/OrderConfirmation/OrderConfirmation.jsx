import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import './OrderConfirmation.css';
import Footer from '../../components/Footer/Footer';

export default function OrderConfirmation() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.order;

  useEffect(() => {
    // Limpar carrinho quando o pedido for confirmado
    localStorage.removeItem('cart');
  }, []);

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <>
      <div className={`order-confirmation-page ${darkMode ? 'dark-mode' : 'light-mode'}`}>
        <div className="order-confirmation">
          <h2>🎉 Pedido Confirmado!</h2>
          <p>Obrigado pela sua compra. Seu pedido foi processado com sucesso e enviado no seu email!</p>
          
          {order && (
            <div className="order-details">
              <h3>Detalhes do Pedido:</h3>
              <p><strong>Número do Pedido:</strong> #{Date.now()}</p>
              <p><strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
              <p><strong>Forma de Pagamento:</strong> {order.paymentMethod === 'pix' ? 'PIX' : order.paymentMethod === 'credit' ? 'Cartão de Crédito' : 'Cartão de Débito'}</p>
              <p><strong>Total:</strong> R$ {(order.total + 15).toFixed(2)}</p>
            </div>
          )}
          
          <button 
            className="btn-primary"
            onClick={handleBackToHome}
          >
            Voltar para Home
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}