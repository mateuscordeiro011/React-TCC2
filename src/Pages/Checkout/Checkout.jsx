import { useState, useEffect } from 'react';
import { useAuth } from '../../utils/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import LoginRequiredModal from '../../components/LoginRequiredModal/LoginRequiredModal';
import './Checkout.css';
import Footer from '../../components/Footer/Footer';

export default function Checkout() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('pix');
  const [showPixCode, setShowPixCode] = useState(false);
  const [order, setOrder] = useState({
    products: [],
    total: 0,
    shippingAddress: '',
    shippingMethod: 'normal',
    paymentMethod: 'pix'
  });

  useEffect(() => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (location.state?.products) {
      const products = location.state.products;
      const total = products.reduce((sum, product) => sum + (product.preco * product.quantity), 0);
      
      setOrder({
        ...order,
        products,
        total
      });
    } else {
      navigate('/catalogo-produto');
    }
  }, [user, location.state, navigate]);

  const handlePaymentMethodChange = (method) => {
    setSelectedPaymentMethod(method);
    setOrder({
      ...order,
      paymentMethod: method
    });
  };

  // Função para criar pedido na API e enviar email
  const criarPedidoNaAPI = async (orderData) => {
    try {
      console.log('📦 Enviando dados do pedido para API...');
      console.log('user.id:', user.id, typeof user.id);
      
      const pedidoPayload = {
        idUsuario: Number(user.id),
        total: parseFloat((orderData.total + 15).toFixed(2))
      };
      
      console.log('📋 Payload:', pedidoPayload);

      const response = await fetch('http://localhost:8080/api-salsi/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify(pedidoPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
      
      const pedidoCriado = await response.json();
      console.log('✅ Pedido criado com sucesso:', pedidoCriado);
      console.log('📧 Email de confirmação enviado automaticamente!');
      return pedidoCriado;
      
    } catch (error) {
      console.error('❌ Erro ao criar pedido:', error);
      throw error;
    }
  };

  const handleConfirmOrder = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    console.log('Pedido confirmado:', order);
    
    if (selectedPaymentMethod === 'pix') {
      setShowPixCode(true);
    } else {
      // Para outros métodos de pagamento, criar pedido diretamente
      handleFinalizarPedido();
    }
  };

  const handleFinalizarPedido = async () => {
    try {
      console.log('🔄 Finalizando pedido...');
      await criarPedidoNaAPI(order);
      console.log('✅ Pedido finalizado e email enviado!');
      navigate('/pedido-confirmado', { state: { order } });
    } catch (error) {
      console.error('❌ Erro ao finalizar pedido:', error);
      alert('Erro ao finalizar pedido. Tente novamente.');
    }
  };

  const generatePixCode = () => {
    // Simular geração de código PIX
    // Em um ambiente real, isso viria do backend
    return `00020126580014BR.GOV.BCB.PIX0136${Date.now()}@exemplo.com5204000053039865406${order.total.toFixed(2)}5802BR5913${user.nome || 'Cliente'}6009Sao Paulo62070503***6304`;
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (!user) {
    return (
      <>
        <div className={`checkout-page ${darkMode ? 'dark-mode' : 'light-mode'}`}>
          <div className="checkout-content">
            <div className="checkout-section">
              <h2>🔒 Acesso Restrito</h2>
              <p>Por favor, faça login para continuar com a compra.</p>
            </div>
          </div>
        </div>
        <Footer />
        <LoginRequiredModal
          isOpen={showLoginModal}
          onClose={() => navigate('/login')}
        />
      </>
    );
  }

  if (showPixCode) {
    const pixCode = generatePixCode();
    
    return (
      <>
        <div className={`checkout-page ${darkMode ? 'dark-mode' : 'light-mode'}`}>
          <div className="checkout-content">
            <div className="checkout-section">
              <h2>💳 Pagamento por PIX</h2>
              <div className="pix-confirmation">
                <div className="pix-qr-code">
                  <div className="qr-placeholder">
                    <div className="qr-dots"></div>
                    <div className="qr-dots"></div>
                    <div className="qr-dots"></div>
                  </div>
                </div>
                <p className="pix-instructions">
                  Escaneie o código QR ou copie o código PIX abaixo para concluir o pagamento:
                </p>
                <div className="pix-code">
                  <textarea 
                    value={pixCode} 
                    readOnly 
                    rows="3"
                    className="pix-code-textarea"
                  />
                  <button 
                    className="copy-btn"
                    onClick={() => navigator.clipboard.writeText(pixCode)}
                  >
                    📋 Copiar Código
                  </button>
                </div>
                <p className="pix-timer">Tempo restante: 5:00</p>
                <div className="pix-actions">
                  <button 
                    className="btn-secondary"
                    onClick={() => setShowPixCode(false)}
                  >
                    Voltar
                  </button>
                  <button 
                    className="btn-primary"
                    onClick={async () => {
                      try {
                        console.log('🔄 Finalizando pagamento PIX...');
                        await criarPedidoNaAPI(order);
                        console.log('✅ Pedido criado e email enviado!');
                        navigate('/pedido-confirmado', { state: { order } });
                      } catch (error) {
                        console.error('❌ Erro ao finalizar PIX:', error);
                        alert('Erro ao finalizar pagamento. Tente novamente.');
                      }
                    }}
                  >
                    Pagamento Realizado
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className={`checkout-page ${darkMode ? 'dark-mode' : 'light-mode'}`}>
        {/* Hero Section */}
        <section className="checkout-hero">
          <div className="hero-content">
            <h1>💳 Finalizar Compra</h1>
            <p>Revise seus produtos e escolha a forma de pagamento</p>
          </div>
        </section>

        <div className="checkout-content">
          {/* Carrinho de Compras */}
          <div className="checkout-section">
            <h2>🛒 Seu Carrinho</h2>
            <div className="cart-items">
              {order.products.map((product, index) => (
                <div key={index} className="cart-item">
                  <img 
                    src={product.foto} 
                    alt={product.nome} 
                    className="cart-item-image"
                  />
                  <div className="cart-item-details">
                    <h4>{product.nome}</h4>
                    <p>Quantidade: {product.quantity}</p>
                    <p className="cart-item-price">
                      R$ {(product.preco * product.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="order-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>R$ {order.total.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Frete:</span>
                <span>R$ 15.00</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span className="total-amount">R$ {(order.total + 15).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Formas de Pagamento */}
          <div className="checkout-section">
            <h2>💳 Forma de Pagamento</h2>
            <div className="payment-methods">
              <div className="payment-option">
                <input
                  type="radio"
                  id="pix"
                  name="payment"
                  value="pix"
                  checked={selectedPaymentMethod === 'pix'}
                  onChange={() => handlePaymentMethodChange('pix')}
                />
                <label htmlFor="pix">
                  <div className="payment-icon">📱</div>
                  <div className="payment-info">
                    <h3>Pix</h3>
                    <p>Pagamento instantâneo e seguro</p>
                  </div>
                </label>
              </div>
              
              <div className="payment-option">
                <input
                  type="radio"
                  id="credit"
                  name="payment"
                  value="credit"
                  checked={selectedPaymentMethod === 'credit'}
                  onChange={() => handlePaymentMethodChange('credit')}
                />
                <label htmlFor="credit">
                  <div className="payment-icon">💳</div>
                  <div className="payment-info">
                    <h3>Cartão de Crédito</h3>
                    <p>Até 12x sem juros</p>
                  </div>
                </label>
              </div>
              
              <div className="payment-option">
                <input
                  type="radio"
                  id="debit"
                  name="payment"
                  value="debit"
                  checked={selectedPaymentMethod === 'debit'}
                  onChange={() => handlePaymentMethodChange('debit')}
                />
                <label htmlFor="debit">
                  <div className="payment-icon">💰</div>
                  <div className="payment-info">
                    <h3>Cartão de Débito</h3>
                    <p>Pagamento à vista</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="checkout-actions">
            <button 
              className="btn-secondary"
              onClick={handleBack}
            >
              ← Voltar
            </button>
            <button 
              className="btn-primary"
              onClick={handleConfirmOrder}
            >
              Confirmar Pedido
            </button>
          </div>
        </div>
      </div>
      <Footer />
      
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
}