import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../context/useAuth';
import styles from '../styles/Register.module.css';

// Avatares predeterminados
const defaultAvatars = [
  { id: 1, url: '/img/logov1.png', name: 'Avatar 1' },
  { id: 2, url: '/img/logov1.png', name: 'Avatar 2' },
  { id: 3, url: '/img/logov1.png', name: 'Avatar 3' },
  { id: 4, url: '/img/user.jpg', name: 'Avatar 4' },
  { id: 5, url: '/img/logov1.png', name: 'Avatar 5' },
  { id: 6, url: '/img/logov1.png', name: 'Avatar 6' },
];

export default function Register() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Datos básicos del perfil
  const [profile, setProfile] = useState({
    name: '',
    lastname: '',
    age: '',
    avatar: ''
  });

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setStep(2);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Validar que se haya seleccionado un avatar
    if (!profile.avatar) {
      setError('Por favor selecciona un avatar');
      setLoading(false);
      return;
    }

    try {
      await register(email, password, profile);
      navigate('/'); // Redirigir a la página home
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Error al registrar usuario');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const selectAvatar = (avatarUrl) => {
    setProfile(prev => ({ ...prev, avatar: avatarUrl }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        {step === 1 ? (
          <>
            <h2 className={styles.title}>Crear cuenta</h2>
            <p className={styles.subtitle}>Paso 1 de 2: Información básica</p>
            
            {error && <p className={styles.error}>{error}</p>}
            
            <form onSubmit={handleAccountSubmit} className={styles.formContent}>
              <div className={styles.formGroup}>
                <label htmlFor="email">Correo electrónico</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="password">Contraseña</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword">Confirmar contraseña</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>
              
              <button type="submit" className={styles.button}>
                Siguiente
              </button>
            </form>
          </>
        ) : (
          <>
            <div className={styles.stepBack} onClick={() => setStep(1)}>
              &larr; Volver
            </div>
            
            <h2 className={styles.title}>Completa tu perfil</h2>
            <p className={styles.subtitle}>Paso 2 de 2: Información personal</p>
            
            {error && <p className={styles.error}>{error}</p>}
            
            <form onSubmit={handleProfileSubmit} className={styles.formContent}>
              <div className={styles.avatarSection}>
                <h3 className={styles.sectionTitle}>Elige tu avatar</h3>
                <p className={styles.sectionDescription}>
                  Selecciona una imagen que te represente
                </p>
                <div className={styles.avatarGrid}>
                  {defaultAvatars.map(avatar => (
                    <div 
                      key={avatar.id}
                      className={`${styles.avatarItem} ${profile.avatar === avatar.url ? styles.selected : ''}`}
                      onClick={() => selectAvatar(avatar.url)}
                    >
                      <div className={styles.avatarImageContainer}>
                        <img 
                          src={avatar.url} 
                          alt={avatar.name} 
                          className={styles.avatarImage}
                        />
                      </div>
                      {profile.avatar === avatar.url && (
                        <div className={styles.selectedIndicator}>
                          ✓
                        </div>
                      )}
                    </div>
                  ))}
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
                    onChange={handleProfileChange}
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
                    onChange={handleProfileChange}
                    className={styles.input}
                    required
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="age">Edad</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={profile.age}
                  onChange={handleProfileChange}
                  className={styles.input}
                  min="16"
                  max="99"
                />
              </div>
              
              <button 
                type="submit" 
                className={styles.button}
                disabled={loading}
              >
                {loading ? 'Registrando...' : 'Completar registro'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}