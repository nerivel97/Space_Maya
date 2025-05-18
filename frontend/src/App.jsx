import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Mitos_Leyendas from './pages/Mitos_Leyendas';
import Map from './pages/Mapa';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="mitos_leyendas" element={<Mitos_Leyendas />} />
          <Route path="herramientas/mapa" element={<Map />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;