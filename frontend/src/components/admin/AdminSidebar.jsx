import { NavLink } from 'react-router-dom';
import styles from '../../styles/admin/sidebar.module.css';

const AdminSidebar = () => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>Space Maya Admin</div>
      <nav>
        <ul>
          <li>
            <NavLink 
              to="/admin" 
              end
              className={({ isActive }) => 
                `${styles.link} ${isActive ? styles.activeLink : ''}`
              }
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/admin/map-panel" 
              end
              className={({ isActive }) => 
                `${styles.link} ${isActive ? styles.activeLink : ''}`
              }
            >
              Mapa
            </NavLink>
          </li>
          {/* ... otros enlaces ... */}
        </ul>
      </nav>
    </aside>
  );
};
export default AdminSidebar;