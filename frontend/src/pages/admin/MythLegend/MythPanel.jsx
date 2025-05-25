import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import MythCard from './MythCard';
import MythFormModal from './MythFormModal';
import { Button, Container, Row, Col, Spinner, Alert } from 'react-bootstrap';

const MythsPage = () => {
  const [myths, setMyths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingMyth, setEditingMyth] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyths();
  }, []);

  const fetchMyths = async () => {
    try {
      setLoading(true);
      const response = await api.get('/myths');
      setMyths(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching myths:', err);
      setError('Error al cargar mitos y leyendas');
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingMyth(null);
    setShowModal(true);
  };

  const handleEdit = (myth) => {
    setEditingMyth(myth);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este mito/leyenda?')) {
      return;
    }

    try {
      await api.delete(`/myths/${id}`);
      setMyths(myths.filter(myth => myth.id !== id));
    } catch (err) {
      console.error('Error deleting myth:', err);
      setError('Error al eliminar el mito/leyenda');
    }
  };

  const handleSubmitSuccess = () => {
    setShowModal(false);
    fetchMyths();
  };

  return (
    <Container className="my-5">
      <Row className="mb-4">
        <Col>
          <h1>Mitos y Leyendas</h1>
        </Col>
        <Col className="text-end">
          <Button variant="primary" onClick={handleCreate}>
            Crear Mito/Leyenda
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
        </div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {myths.map(myth => (
            <Col key={myth.id}>
              <MythCard 
                myth={myth} 
                onEdit={() => handleEdit(myth)} 
                onDelete={() => handleDelete(myth.id)} 
              />
            </Col>
          ))}
        </Row>
      )}

      <MythFormModal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        myth={editingMyth} 
        onSubmitSuccess={handleSubmitSuccess} 
      />
    </Container>
  );
};

export default MythsPage;