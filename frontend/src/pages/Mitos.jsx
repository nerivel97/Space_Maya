import styles from '../styles/Mitos.module.css';
import Card from '../components/MYLComponent/card';

const Mitos = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className={`${styles.hero} ${styles.heroMain}`}>
        <div className={styles.heroContent}>
        </div>
      </section>

      <div className={styles.container}>
        <Card
          image=""  // Ejemplo de imagen
          title="La Llorona"
          description="Leyenda de una mujer que busca a sus hijos en la noche. ¿Mito o realidad?"
          onClick={() => alert('¡Haz clic en Ver más!')}
        />

        <Card
          image=""  // Ejemplo de imagen
          title="El Chupacabras"
          description="Misterioso ser que ataca animales en zonas rurales. ¿Qué hay detrás de esta leyenda?"
          onClick={() => alert('¡Haz clic en Ver más!')}
        />

        <Card
          image="https://images.unsplash.com/photo-1518709268805-4e9042af9f23"
          title="La Llorona"
          description="Leyenda breve de la mujer que busca a sus hijos."
          fullDescription="La Llorona es una figura legendaria originaria de México. Según la tradición, es el espíritu de una mujer que perdió a sus hijos y ahora vaga por las noches gritando '¡Ay, mis hijos!'. Su historia se usa para asustar a los niños y evitar que salgan de noche. Algunos dicen que si la escuchas llorar, significa que algo malo va a pasar."
        />

      </div>

    </div>
  );
};

export default Mitos;