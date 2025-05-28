import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaUserCircle, FaChevronDown, FaCog } from 'react-icons/fa';
import useAuth from '../../context/useAuth';
import styles from './Header.module.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isAdmin, logout } = useAuth();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

  const toggleDropdown = (dropdownName) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  const isActive = (path) => {
    if (path === '/herramientas' && location.pathname.startsWith('/herramientas')) {
      return true;
    } if (path === '/aprende' && location.pathname.startsWith('/aprende')) {
      return true;
    }
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsProfileOpen(false);
  };

  // Datos para los dropdowns
  const dropdownItems = {
    aprende: [
      { path: '/aprende/mitos-leyendas', label: 'Mitos y Leyendas' },
      { path: '/aprende/foro', label: 'Foro' },
    ],
    herramientas: [
      { path: '/herramientas/vocabulario', label: 'Vocabulario' },
      { path: '/herramientas/mapa', label: 'Mapa Interactivo' },
      { path: '/herramientas/memorama', label: 'Memorama' },
    ]
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/"> <img
            src="/img/logov2.png"
            alt="Logo"
            className={styles.logo}
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
            
            {/* Dropdown Aprende */}
            <li className={`${styles.navItem} ${styles.dropdownContainer}`}>
              <div 
                className={`${styles.navLink} ${isActive('/aprende') ? styles.active : ''}`}
                onClick={() => toggleDropdown('aprende')}
              >
                Aprende <FaChevronDown className={`${styles.dropdownIcon} ${activeDropdown === 'aprende' ? styles.rotate : ''}`} />
              </div>
              {activeDropdown === 'aprende' && (
                <div className={styles.dropdownMenu}>
                  {dropdownItems.aprende.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={styles.dropdownMenuItem}
                      onClick={() => {
                        setActiveDropdown(null);
                        setIsMenuOpen(false);
                      }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </li>
            
            {/* Dropdown Herramientas */}
            <li className={`${styles.navItem} ${styles.dropdownContainer}`}>
              <div 
                className={`${styles.navLink} ${isActive('/herramientas') ? styles.active : ''}`}
                onClick={() => toggleDropdown('herramientas')}
              >
                Herramientas <FaChevronDown className={`${styles.dropdownIcon} ${activeDropdown === 'herramientas' ? styles.rotate : ''}`} />
              </div>
              {activeDropdown === 'herramientas' && (
                <div className={styles.dropdownMenu}>
                  {dropdownItems.herramientas.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={styles.dropdownMenuItem}
                      onClick={() => {
                        setActiveDropdown(null);
                        setIsMenuOpen(false);
                      }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </li>
            
            <li className={styles.navItem}>
              <Link
                to="/sobre-nosotros"
                className={`${styles.navLink} ${isActive('/sobre-nosotros') ? styles.active : ''}`}
              >
                Sobre Nosotros
              </Link>
            </li>

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

          {!currentUser ? (
            <div className={styles.authButtons}>
              <Link to="/login" className={styles.btnWhite}>Iniciar sesión</Link>
              <Link to="/register" className={styles.btnPrimary}>Registrarse</Link>
            </div>
          ) : null}

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