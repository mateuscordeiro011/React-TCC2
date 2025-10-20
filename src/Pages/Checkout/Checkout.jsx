import { useState, useEffect } from 'react';
import { useAuth } from '../../utils/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import LoginRequiredModal from '../../components/LoginRequiredModal/LoginRequiredModal';
import CardModal from '../../components/CardModal/CardModal';
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
  const [showCardModal, setShowCardModal] = useState(false);
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState(null);
  const [frete, setFrete] = useState(0);
  const [loadingCep, setLoadingCep] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(false);
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

  // Função para buscar CEP
  const buscarCep = async (cepValue) => {
    if (!cepValue || cepValue.length !== 8) return;
    
    setLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepValue}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        alert('CEP não encontrado');
        return;
      }
      
      setEndereco(data);
      calcularFrete(data);
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      alert('Erro ao buscar CEP');
    } finally {
      setLoadingCep(false);
    }
  };

  // Função para calcular frete baseado na localização
  const calcularFrete = (enderecoData) => {
    const { uf } = enderecoData;
    let valorFrete = 15; // Valor padrão
    
    // Cálculo baseado no estado
    switch (uf) {
      case 'SP':
      case 'RJ':
      case 'MG':
        valorFrete = 10;
        break;
      case 'PR':
      case 'SC':
      case 'RS':
        valorFrete = 15;
        break;
      case 'GO':
      case 'DF':
      case 'MT':
      case 'MS':
        valorFrete = 20;
        break;
      default:
        valorFrete = 25;
    }
    
    setFrete(valorFrete);
  };

  // Função para criar pedido na API e enviar email
  const criarPedidoNaAPI = async (orderData) => {
    try {
      console.log('📦 Enviando dados do pedido para API...');
      
      const pedidoPayload = {
        idUsuario: Number(user.id),
        total: parseFloat((orderData.total + frete).toFixed(2)),
        endereco: endereco ? `${endereco.logradouro}, ${endereco.bairro}, ${endereco.localidade}/${endereco.uf}` : 'Não informado',
        cep: cep || 'Não informado'
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

    if (!cep || cep.length !== 8) {
      alert('Por favor, informe um CEP válido para calcular o frete');
      return;
    }

    if (!endereco) {
      alert('Por favor, busque o endereço pelo CEP antes de continuar');
      return;
    }

    console.log('Pedido confirmado:', order);
    
    if (selectedPaymentMethod === 'pix') {
      setShowPixCode(true);
    } else if (selectedPaymentMethod === 'credit' || selectedPaymentMethod === 'debit') {
      setShowCardModal(true);
    } else {
      handleFinalizarPedido();
    }
  };

  const handleFinalizarPedido = async () => {
    setProcessingOrder(true);
    try {
      console.log('🔄 Finalizando pedido...');
      await criarPedidoNaAPI(order);
      console.log('✅ Pedido finalizado e email enviado!');
      navigate('/pedido-confirmado', { state: { order } });
    } catch (error) {
      console.error('❌ Erro ao finalizar pedido:', error);
      alert('Erro ao finalizar pedido. Tente novamente.');
    } finally {
      setProcessingOrder(false);
    }
  };

  const generatePixCode = () => {
    const totalComFrete = (order.total + frete).toFixed(2);
    return `00020126580014BR.GOV.BCB.PIX0136${Date.now()}@exemplo.com5204000053039865406${totalComFrete}5802BR5913${user.nome || 'Cliente'}6009Sao Paulo62070503***6304`;
  };

  const handleCardConfirm = async (cardData) => {
    setProcessingOrder(true);
    try {
      console.log('💳 Processando pagamento com cartão...', cardData);
      setShowCardModal(false);
      await criarPedidoNaAPI(order);
      navigate('/pedido-confirmado', { state: { order, paymentMethod: selectedPaymentMethod, cardData } });
    } catch (error) {
      console.error('❌ Erro ao processar pagamento:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setProcessingOrder(false);
    }
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
                    disabled={processingOrder}
                    onClick={async () => {
                      setProcessingOrder(true);
                      try {
                        console.log('🔄 Finalizando pagamento PIX...');
                        await criarPedidoNaAPI(order);
                        console.log('✅ Pedido criado e email enviado!');
                        navigate('/pedido-confirmado', { state: { order } });
                      } catch (error) {
                        console.error('❌ Erro ao finalizar PIX:', error);
                        alert('Erro ao finalizar pagamento. Tente novamente.');
                      } finally {
                        setProcessingOrder(false);
                      }
                    }}
                  >
                    {processingOrder ? 'Processando...' : 'Pagamento Realizado'}
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
                <span>R$ {frete.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span className="total-amount">R$ {(order.total + frete).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Endereço de Entrega */}
          <div className="checkout-section">
            <h2>📍 Endereço de Entrega</h2>
            <div className="address-section">
              <div className="cep-input-group">
                <input
                  type="text"
                  placeholder="Digite seu CEP (apenas números)"
                  value={cep}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 8) {
                      setCep(value);
                    }
                  }}
                  maxLength="8"
                  className="cep-input"
                />
                <button
                  type="button"
                  onClick={() => buscarCep(cep)}
                  disabled={cep.length !== 8 || loadingCep}
                  className="btn-buscar-cep"
                >
                  {loadingCep ? 'Buscando...' : 'Buscar'}
                </button>
              </div>
              
              {endereco && (
                <div className="endereco-info">
                  <p><strong>Endereço:</strong> {endereco.logradouro}</p>
                  <p><strong>Bairro:</strong> {endereco.bairro}</p>
                  <p><strong>Cidade:</strong> {endereco.localidade}/{endereco.uf}</p>
                  <p><strong>Frete calculado:</strong> R$ {frete.toFixed(2)}</p>
                </div>
              )}
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
      
      <CardModal
        isOpen={showCardModal}
        onClose={() => setShowCardModal(false)}
        onConfirm={handleCardConfirm}
        paymentType={selectedPaymentMethod}
        darkMode={darkMode}
        total={order.total + frete}
      />
      
      {processingOrder && (
        <div className="processing-overlay">
          <div className="processing-content">
            <div className="processing-spinner"></div>
            <h3>Processando seu pedido...</h3>
            <p>Aguarde enquanto validamos o pagamento e enviamos a confirmação por email.</p>
          </div>
        </div>
      )}
    </>
  );
}