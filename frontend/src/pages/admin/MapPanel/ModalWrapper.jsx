import { useEffect } from 'react';
import Modal from 'react-modal';
import styles from '../../../styles/admin/MapPanel.module.css';

const ModalWrapper = ({ 
  isOpen, 
  onRequestClose, 
  children,
  contentLabel,
  shouldCloseOnOverlayClick = true
}) => {
  useEffect(() => {
    const initializeModal = () => {
      try {
        const appElement = document.getElementById('__next') || document.body;
        Modal.setAppElement(appElement);
      } catch (error) {
        console.warn('Error configuring modal:', error);
      }
    };

    initializeModal();
    return () => {
      Modal.setAppElement(null);
    };
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className={styles.modal}
      overlayClassName={styles.overlay}
      contentLabel={contentLabel}
      ariaHideApp={false}
      shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
    >
      {children}
    </Modal>
  );
};

export default ModalWrapper;