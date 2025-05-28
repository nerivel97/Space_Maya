import { NavLink } from 'react-router-dom';
import { FiHome, FiMap, FiUsers, FiSettings, FiPieChart } from 'react-icons/fi';
import { FaBookTanakh } from "react-icons/fa6";
import { TbVocabulary } from "react-icons/tb";
import styles from '../../styles/admin/sidebar.module.css';

const AdminSidebar = () => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <div className={styles.logo}>Space Maya</div>
        <div className={styles.adminBadge}>Admin</div>
      </div>
      
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <NavLink 
              to="/admin" 
              end
              className={({ isActive }) => 
                `${styles.link} ${isActive ? styles.activeLink : ''}`
              }
            >
              <FiHome className={styles.icon} />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li className={styles.navItem}>
            <NavLink 
              to="/admin/map-panel" 
              className={({ isActive }) => 
                `${styles.link} ${isActive ? styles.activeLink : ''}`
              }
            >
              <FiMap className={styles.icon} />
              <span>Mapa Interactivo</span>
            </NavLink>
          </li>
          <li className={styles.navItem}>
            <NavLink 
              to="/admin/mitos-leyendas-panel" 
              className={({ isActive }) => 
                `${styles.link} ${isActive ? styles.activeLink : ''}`
              }
            >
              <FaBookTanakh className={styles.icon} />
              <span>Mitos y Leyendas</span>
            </NavLink>
          </li>
          <li className={styles.navItem}>
            <NavLink 
              to="/admin/vocabulario-panel" 
              className={({ isActive }) => 
                `${styles.link} ${isActive ? styles.activeLink : ''}`
              }
            >
              <TbVocabulary  className={styles.icon} />
              <span>Vocabulario</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default AdminSidebar;