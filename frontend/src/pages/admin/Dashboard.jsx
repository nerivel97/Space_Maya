import AdminLayout from '../../components/admin/AdminLayout';
import styles from '../../styles/admin/dashboard.module.css';

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <div className={styles.dashboard}>
        <h1>Panel de Administración</h1>
        
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>Marcadores</h3>
            <p>15</p>
          </div>
          <div className={styles.statCard}>
            <h3>Usuarios</h3>
            <p>42</p>
          </div>
          <div className={styles.statCard}>
            <h3>Contenido</h3>
            <p>7</p>
          </div>
        </div>
        
        <div className={styles.recentActivity}>
          <h2>Actividad Reciente</h2>
          {/* Aquí iría una lista de actividades */}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;