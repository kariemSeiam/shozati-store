import React, { useState, useCallback } from 'react';
import { useSlides, useProducts } from '../hooks';
import {
  Loader2, Plus, Image, X, ChevronDown, ChevronUp,
  Link2, ExternalLink, Package, AlertCircle
} from 'lucide-react';



const Slides = () => {
  const {
    slides,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    createSlide,
    updateSlide,
    deleteSlide,
    toggleSlideStatus,
    isTogglingStatus
  } = useSlides();

  const {
    products,
    isLoading: isLoadingProducts,
  } = useProducts();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleCreateSlide = async (slideData) => {
    const response = await createSlide(slideData);
    if (response) {
      setIsCreatingNew(false);
      setSelectedProduct(null);
      setSelectedImage(null);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 pb-20" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-30 -mx-4 bg-gray-900/95 backdrop-blur-xl px-4 py-3 
                    border-b border-gray-800/50">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">إدارة العروض</h1>
          <button
            onClick={() => setIsCreatingNew(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 
                     hover:bg-blue-600 transition-colors text-white"
          >
            <Plus className="w-5 h-5" />
            <span>إضافة عرض</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : slides.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4 mt-6">
          {slides.map(slide => (
            <SlideCard
              key={slide.id}
              slide={slide}
              onDelete={() => deleteSlide(slide.id)}
              onUpdate={(data) => updateSlide(slide.id, data)}
              onToggleStatus={() => toggleSlideStatus(slide.id)}
              products={products}
              isUpdating={isUpdating}
              isDeleting={isDeleting}
              isTogglingStatus={isTogglingStatus}
            />
          ))}
        </div>
      )}

      {/* Create New Slide Sheet */}
      {isCreatingNew && (
        <CreateSlideSheet
          onClose={() => setIsCreatingNew(false)}
          onCreate={handleCreateSlide}
          products={products}
          isLoading={isCreating || isLoadingProducts}
          selectedProduct={selectedProduct}
          onProductSelect={setSelectedProduct}
          selectedImage={selectedImage}
          onImageChange={handleImageChange}
        />
      )}
    </div>
  );
};


const StatusToggle = ({ checked, onChange, disabled }) => {
    return (
      <button
        onClick={onChange}
        disabled={disabled}
        className="relative inline-flex items-center gap-3"
      >
        {/* Toggle Track */}
        <div className={`
          w-10 h-5 rounded-full transition-colors duration-200 ml-[-48px]
          ${checked ? 'bg-blue-500' : 'bg-gray-700'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}>
          {/* Toggle Thumb */}
          <div className={`
            absolute w-5 h-5 ml-6 bg-white rounded-full shadow transition-transform duration-200 transform
            ${checked ? 'translate-x-4 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'}
            ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
          `}>
            {disabled && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
              </div>
            )}
          </div>
        </div>
        
        {/* Status Text */}
        <span className={`
          text-sm transition-colors duration-200
          ${checked ? 'text-blue-500' : 'text-gray-400'}
          ${disabled ? 'opacity-50' : ''}
        `}>
          {checked ? 'نشط' : 'غير نشط'}
        </span>
      </button>
    );
  };
  
  const SlideCard = ({ 
    slide, 
    onDelete, 
    onUpdate, 
    onToggleStatus,
    products, 
    isUpdating, 
    isDeleting,
    isTogglingStatus 
  }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
  
    const product = products.find(p => p.id === slide.productId);
  
    return (
      <div className="bg-gray-800/30 rounded-2xl border border-gray-700/50 overflow-hidden">
        <div className="p-4">
          <div className="flex items-start gap-4">
            {/* Image */}
            <div className="relative w-24 h-24 rounded-xl overflow-hidden group">
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className="w-full h-full object-cover transition-transform duration-300
                          group-hover:scale-110"
              />
            </div>
  
            {/* Content */}
            <div className="flex-1 min-w-0 ">
              <h3 className="font-bold text-white text-lg truncate">{slide.title}</h3>
              {product && (
                <div className="flex items-center gap-2 mt-1">
                  <Package className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-400">{product.name}</span>
                </div>
              )}
              
              {/* Status Toggle */}
              <div className="mt-6"
              dir='ltr'>
                <StatusToggle
                  checked={slide.status === 'active'}
                  onChange={() => onToggleStatus(slide.id)}
                  disabled={isTogglingStatus}
                />
              </div>
            </div>
  
            {/* Expand Button */}
            <div className="flex items-center">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-xl hover:bg-gray-700/50 transition-colors"
              >
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>
  
        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-gray-700/50 p-4 space-y-4">
            {slide.description && (
              <p className="text-gray-400 text-sm">{slide.description}</p>
            )}
  
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl
                          bg-blue-500/10 text-blue-500 hover:bg-blue-500/20
                          transition-colors"
              >
                تعديل
              </button>
              <button
                onClick={onDelete}
                disabled={isDeleting}
                className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl
                          bg-red-500/10 text-red-500 hover:bg-red-500/20
                          transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'جاري الحذف...' : 'حذف'}
              </button>
            </div>
          </div>
        )}
  
        {/* Edit Sheet */}
        {isEditing && (
          <EditSlideSheet
            slide={slide}
            onClose={() => setIsEditing(false)}
            onUpdate={async (data) => {
              await onUpdate(data);
              setIsEditing(false);
            }}
            products={products}
            isLoading={isUpdating}
          />
        )}
      </div>
    );
  };

  const CreateSlideSheet = ({
    onClose,
    onCreate,
    products,
    isLoading,
    selectedProduct,
    onProductSelect
  }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageError, setImageError] = useState('');
  
    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          setImageError('Please select a valid image file');
          setSelectedImage(null);
          return;
        }
        
        // Validate file size (e.g., 5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          setImageError('Image size should be less than 5MB');
          setSelectedImage(null);
          return;
        }
  
        setImageError('');
        setSelectedImage(file);
      }
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!selectedImage) {
        setImageError('Please select an image');
        return;
      }
  
      if (!selectedProduct) {
        return;
      }
  
      // Create form data
      const slideData = {
        title,
        description,
        image: selectedImage,
        productId: selectedProduct.id
      };
  
      try {
        const response = await onCreate(slideData);
        if (response) {
          onClose();
          setTitle('');
          setDescription('');
          setSelectedImage(null);
          setImageError('');
        }
      } catch (error) {
        console.error('Error creating slide:', error);
      }
    };
  
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
        <div className="fixed inset-x-0 bottom-0 transform transition-transform duration-300">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-t-[2.5rem] border-t 
                       border-gray-800/50 p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-6">إضافة عرض جديد</h2>
  
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400">
                  الصورة
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="slide-image"
                  />
                  <label
                    htmlFor="slide-image"
                    className="block w-full aspect-video rounded-xl border-2 border-dashed
                           border-gray-700/50 hover:border-blue-500/50 transition-colors
                           cursor-pointer"
                  >
                    {selectedImage ? (
                      <img
                        src={URL.createObjectURL(selectedImage)}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <Image className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-400">
                          اختر صورة أو اسحبها هنا
                        </span>
                      </div>
                    )}
                  </label>
                  {imageError && (
                    <p className="mt-2 text-sm text-red-500">{imageError}</p>
                  )}
                </div>
              </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">
                العنوان
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-12 bg-gray-800/50 rounded-xl px-4 text-white
                       border border-gray-700/50 focus:border-blue-500/50"
                placeholder="عنوان العرض"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">
                الوصف
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-24 bg-gray-800/50 rounded-xl p-4 text-white
                       border border-gray-700/50 focus:border-blue-500/50 resize-none"
                placeholder="وصف العرض"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">
                المنتج
              </label>
              <div className="relative">
                <select
                  value={selectedProduct?.id || ''}
                  onChange={(e) => {
                    const product = products.find(p => p.id === e.target.value);
                    onProductSelect(product);
                  }}
                  className="w-full h-12 bg-gray-800/50 rounded-xl px-4 text-white
                         border border-gray-700/50 focus:border-blue-500/50
                         appearance-none"
                >
                  <option value="">اختر منتج</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 
                                   w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-12 rounded-xl bg-gray-800/50 text-gray-400
                       hover:bg-gray-700/50 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isLoading || !selectedImage || !selectedProduct || !title.trim()}
                className="flex-1 h-12 rounded-xl bg-blue-500 text-white
                       hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري الإنشاء...
                  </span>
                ) : (
                  'إنشاء'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
const EditSlideSheet = ({ slide, onClose, onUpdate, products, isLoading }) => {
  const [title, setTitle] = useState(slide.title);
  const [description, setDescription] = useState(slide.description);
  const [selectedProduct, setSelectedProduct] = useState(
    products.find(p => p.id === slide.productId)
  );
  const [selectedImage, setSelectedImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onUpdate({
      title,
      description,
      ...(selectedImage && { image: selectedImage }),
      productId: selectedProduct?.id
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
      <div className="fixed inset-x-0 bottom-0 transform transition-transform duration-300">
        <div className="bg-gray-900/95 backdrop-blur-xl rounded-t-[2.5rem] border-t 
                     border-gray-800/50 p-6 max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-bold text-white mb-6">تعديل العرض</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">
                الصورة
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setSelectedImage(file);
                    }
                  }}
                  className="hidden"
                  id="edit-slide-image"
                />
                <label
                  htmlFor="edit-slide-image"
                  className="block w-full aspect-video rounded-xl border-2 border-dashed
                         border-gray-700/50 hover:border-blue-500/50 transition-colors
                         cursor-pointer overflow-hidden"
                >
                  {selectedImage ? (
                    <img
                      src={URL.createObjectURL(selectedImage)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      <img
                        src={slide.imageUrl}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center 
                                  justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Image className="w-8 h-8 text-white mb-2" />
                        <span className="text-sm text-white">تغيير الصورة</span>
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">
                العنوان
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-12 bg-gray-800/50 rounded-xl px-4 text-white
                       border border-gray-700/50 focus:border-blue-500/50"
                placeholder="عنوان العرض"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">
                الوصف
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-24 bg-gray-800/50 rounded-xl p-4 text-white
                       border border-gray-700/50 focus:border-blue-500/50 resize-none"
                placeholder="وصف العرض"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">
                المنتج
              </label>
              <div className="relative">
                <select
                  value={selectedProduct?.id || ''}
                  onChange={(e) => {
                    const product = products.find(p => p.id === e.target.value);
                    setSelectedProduct(product);
                  }}
                  className="w-full h-12 bg-gray-800/50 rounded-xl px-4 text-white
                         border border-gray-700/50 focus:border-blue-500/50
                         appearance-none"
                >
                  <option value="">اختر منتج</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 
                                   w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {selectedProduct && (
              <div className="bg-gray-800/30 rounded-xl p-4">
                <ProductPreview product={selectedProduct} />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-12 rounded-xl bg-gray-800/50 text-gray-400
                       hover:bg-gray-700/50 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 h-12 rounded-xl bg-blue-500 text-white
                       hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'جاري الحفظ...' : 'حفظ'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center space-y-4">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
      <p className="text-gray-400">جاري تحميل العروض...</p>
    </div>
  </div>
);

const ErrorState = ({ message }) => (
  <div className="text-center py-12">
    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
    <h3 className="text-xl font-bold text-white mb-2">حدث خطأ</h3>
    <p className="text-gray-400">{message}</p>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-12">
    <Image className="w-16 h-16 text-gray-700 mx-auto mb-4" />
    <h3 className="text-xl font-bold text-white mb-2">لا توجد عروض</h3>
    <p className="text-gray-400">ابدأ بإضافة عروض جديدة لعرضها للعملاء</p>
  </div>
);

const ProductPreview = ({ product }) => {
  const firstVariant = product.variants[0];
  const firstImage = firstVariant?.images[0];
  
  return (
    <div className="flex items-start gap-3">
      {firstImage && (
        <div className="relative w-16 h-16 rounded-lg overflow-hidden">
          <img 
            src={firstImage} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-white truncate">{product.name}</h4>
        <div className="flex items-center gap-4 mt-1">
          <span className="text-sm text-gray-400">
            {product.variants.length} {product.variants.length === 1 ? 'لون' : 'ألوان'}
          </span>
          <span className="text-sm text-gray-400">
            {product.variants.reduce((total, variant) => 
              total + variant.sizes.length, 0
            )} مقاسات
          </span>
        </div>
      </div>
    </div>
  );
};

export default Slides;