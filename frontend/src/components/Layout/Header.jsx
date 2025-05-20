import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaUserCircle, FaChevronDown, FaCog } from 'react-icons/fa';
import useAuth from '../../context/useAuth';
import styles from './Header.module.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isAdmin, logout } = useAuth();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

  const isActive = (path) => {
    if (path === '/herramientas' && location.pathname.startsWith('/herramientas')) {
      return true;
    }
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsProfileOpen(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/"> <img
            src="/img/logov2.png" // cambia esto por la ruta real de tu logo
            alt="Logo"
            className={styles.logo} // agrégalo al CSS para dar tamaño y estilo
          /> </Link>
        <Link to="/" className={styles.brandName}>
          COOXDANICMAYA
        </Link>

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

            {/* Enlace de Admin - Solución 1: Usar null en lugar de false */}
            {isAdmin ? (
              <li className={styles.navItem}>
                <Link
                  to="/admin"
                  className={`${styles.navLink} ${isActive('/admin') ? styles.active : ''}`}
                >
                  <FaCog className={styles.adminIcon} /> Admin
                </Link>
              </li>
            ) : null}
          </ul>

          {/* Mostrar profileContainer solo si es usuario normal (no admin) */}
          {currentUser && !isAdmin ? (
            <div className={styles.profileContainer}>
              <button
                className={styles.profileButton}
                onClick={toggleProfile}
                aria-label="Perfil de usuario"
              >
                <FaUserCircle className={styles.profileIcon} />
                <span className={styles.profileName}>
                  Mi cuenta <FaChevronDown className={`${styles.dropdownIcon} ${isProfileOpen ? styles.rotate : ''}`} />
                </span>
              </button>

              {isProfileOpen && (
                <div className={styles.profileDropdown}>
                  <Link
                    to="/perfil"
                    className={styles.dropdownItem}
                    onClick={() => setIsProfileOpen(false)}
                  >
                    Perfil
                  </Link>
                  <button
                    className={styles.dropdownItem}
                    onClick={handleLogout}
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : null}

          {/* Mostrar botones de auth solo si no hay usuario logueado */}
          {!currentUser ? (
            <div className={styles.authButtons}>
              <Link to="/login" className={styles.btnWhite}>Iniciar sesión</Link>
              <Link to="/register" className={styles.btnPrimary}>Registrarse</Link>
            </div>
          ) : null}

          {/* Opción de logout minimalista para admin - Solución 2: Convertir a fragmento */}
          {isAdmin ? (
            <>
              <button
                className={styles.adminLogoutButton}
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
};

export default Header;