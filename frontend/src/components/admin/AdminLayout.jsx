import AdminSidebar from './AdminSidebar';
import styles from '../../styles/admin/LayoutAdmin.module.css';

const AdminLayout = ({ children }) => {
  return (
    <div className={styles.adminContainer}>
      <AdminSidebar />
      <main className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;