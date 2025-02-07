// ProductImageUpload.jsx
import React, { useCallback, useState } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';

export const ProductImageUpload = ({ 
  variant, 
  variantIndex, 
  onImageUpload, 
  onImageRemove,
  isUploading,
  uploadProgress,
  error 
}) => {
  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (!files?.length) return;
    
    try {
      // Pass the files directly to the parent handler
      await onImageUpload(variantIndex, files);
    } catch (error) {
      console.error('Error handling files:', error);
    }
    
    // Reset input
    event.target.value = '';
  };

  // Calculate progress percentage
  const progressPercentage = uploadProgress[variantIndex] || 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-400">
          الصور
        </label>
        {isUploading && progressPercentage > 0 && (
          <span className="text-sm text-blue-500">
            {Math.round(progressPercentage)}% تم الرفع
          </span>
        )}
      </div>

      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
        {/* Existing Images */}
        {variant.images.map((image, imageIndex) => (
          <div
            key={imageIndex}
            className="relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden group"
          >
            <img
              src={image}
              alt={`${variant.colorName} - ${imageIndex + 1}`}
              className="w-full h-full object-cover transition-transform 
                       group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 
                          to-transparent opacity-0 group-hover:opacity-100 
                          transition-opacity" />
            <button
              type="button"
              onClick={() => onImageRemove(variantIndex, imageIndex)}
              className="absolute top-1 right-1 p-1.5 bg-black/50 rounded-lg
                       opacity-0 group-hover:opacity-100 transition-opacity
                       hover:bg-red-500/20"
            >
              <X className="w-4 h-4 text-white group-hover:text-red-500" />
            </button>
          </div>
        ))}

        {/* Upload Button */}
        <label 
          className={`relative flex-shrink-0 w-24 h-24 flex items-center 
                    justify-center rounded-xl cursor-pointer group 
                    transition-all duration-300 border-2 border-dashed
                    ${isUploading 
                      ? 'bg-blue-500/10 border-blue-500/30' 
                      : 'bg-gray-800/50 border-gray-700 hover:border-blue-500'}`}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
          {isUploading && progressPercentage > 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-12 h-12" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${progressPercentage}, 100`}
                  className="text-blue-500"
                />
              </svg>
            </div>
          ) : (
            <Upload 
              className={`w-6 h-6 transition-colors duration-300
                      ${isUploading 
                        ? 'text-blue-500 animate-pulse' 
                        : 'text-gray-400 group-hover:text-blue-500'}`} 
            />
          )}
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500">
          <AlertCircle className="w-4 h-4" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

// useProductImageUpload.js
export const useProductImageUpload = (uploadImages) => {
  const [uploadErrors, setUploadErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const handleFormImageUpload = useCallback(async (variantIndex, formData, files) => {
    if (!files?.length) return formData;
    
    setIsUploading(true);
    setUploadErrors({});
    setUploadProgress(prev => ({ ...prev, [variantIndex]: 0 }));

    try {
      const colorName = formData.variants[variantIndex].colorName;
      if (!colorName.trim()) {
        throw new Error('يجب إدخال اسم اللون قبل رفع الصور');
      }

      // For new products without a code yet, store files for later
      if (!formData.code) {
        return {
          ...formData,
          _imageFiles: {
            ...formData._imageFiles,
            [variantIndex]: files
          }
        };
      }

      // For existing products, upload immediately
      const uploadedUrls = await uploadImages(
        formData.code,
        colorName,
        files,
        (progress) => {
          setUploadProgress(prev => ({
            ...prev,
            [variantIndex]: progress
          }));
        }
      );

      // Update formData with new image URLs
      const updatedFormData = {
        ...formData,
        variants: formData.variants.map((variant, idx) =>
          idx === variantIndex
            ? {
                ...variant,
                images: [...variant.images, ...uploadedUrls]
              }
            : variant
        )
      };

      return updatedFormData;
    } catch (error) {
      setUploadErrors(prev => ({
        ...prev,
        [variantIndex]: error.message
      }));
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(prev => ({ ...prev, [variantIndex]: 0 }));
    }
  }, [uploadImages]);

  const clearImageFiles = useCallback((formData) => {
    const { _imageFiles, ...cleanData } = formData;
    return { cleanData, imageFiles: _imageFiles || {} };
  }, []);

  return {
    handleFormImageUpload,
    clearImageFiles,
    uploadErrors,
    isUploading,
    uploadProgress,
    setUploadErrors,
    setUploadProgress
  };
};

// Usage in ProductModal or parent component
const ProductForm = ({ product, onSubmit, uploadImages }) => {
  const { 
    handleFormImageUpload, 
    clearImageFiles,
    uploadErrors, 
    isUploading,
    uploadProgress 
  } = useProductImageUpload(uploadImages);

  const handleImageUpload = async (variantIndex, files) => {
    try {
      const updatedData = await handleFormImageUpload(variantIndex, formData, files);
      setFormData(updatedData);
    } catch (error) {
      console.error('Image upload failed:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const { cleanData, imageFiles } = clearImageFiles(formData);
      await onSubmit(cleanData, imageFiles);
    } catch (error) {
      setErrors(prev => ({ ...prev, submit: error.message }));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {formData.variants.map((variant, variantIndex) => (
        <ProductImageUpload
          key={variantIndex}
          variant={variant}
          variantIndex={variantIndex}
          onImageUpload={handleImageUpload}
          onImageRemove={handleImageRemove}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          error={uploadErrors[variantIndex]}
        />
      ))}
    </form>
  );
};