import React, { useState } from 'react';
import { useAuth } from '../../utils/useAuth';
import LoginRequiredModal from '../LoginRequiredModal/LoginRequiredModal';
import { getBase64ImageSrc } from '../../utils/imageUtils';
import './AnimalModal.css';
import neyma from '../../IMG/neyma.jpeg';
import Meci from '../../IMG/meci.jpg';
import Cericete from '../../IMG/cericete.png';
import defaultImg from '../../IMG/defaultImg.png';


const calculateAge = (birthDateString) => {
  const birthDate = new Date(birthDateString);
  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();

  if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
    years--;
    months += 12;
  }

  if (years > 0) return `${years} ano${years > 1 ? 's' : ''}`;
  return `${months} mês${months > 1 ? 'es' : ''}`;
};


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

const AnimalModal = ({ animal, onClose, onAdopt }) => {
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  if (!animal) return null;

  const reviews = animal.comentarios || [
    { id: 1, user: 'Neyma', rating: 5, comment: 'Pet muito adoravel', date: '2024-10-15' },
    { id: 2, user: 'Meci', rating: 4, comment: 'Adora brincar.', date: '2025-01-10' },
    { id: 3, user: 'Cericete', rating: 5, comment: 'Super dócil!', date: '2025-07-05' }
  ];

  const handleAddReview = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (rating > 0 && comment.trim()) {
      console.log('Nova avaliação:', {
        userId: user.id,
        animalId: animal.id,
        rating,
        comment
      });
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
              src={getBase64ImageSrc(animal.foto)}
              alt={animal.nome}
              className="modal-image"
              onError={(e) => {
                e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM2NjYiPlNlbSBJbWFnZW08L3RleHQ+PC9zdmc+";
              }}
            />
          </div>

          <div className="modal-details-grid">
            {animal.especie && (
              <div className="detail-badge">
                <span className="detail-icon">🐾</span>
                <div>
                  <span className="detail-label">Espécie</span>
                  <span className="detail-value">{animal.especie}</span>
                </div>
              </div>
            )}
            {animal.raca && (
              <div className="detail-badge">
                <span className="detail-icon">🐕</span>
                <div>
                  <span className="detail-label">Raça</span>
                  <span className="detail-value">{animal.raca}</span>
                </div>
              </div>
            )}
            {animal.sexo && (
              <div className="detail-badge">
                <span className="detail-icon">{animal.sexo === 'Macho' ? '♂️' : '♀️'}</span>
                <div>
                  <span className="detail-label">Sexo</span>
                  <span className="detail-value">{animal.sexo}</span>
                </div>
              </div>
            )}
            {animal.porte && (
              <div className="detail-badge">
                <span className="detail-icon">📏</span>
                <div>
                  <span className="detail-label">Porte</span>
                  <span className="detail-value">{animal.porte}</span>
                </div>
              </div>
            )}
            {animal.dataNascimento && (
              <div className="detail-badge">
                <span className="detail-icon">🎂</span>
                <div>
                  <span className="detail-label">Nascimento</span>
                  <span className="detail-value">{animal.dataNascimento}</span>
                </div>
              </div>
            )}
            {animal.idade && (
              <div className="detail-badge">
                <span className="detail-icon">📅</span>
                <div>
                  <span className="detail-label">Idade</span>
                  <span className="detail-value">{calculateAge(animal.dataNascimento)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button
              className="modal-btn adopt"
              onClick={() => onAdopt && onAdopt(animal)}
            >
              ❤️ Adotar
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

export default AnimalModal;