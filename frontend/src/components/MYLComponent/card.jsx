import { useState } from 'react';
import styles from './card.module.css';

const Card = ({ image, title, description, fullDescription }) => { // Añadimos `fullDescription`
  const [showDetails, setShowDetails] = useState(false); // Estado para el modal

  return (
    <div className={styles.card}>
      <img src={image || 'https://via.placeholder.com/350x200'} alt={title} />
      <div className={styles.card_body}>
        <h2>{title || 'Título predeterminado'}</h2>
        <p>{description || 'Descripción breve.'}</p>
        <button onClick={() => setShowDetails(true)}>Ver más</button>
      </div>

      {/* Modal de detalles */}
      {showDetails && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button 
              className={styles.closeButton} 
              onClick={() => setShowDetails(false)}
            >
              ×
            </button>
            <img src={image} alt={title} />
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