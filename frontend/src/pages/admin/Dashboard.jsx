import AdminLayout from '../../components/admin/AdminLayout';
import styles from '../../styles/admin/dashboard.module.css';
import { FiMapPin, FiUsers, FiFileText } from 'react-icons/fi';

const AdminDashboard = () => {
  // Datos de ejemplo (deberías reemplazarlos con datos reales)
  const stats = [
    { title: "Marcadores", value: 15, icon: <FiMapPin />, trend: "up" },
    { title: "Usuarios", value: 42, icon: <FiUsers />, trend: "up" },
    { title: "Contenido", value: 7, icon: <FiFileText />, trend: "down" }
  ];

  const recentActivities = [
    { id: 1, action: "Nuevo marcador agregado", user: "admin", time: "Hace 2 horas" },
    { id: 2, action: "Usuario registrado", user: "nuevo_usuario", time: "Hace 5 horas" },
    { id: 3, action: "Contenido actualizado", user: "editor", time: "Ayer" }
  ];

  return (
    <AdminLayout>
      <div className={styles.dashboard}>
        <header className={styles.header}>
          <h1>Panel de Administración</h1>
          <p>Bienvenido al centro de control de Space Maya</p>
        </header>
        
        <section className={styles.statsSection}>
          <h2 className={styles.sectionTitle}>Resumen General</h2>
          <div className={styles.statsGrid}>
            {stats.map((stat, index) => (
              <div key={index} className={styles.statCard}>
                <div className={styles.statIcon}>{stat.icon}</div>
                <div className={styles.statInfo}>
                  <h3>{stat.title}</h3>
                  <p className={styles.statValue}>{stat.value}</p>
                </div>
                <div className={`${styles.trend} ${styles[stat.trend]}`}>
                  {stat.trend === "up" ? "↑" : "↓"}
                </div>
              </div>
            ))}
          </div>
        </section>
        
        <section className={styles.activitySection}>
          <h2 className={styles.sectionTitle}>Actividad Reciente</h2>
          <div className={styles.activityList}>
            {recentActivities.map(activity => (
              <div key={activity.id} className={styles.activityItem}>
                <div className={styles.activityContent}>
                  <p className={styles.activityAction}>{activity.action}</p>
                  <p className={styles.activityMeta}>
                    <span className={styles.activityUser}>@{activity.user}</span>
                    <span className={styles.activityTime}>{activity.time}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;