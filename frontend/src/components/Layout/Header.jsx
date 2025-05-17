import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import styles from './Header.module.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.brandName}>Space Maya</Link>
        
        <button 
          className={styles.mobileMenuToggle} 
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <FaBars />
        </button>
        
        <nav className={`${styles.mainNav} ${isMenuOpen ? styles.active : ''}`}>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <Link to="/" className={`${styles.navLink} ${styles.active}`}>Inicio</Link>
            </li>
            <li className={styles.navItem}>
              <Link to="/cursos" className={styles.navLink}>Cursos</Link>
            </li>
            <li className={styles.navItem}>
              <Link to="/recursos" className={styles.navLink}>Recursos</Link>
            </li>
            <li className={styles.navItem}>
              <Link to="/sobre-nosotros" className={styles.navLink}>Sobre Nosotros</Link>
            </li>
            <li className={styles.navItem}>
              <Link to="/contacto" className={styles.navLink}>Contacto</Link>
            </li>
          </ul>
          <div className={styles.authButtons}>
            <Link to="/login" className={styles.btnWhite}>Iniciar sesión</Link>
            <Link to="/registro" className={styles.btnPrimary}>Registrarse</Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;