import Myth from '../models/Myth.js';

export const getAllMyths = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      category, 
      region, 
      culture
    } = req.query;
    
    const result = await Myth.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      category,
      region,
      culture
    });
    
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error fetching myths:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los mitos y leyendas'
    });
  }
};

export const getMythById = async (req, res) => {
  try {
    const myth = await Myth.findById(req.params.id);
    
    if (!myth) {
      return res.status(404).json({
        success: false,
        message: 'Mito o leyenda no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: myth
    });
  } catch (error) {
    console.error('Error fetching myth by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el mito o leyenda'
    });
  }
};

export const uploadMythImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No se ha subido ninguna imagen' 
      });
    }

    const imageUrl = `/uploads/myths/${req.file.filename}`;
    
    res.status(201).json({
      success: true,
      imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error uploading myth image:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir imagen del mito'
    });
  }
};

export const createMyth = async (req, res) => {
  try {
    // Obtener datos del FormData
    let mythData;
    try {
      mythData = JSON.parse(req.body.data);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Formato de datos inválido'
      });
    }

    // Procesar imágenes subidas
    const featuredImage = req.files['featured_image']?.[0];
    const additionalImages = req.files['additional_images'] || [];
    
    const images = [];
    let featuredImagePath = mythData.featured_image || '';
    
    // Si se subió una nueva imagen destacada
    if (featuredImage) {
      const uploadDir = path.join(__dirname, '../../public/uploads/myths');
      const filename = `myth-${Date.now()}-${featuredImage.originalname}`;
      const filePath = path.join(uploadDir, filename);
      
      await fs.promises.rename(featuredImage.path, filePath);
      featuredImagePath = `/uploads/myths/${filename}`;
      
      images.push({
        image_url: featuredImagePath,
        caption: featuredImage.originalname,
        is_primary: true
      });
    }
    
    // Procesar imágenes adicionales
    for (const img of additionalImages) {
      const filename = `myth-${Date.now()}-${img.originalname}`;
      const filePath = path.join(uploadDir, filename);
      
      await fs.promises.rename(img.path, filePath);
      
      images.push({
        image_url: `/uploads/myths/${filename}`,
        caption: img.originalname,
        is_primary: false
      });
    }

    // Crear el mito en la base de datos
    const mythId = await Myth.create({
      ...mythData,
      featured_image: featuredImagePath,
      images,
      created_by: req.user.userId
    });
    
    res.status(201).json({
      success: true,
      message: 'Mito creado exitosamente',
      data: { id: mythId }
    });
  } catch (error) {
    console.error('Error creating myth:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el mito'
    });
  }
};

export const updateMyth = async (req, res) => {
  try {
    // Validación básica de campos requeridos
    if (!req.body.title || !req.body.content || !req.body.origin_region || !req.body.origin_culture) {
      return res.status(400).json({
        success: false,
        message: 'Por favor complete todos los campos requeridos'
      });
    }
    
    // Procesar imágenes subidas
    const featuredImage = req.files['featured_image']?.[0];
    const additionalImages = req.files['additional_images'] || [];
    
    const images = [];
    let featuredImageUrl = req.body.featured_image;
    
    if (featuredImage) {
      featuredImageUrl = `/uploads/myths/${featuredImage.filename}`;
      images.push({
        image_url: featuredImageUrl,
        caption: featuredImage.originalname,
        is_primary: true
      });
    }
    
    additionalImages.forEach(img => {
      images.push({
        image_url: `/uploads/myths/${img.filename}`,
        caption: img.originalname,
        is_primary: false
      });
    });
    
    // Actualizar el mito en la base de datos
    await Myth.update(req.params.id, {
      title: req.body.title,
      content: req.body.content,
      origin_region: req.body.origin_region,
      origin_culture: req.body.origin_culture,
      category: req.body.category,
      estimated_origin_year: req.body.estimated_origin_year,
      is_verified: req.body.is_verified === 'true',
      featured_image: featuredImageUrl,
      images,
      deleted_images: req.body.deleted_images ? JSON.parse(req.body.deleted_images) : []
    });
    
    res.json({
      success: true,
      message: 'Mito actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error updating myth:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el mito'
    });
  }
};

export const deleteMyth = async (req, res) => {
  try {
    const deleted = await Myth.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Mito no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Mito eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting myth:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el mito'
    });
  }
};

export const getMetadata = async (req, res) => {
  try {
    const [categories, regions, cultures] = await Promise.all([
      Myth.getCategories(),
      Myth.getRegions(),
      Myth.getCultures()
    ]);
    
    res.json({
      success: true,
      data: {
        categories,
        regions,
        cultures
      }
    });
  } catch (error) {
    console.error('Error fetching metadata:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los metadatos'
    });
  }
};