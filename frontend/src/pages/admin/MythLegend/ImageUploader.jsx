import { useState } from 'react';
import styles from '../../../styles/admin/ImageUploader.module.css';

const ImageUploader = ({
  onUpload,
  onDelete,
  currentImage,
  currentImages = [],
  multiple = false,
  single = false
}) => {
  const [previewImages, setPreviewImages] = useState(currentImages);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    try {
      setIsUploading(true);
      
      if (single) {
        const uploadedImage = await onUpload(files[0]);
        setPreviewImages([{ image_url: uploadedImage }]);
      } else {
        const uploadedImages = await onUpload(files);
        setPreviewImages(prev => [...prev, ...uploadedImages]);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = (imageUrl) => {
    const imageToDelete = previewImages.find(img => img.image_url === imageUrl);
    if (imageToDelete?.id) {
      onDelete(imageToDelete.id, imageUrl);
    } else {
      onDelete(null, imageUrl);
    }
    setPreviewImages(prev => prev.filter(img => img.image_url !== imageUrl));
  };

  return (
    <div className={styles.imageUploader}>
      {single && currentImage && (
        <div className={styles.imagePreviewContainer}>
          <img 
            src={currentImage} 
            alt="Preview" 
            className={styles.imagePreview}
          />
          <button
            type="button"
            onClick={() => onDelete(null, currentImage)}
            className={styles.deleteImageButton}
            disabled={isUploading}
          >
            ×
          </button>
        </div>
      )}
      
      {multiple && previewImages.length > 0 && (
        <div className={styles.imageGrid}>
          {previewImages.map((image, index) => (
            <div key={index} className={styles.imagePreviewContainer}>
              <img
                src={image.image_url}
                alt={`Preview ${index}`}
                className={styles.imagePreview}
              />
              <button
                type="button"
                onClick={() => handleDeleteImage(image.image_url)}
                className={styles.deleteImageButton}
                disabled={isUploading}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      <label className={styles.uploadButton}>
        {isUploading ? 'Subiendo...' : `Subir ${multiple ? 'imágenes' : 'imagen'}`}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          multiple={multiple}
          disabled={isUploading}
          style={{ display: 'none' }}
        />
      </label>
    </div>
  );
};

export default ImageUploader;