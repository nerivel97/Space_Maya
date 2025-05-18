import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import styles from './Header.module.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Función para determinar si un enlace está activo
  const isActive = (path) => {
    // Caso especial para rutas anidadas
    if (path === '/herramientas' && location.pathname.startsWith('/herramientas')) {
      return true;
    }
    return location.pathname === path;
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
              <Link 
                to="/" 
                className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}
              >
                Inicio
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link 
                to="/cursos" 
                className={`${styles.navLink} ${isActive('/cursos') ? styles.active : ''}`}
              >
                Aprende
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link 
                to="/herramientas" 
                className={`${styles.navLink} ${isActive('/herramientas') ? styles.active : ''}`}
              >
                Herramientas
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link 
                to="/sobre-nosotros" 
                className={`${styles.navLink} ${isActive('/sobre-nosotros') ? styles.active : ''}`}
              >
                Sobre Nosotros
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link 
                to="/contacto" 
                className={`${styles.navLink} ${isActive('/contacto') ? styles.active : ''}`}
              >
                Contacto
              </Link>
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