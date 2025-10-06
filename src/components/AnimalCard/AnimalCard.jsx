// src/components/AnimalCard/AnimalCard.jsx
import React from 'react';
import { getBase64ImageSrc } from '../../utils/imageUtils';
import './AnimalCard.css';

const AnimalCard = ({
  animal,
  onAdopt,
  onViewDetails,
  showActions = true,
  size = 'normal'
}) => {
  const cardClass = `animal-card ${size === 'small' ? ' card-small' : size === 'large' ? ' card-large' : ''}`;

  return (
    <div className={cardClass}>
      <div
        className="animal-image-container"
        onClick={() => onViewDetails && onViewDetails(animal)}
      >
        <img
          src={getBase64ImageSrc(animal.foto)}
          alt={animal.nome}
          className="animal-image"
          onError={(e) => {
            e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM2NjYiPlNlbSBJbWFnZW08L3RleHQ+PC9zdmc+";
          }}
        />
        <div className="zoom-overlay">
          <i className="fas fa-search-plus"></i>
        </div>
      </div>

      <div className="animal-content">
        <h3 className="animal-title">{animal.nome}</h3>
        <p className="animal-category">{animal.especie || "Sem espécie"} • {animal.raca || "Sem raça"}</p>
        <p className="animal-info">
          {animal.idade} • {animal.sexo} • {animal.porte}
        </p>
        <p className="animal-description">
          {animal.descricao?.substring(0, 100)}...
        </p>

        {showActions && (
          <div className="buttons">
            <button className="btn-adopt" onClick={() => onAdopt && onAdopt(animal)}>
              🐾 Agendar Visita
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimalCard;