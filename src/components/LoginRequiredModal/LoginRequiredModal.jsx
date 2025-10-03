import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginRequiredModal.css';

export default function LoginRequiredModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2>É necessário fazer login</h2>
        <p>Para adicionar itens ao carrinho, você precisa estar logado.</p>
        <div className="modal-actions">
          <button
            className="modal-btn primary"
            onClick={() => {
              onClose();
              navigate('/login');
            }}
          >
            Fazer Login
          </button>
          <button
            className="modal-btn secondary"
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}