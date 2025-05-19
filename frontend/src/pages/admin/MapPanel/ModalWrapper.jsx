// components/ModalWrapper.jsx
import { useEffect } from 'react';
import Modal from 'react-modal';
import styles from '../../../styles/admin/MapPanel.module.css';

const ModalWrapper = ({ 
  isOpen, 
  onRequestClose, 
  children,
  contentLabel 
}) => {
  useEffect(() => {
    // Configuración segura del modal
    const initializeModal = () => {
      try {
        const appElement = document.getElementById('__next') || document.body;
        Modal.setAppElement(appElement);
      } catch (error) {
        console.warn('Error configuring modal:', error);
      }
    };

    initializeModal();
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className={styles.modal}
      overlayClassName={styles.overlay}
      contentLabel={contentLabel}
      ariaHideApp={false} // Desactivado temporalmente para evitar warnings
    >
      {children}
    </Modal>
  );
};

export default ModalWrapper;