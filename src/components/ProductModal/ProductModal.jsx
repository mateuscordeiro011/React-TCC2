import React, { useState } from 'react';
import { useAuth } from '../../utils/useAuth';
import LoginRequiredModal from '../LoginRequiredModal/LoginRequiredModal';
import { getBase64ImageSrc } from '../../utils/imageUtils';
import './ProductModal.css';
import neyma from '../../IMG/neyma.jpeg';
import Meci from '../../IMG/meci.jpg';
import Cericete from '../../IMG/cericete.png';
import defaultImg from '../../IMG/defaultImg.png';

const profileImages = {
  'Neyma': neyma,
  'Meci': Meci,
  'Cericete': Cericete,
};

const findProfileImage = (username) => {
  if (!username) return defaultImg;

  if (profileImages[username]) {
    return profileImages[username];
  }

  const normalizedInput = username
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  for (const [name, img] of Object.entries(profileImages)) {
    const normalizedKey = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (normalizedKey === normalizedInput) {
      return img;
    }
  }

  return defaultImg;
};

const ProductModal = ({ product, onClose, onAddToCart, onBuyNow }) => {
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [userReviews, setUserReviews] = useState([]);

  if (!product) return null;

  const defaultReviews = [
    { id: 1, user: 'Neyma', rating: 5, comment: 'Excelente produto! Meu pet adorou.', date: '2025-01-15' },
    { id: 2, user: 'Meci', rating: 4, comment: 'Bom produto, entrega rápida.', date: '2025-01-10' },
    { id: 3, user: 'Cericete', rating: 5, comment: 'Melhor compra que fiz!', date: '2025-01-05' }
  ];
  
  const reviews = [...userReviews, ...(product.comentarios || defaultReviews)];

  const handleAddReview = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (rating > 0 && comment.trim()) {
      const newReview = {
        id: Date.now(),
        user: user.nome || user.email || 'Usuário',
        rating,
        comment: comment.trim(),
        date: new Date().toLocaleDateString('pt-BR')
      };
      
      setUserReviews(prev => [newReview, ...prev]);
      setRating(0);
      setComment('');
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
          <div className="modal-image-container">
            <img
              src={getBase64ImageSrc(product.foto)}
              alt={product.nome}
              className="modal-image"
              onError={(e) => {
                e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM2NjYiPlNlbSBJbWFnZW08L3RleHQ+PC9zdmc+";
              }}
            />
          </div>
          <h1>{product.nome}</h1>


          <h3 className="modal-desc">{product.descricao || "Descrição não disponível"}</h3>
          {product.descricao && (
            <div className="detail-badge">
              <span className="detail-icon">🏷️</span>
              <div>
                <span className="detail-label">PREÇO</span>
                <span className="detail-value">{product.preco?.toFixed(2)}</span>
              </div>
            </div>
          )}

          <div className="modal-rating-section">
            <h3>Avaliação do Produto</h3>
            <div className="modal-rating">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`star ${i < (hoverRating || rating) ? 'filled' : ''}`}
                  onClick={() => user ? setRating(i + 1) : setShowLoginModal(true)}
                  onMouseEnter={() => setHoverRating(i + 1)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  ★
                </span>
              ))}
              <span className="rating-value">{rating || product.rating || 4.5} ({reviews.length} avaliações)</span>
            </div>
          </div>

          {/* Comentários */}
          <div className="modal-comments-section">
            <h3>Comentários ({reviews.length})</h3>
            <div className="comments-list">
              {reviews.map((review) => (
                <div key={review.id} className="comment-item">
                  <div className="comment-header">
                    <div className="profile-img-wrapper">
                      <img
                        src={findProfileImage(review.user)}
                        alt={review.user}
                        className="comment-profile-img"
                        onError={(e) => {
                          e.target.src = defaultImg;
                          e.target.style.backgroundColor = '#ddd';
                        }}
                      />
                    </div>
                    <div className="comment-user-info">
                      <span className="comment-user">{review.user}</span>
                      <span className="comment-date">{review.date}</span>
                    </div>
                  </div>
                  <div className="comment-rating">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`star ${i < review.rating ? 'filled' : ''}`}>
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="comment-text">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Adicionar comentário */}
          <div className="modal-add-review">
            <h4>Adicione sua avaliação</h4>
            <div className="add-rating">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`star ${i < (hoverRating || rating) ? 'filled' : ''}`}
                  onClick={() => user ? setRating(i + 1) : setShowLoginModal(true)}
                  onMouseEnter={() => setHoverRating(i + 1)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  ★
                </span>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={user ? "Escreva seu comentário..." : "Faça login para escrever um comentário..."}
              className="review-textarea"
              rows="3"
              disabled={!user}
            />
            <button
              className="btn-add-review"
              onClick={handleAddReview}
              disabled={!user || !rating || !comment.trim()}
            >
              {user ? 'Enviar Avaliação' : 'Fazer Login para Avaliar'}
            </button>
          </div>

          <div className="modal-actions">
            <button
              className="modal-btn buy"
              onClick={() => onBuyNow && onBuyNow(product)}
            >
              💳 Comprar Agora
            </button>
            <button
              className="modal-btn cart"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart && onAddToCart(product);
              }}
            >
              🛒 Adicionar ao Carrinho
            </button>
          </div>
        </div>
      </div>

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
};

export default ProductModal;