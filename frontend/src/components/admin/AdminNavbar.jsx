import  useAuth  from '../../context/useAuth';
import styles from '../../styles/admin/navbar.module.css';

const AdminNavbar = () => {
  const { currentUser, logout } = useAuth();

  return (
    <header className={styles.adminNavbar}>
      <div className={styles.leftSection}>
        <span className={styles.greeting}>Bienvenido, {currentUser?.email}</span>
      </div>
      
      <div className={styles.rightSection}>
        <button 
          onClick={logout}
          className={styles.logoutButton}
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
};

export default AdminNavbar;