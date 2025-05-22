import { useState } from 'react';
import styles from './card.module.css';

const Card = ({ image, title, description, fullDescription }) => {
  const [showDetails, setShowDetails] = useState(false);

  const handleOverlayClick = () => {
    setShowDetails(false);
  };

  const handleModalClick = (e) => {
    // Evita que el clic dentro del modal cierre el modal
    e.stopPropagation();
  };

  return (
    <div className={styles.card}>
      <img src={image || 'https://via.placeholder.com/350x200'} alt={title} />
      <div className={styles.card_body}>
        <h2>{title || 'Título predeterminado'}</h2>
        <p>{description || 'Descripción breve.'}</p>
        <button onClick={() => setShowDetails(true)}>Ver más</button>
      </div>

      {showDetails && (
        <div className={styles.modalOverlay} onClick={handleOverlayClick}>
          <div className={styles.modal} onClick={handleModalClick}>
            <button
              className={styles.closeButton}
              onClick={() => setShowDetails(false)}
            >
              ×
            </button>
            <img src={image || 'https://via.placeholder.com/350x200'} alt={title} />
            <h2>{title}</h2>
            <p className={styles.fullDescription}>
              {fullDescription || 'Aquí irían los detalles completos desde tu backend.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Card;
