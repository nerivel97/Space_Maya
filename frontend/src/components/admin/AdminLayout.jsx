import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';
import styles from '../../styles/admin/LayoutAdmin.module.css';

const AdminLayout = ({ children }) => {
  return (
    <div className={styles.adminContainer}>
      <AdminSidebar />
      <div className={styles.mainContent}>
        <AdminNavbar />
        <div className={styles.contentWrapper}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;