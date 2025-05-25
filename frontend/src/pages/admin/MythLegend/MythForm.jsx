import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../api/api';
import RichTextEditor from './RichTextEditor';
import ImageUploader from './ImageUploader';
import styles from '../../../styles/admin/MythForm.module.css';

const MythForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    origin_region: '',
    origin_culture: '',
    category: 'Leyenda',
    estimated_origin_year: '',
    is_verified: false,
    featured_image: ''
  });

  const [images, setImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      fetchMythData();
    }
  }, [id]);

  const fetchMythData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/myths/${id}`);
      
      setFormData({
        title: response.title,
        content: response.content,
        origin_region: response.origin_region,
        origin_culture: response.origin_culture,
        category: response.category,
        estimated_origin_year: response.estimated_origin_year,
        is_verified: response.is_verified,
        featured_image: response.featured_image
      });
      
      setImages(response.images || []);
    } catch (err) {
      setError('Error al cargar el mito');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleContentChange = (content) => {
    setFormData({ ...formData, content });
  };

  const handleFeaturedImageUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post('/myths/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setFormData(prev => ({
        ...prev,
        featured_image: response.imageUrl
      }));
      
      return response.imageUrl;
    } catch (error) {
      console.error('Error uploading featured image:', error);
      setError('Error al subir la imagen principal');
      throw error;
    }
  };

  const handleAdditionalImagesUpload = async (files) => {
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await api.post('/myths/upload-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        return {
          image_url: response.imageUrl,
          caption: file.name,
          is_primary: false
        };
      });
      
      const newImages = await Promise.all(uploadPromises);
      setImages(prev => [...prev, ...newImages]);
      
      return newImages;
    } catch (error) {
      console.error('Error uploading additional images:', error);
      setError('Error al subir imágenes adicionales');
      throw error;
    }
  };

  const handleImageDelete = (imageId, imageUrl) => {
    if (imageId) {
      setDeletedImages(prev => [...prev, imageId]);
    }
    setImages(prev => prev.filter(img => img.image_url !== imageUrl));
    
    if (formData.featured_image === imageUrl) {
      setFormData(prev => ({ ...prev, featured_image: '' }));
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validación básica de campos requeridos
  if (!formData.title || !formData.content || !formData.origin_region || !formData.origin_culture) {
    setError('Por favor complete todos los campos requeridos');
    return;
  }

  try {
    setLoading(true);
    setError(null);
    
    // Preparar FormData para enviar tanto archivos como datos JSON
    const formDataToSend = new FormData();
    
    // Agregar campos de texto como JSON
    const mythData = {
      title: formData.title,
      content: formData.content,
      origin_region: formData.origin_region,
      origin_culture: formData.origin_culture,
      category: formData.category,
      estimated_origin_year: formData.estimated_origin_year,
      is_verified: formData.is_verified,
      featured_image: formData.featured_image // URL de la imagen ya subida
    };
    
    formDataToSend.append('data', JSON.stringify(mythData));
    
    // Agregar imágenes adicionales si existen
    if (images.length > 0) {
      images.forEach((img, index) => {
        formDataToSend.append(`images[${index}][image_url]`, img.image_url);
        formDataToSend.append(`images[${index}][caption]`, img.caption || '');
        formDataToSend.append(`images[${index}][is_primary]`, img.is_primary ? 'true' : 'false');
      });
    }
    
    // Agregar imágenes eliminadas si existen
    if (deletedImages.length > 0) {
      formDataToSend.append('deleted_images', JSON.stringify(deletedImages));
    }

    if (isEditing) {
      await api.put(`/myths/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } else {
      await api.post('/myths', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    
    navigate('/admin/mitos-leyendas-panel');
  } catch (err) {
    console.error('Error saving myth:', err);
    setError(err.response?.data?.message || 'Error al guardar el mito');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className={styles.formContainer}>
      <h1>{isEditing ? 'Editar Mito/Leyenda' : 'Añadir Nuevo Mito/Leyenda'}</h1>
      
      {error && <div className={styles.error}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Título*</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Región de Origen*</label>
            <input
              type="text"
              name="origin_region"
              value={formData.origin_region}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Cultura de Origen*</label>
            <input
              type="text"
              name="origin_culture"
              value={formData.origin_culture}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>
        
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Categoría*</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              <option value="Mito">Mito</option>
              <option value="Leyenda">Leyenda</option>
              <option value="Fábula">Fábula</option>
              <option value="Tradición">Tradición</option>
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label>Año de Origen Estimado</label>
            <input
              type="text"
              name="estimated_origin_year"
              value={formData.estimated_origin_year}
              onChange={handleInputChange}
              placeholder="Ej: Siglo XV, 1800s, Precolombino"
            />
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label>Imagen Principal</label>
          <ImageUploader
            onUpload={handleFeaturedImageUpload}
            onDelete={() => handleImageDelete(null, formData.featured_image)}
            currentImage={formData.featured_image}
            single
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>Contenido*</label>
          <RichTextEditor
            value={formData.content}
            onChange={handleContentChange}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>Imágenes Adicionales</label>
          <ImageUploader
            onUpload={handleAdditionalImagesUpload}
            onDelete={handleImageDelete}
            currentImages={images}
            multiple
          />
        </div>
        
        <div className={styles.formGroupCheck}>
          <label>
            <input
              type="checkbox"
              name="is_verified"
              checked={formData.is_verified}
              onChange={handleInputChange}
            />
            Verificado por expertos
          </label>
        </div>
        
        <div className={styles.formActions}>
          <button
            type="button"
            onClick={() => navigate('/mitos')}
            className={styles.cancelButton}
            disabled={loading}
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MythForm;