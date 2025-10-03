import React from 'react';
import { getBase64ImageSrc } from '../../utils/imageUtils';
import './ProdutoCard.css';

const ProdutoCard = ({ 
  product, 
  onAddToCart, 
  onViewDetails,
  onBuyNow,
  showActions = true,
  size = 'normal'
}) => {
  const cardClass = `prod-card ${size === 'small' ? ' card-small' : size === 'large' ? ' card-large' : ''}`;
  
  return (
    <div className={cardClass}>
      <div 
        className="prod-image-container"
        onClick={() => onViewDetails && onViewDetails(product)}
      >
        <img
          src={getBase64ImageSrc(product.foto)}
          alt={product.nome}
          className="prod-image"
          onError={(e) => {
            e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM2NjYiPlNlbSBJbWFnZW08L3RleHQ+PC9zdmc+";
          }}
        />
        <div className="zoom-overlay">
          <i className="fas fa-search-plus"></i>
        </div>
      </div>
      
      <div className="prod-content">
        <h3 className="prod-title">{product.nome}</h3>
        <p className="prod-price">
          R$ {product.preco?.toFixed(2)}
        </p>
        
        {showActions && (
          <div className="buttons">
            <button
              className="btn-add-to-cart"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart && onAddToCart(product);
              }}
            >
              🛒 Adicionar
            </button>
            <button
              className="btn-buy-now"
              onClick={() => onBuyNow && onBuyNow(product)}
            >
              💳 Comprar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProdutoCard;