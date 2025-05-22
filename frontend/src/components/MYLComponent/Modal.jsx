import styles from './card.module.css'; // Puedes usar los mismos estilos si quieres

const Modal = ({ image, title, fullDescription, onClose }) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <img src={image} alt={title} />
        <h2>{title}</h2>
        <p className={styles.fullDescription}>
          {fullDescription || 'Aquí irían los detalles completos desde tu backend.'}
        </p>
      </div>
    </div>
  );
};

export default Modal;
