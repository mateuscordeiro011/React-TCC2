import { useState } from 'react';
import './CardModal.css';

export default function CardModal({ isOpen, onClose, onConfirm, paymentType, darkMode, total }) {
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    installments: '1'
  });

  const formatCardNumber = (value) => {
    return value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  const formatExpiry = (value) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
  };

  const handleInputChange = (field, value) => {
    let formattedValue = value;
    
    if (field === 'number') {
      formattedValue = formatCardNumber(value);
      if (formattedValue.replace(/\s/g, '').length > 16) return;
    } else if (field === 'expiry') {
      formattedValue = formatExpiry(value);
      if (formattedValue.length > 5) return;
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length > 4) return;
    } else if (field === 'name') {
      formattedValue = value.toUpperCase();
    }
    
    setCardData({ ...cardData, [field]: formattedValue });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv) {
      alert('Por favor, preencha todos os campos');
      return;
    }
    
    if (cardData.number.replace(/\s/g, '').length !== 16) {
      alert('Número do cartão deve ter 16 dígitos');
      return;
    }
    
    if (cardData.expiry.length !== 5) {
      alert('Data de validade inválida');
      return;
    }
    
    if (cardData.cvv.length < 3) {
      alert('CVV inválido');
      return;
    }
    
    onConfirm(cardData);
  };

  if (!isOpen) return null;

  return (
    <div className="card-modal-overlay">
      <div className={`card-modal ${darkMode ? 'dark-mode' : ''}`}>
        <div className="card-modal-header">
          <h2>💳 {paymentType === 'credit' ? 'Cartão de Crédito' : 'Cartão de Débito'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="card-form">
          <div className="form-group">
            <label>Número do Cartão</label>
            <input
              type="text"
              placeholder="0000 0000 0000 0000"
              value={cardData.number}
              onChange={(e) => handleInputChange('number', e.target.value)}
              maxLength="19"
            />
          </div>
          
          <div className="form-group">
            <label>Nome no Cartão</label>
            <input
              type="text"
              placeholder="NOME COMPLETO"
              value={cardData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Validade</label>
              <input
                type="text"
                placeholder="MM/AA"
                value={cardData.expiry}
                onChange={(e) => handleInputChange('expiry', e.target.value)}
                maxLength="5"
              />
            </div>
            
            <div className="form-group">
              <label>CVV</label>
              <input
                type="text"
                placeholder="000"
                value={cardData.cvv}
                onChange={(e) => handleInputChange('cvv', e.target.value)}
                maxLength="4"
              />
            </div>
          </div>
          
          {paymentType === 'credit' && (
            <div className="form-group">
              <label>Parcelas</label>
              <select
                value={cardData.installments}
                onChange={(e) => setCardData({ ...cardData, installments: e.target.value })}
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}x {i === 0 ? 'à vista' : `de R$ ${(total / (i + 1)).toFixed(2)}`}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="card-modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-confirm">
              Confirmar Pagamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}