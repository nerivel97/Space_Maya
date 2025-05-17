import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
// Importa otras páginas aquí
import './App.css'; // Estilos globales

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}> {/* Layout envuelve todas las rutas */}
          <Route index element={<Home />} />  {/* Ruta raíz */}
          {/* Agrega más rutas aquí */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;