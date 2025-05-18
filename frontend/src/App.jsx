import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
<<<<<<< HEAD
import Map from './pages/Mapa';
import './App.css';
=======
import Mitos from './pages/Mitos';
import Leyendas from './pages/Leyendas';
// Importa otras páginas aquí
import './App.css'; // Estilos globales
>>>>>>> 157ae71abd35ef0f5725b5092cfa6d66d6cb8bef

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
<<<<<<< HEAD
          <Route path="/herramientas/mapa" element={<Map />} />
=======
          <Route path="/Mitos" element={<Mitos />} />  {/* Ruta raíz */}
          <Route path="/Leyendas" element={<Leyendas />} />  {/* Ruta raíz */}
          {/* Agrega más rutas aquí */}
>>>>>>> 157ae71abd35ef0f5725b5092cfa6d66d6cb8bef
        </Route>
      </Routes>
    </Router>
  );
}

export default App;