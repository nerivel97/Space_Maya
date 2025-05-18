import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Map from './pages/Mapa';
import './App.css';
import Mitos from './pages/Mitos';
import Leyendas from './pages/Leyendas';
// Importa otras páginas aquí
import './App.css'; // Estilos globales

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />

          <Route path="/herramientas/mapa" element={<Map />} />
          <Route path="/Mitos" element={<Mitos />} />  {/* Ruta raíz */}
          <Route path="/Leyendas" element={<Leyendas />} />  {/* Ruta raíz */}
          {/* Agrega más rutas aquí */}

        </Route>
      </Routes>
    </Router>
  );
}

export default App;