import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../context/useAuth';
import api from '../api/api';
import styles from '../styles/Perfil.module.css';

const universities = [
  'UNAM',
  'UADY',
  'Universidad Autónoma de Campeche',
  'Universidad de Quintana Roo',
  'Universidad Autónoma de Chiapas',
  'Otra universidad'
];

export default function Perfil() {
  const { currentUser, logout } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    lastname: '',
    age: '',
    avatar: '',
    university: '',
    interests: '',
    bio: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userData = await api.get(`/auth/profile/${currentUser.id}`);
        setProfile({
          name: userData.name || '',
          lastname: userData.lastname || '',
          age: userData.age || '',
          avatar: userData.avatar || '',
          university: userData.university || '',
          interests: userData.interests || '',
          bio: userData.bio || ''
        });
      } catch (err) {
        setError('Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchProfile();
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.put('/auth/profile', profile);
      setSuccess('Perfil actualizado correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile.name) {
    return <div className={styles.loading}>Cargando perfil...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.profileContainer}>
        <h2 className={styles.title}>Mi Perfil</h2>
        
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarPreview}>
              <img 
                src={profile.avatar || '/img/user.jpg'} 
                alt="Avatar" 
                className={styles.avatarImage}
              />
            </div>
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Nombre</label>
              <input
                type="text"
                id="name"
                name="name"
                value={profile.name}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="lastname">Apellido</label>
              <input
                type="text"
                id="lastname"
                name="lastname"
                value={profile.lastname}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="age">Edad</label>
              <input
                type="number"
                id="age"
                name="age"
                value={profile.age}
                onChange={handleChange}
                className={styles.input}
                min="16"
                max="99"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="university">Universidad</label>
              <select
                id="university"
                name="university"
                value={profile.university}
                onChange={handleChange}
                className={styles.input}
              >
                <option value="">Selecciona una universidad</option>
                {universities.map((uni, index) => (
                  <option key={index} value={uni}>{uni}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="interests">Intereses (separados por comas)</label>
            <input
              type="text"
              id="interests"
              name="interests"
              value={profile.interests}
              onChange={handleChange}
              className={styles.input}
              placeholder="Ej: Arqueología, Historia, Lenguas mayas"
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="bio">Breve biografía</label>
            <textarea
              id="bio"
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              className={styles.textarea}
              rows="4"
              placeholder="Cuéntanos un poco sobre ti..."
            ></textarea>
          </div>
          
          <div className={styles.buttonGroup}>
            <button 
              type="submit" 
              className={styles.saveButton}
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
            
            <button 
              type="button" 
              className={styles.logoutButton}
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              Cerrar sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}