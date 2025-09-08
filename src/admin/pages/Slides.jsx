import React, { useState, useCallback } from 'react';
import { useSlides, useProducts } from '../hooks';
import {
  Loader2, Plus, Image, ChevronDown, ChevronUp,
  Package, AlertCircle
} from 'lucide-react';
import {
  ResponsiveSheet,
  ResponsiveFormField,
  ResponsiveInput,
  ResponsiveSelect,
  ResponsiveTextarea,
  ResponsiveButtonGroup,
  getDefaultValue
} from '../components/ResponsiveSheet';
import {
  AdminButton
} from '../components/DesignSystem';

const Slides = () => {
  const {
    slides,
    loading,
    errors,
    createSlide,
    updateSlide,
    deleteSlide,
    toggleSlideStatus,
    resetError
  } = useSlides();

  const {
    products,
    loading: productsLoading
  } = useProducts();

  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const handleCreateSlide = async (slideData) => {
    const response = await createSlide(slideData);
    if (response) {
      setIsCreatingNew(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 pb-20" dir="rtl">
      {/* Header for mobile */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-neutral-800/50">
        <h1 className="text-xl font-bold text-white">إدارة العروض</h1>
        <span className="text-sm text-neutral-400">
          {slides.length} عرض
        </span>
      </div>

      {/* Header for desktop */}
      <div className="hidden md:block bg-gradient-to-b from-neutral-950/95 to-neutral-950 border-b border-neutral-800/50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">إدارة العروض</h1>
            <p className="text-neutral-400 mt-1">إدارة العروض التقديمية للمنتجات</p>
          </div>
          <AdminButton
            onClick={() => {
              setIsCreatingNew(true);
              resetError('create');
            }}
            variant="primary"
            size="md"
          >
            <Plus className="w-5 h-5" />
            <span>إضافة عرض</span>
          </AdminButton>
        </div>
      </div>

      {/* Add button for mobile */}
      <div className="md:hidden sticky top-0 z-30 bg-neutral-950/95 backdrop-blur-sm p-4 border-b border-neutral-800/50">
        <AdminButton
          onClick={() => {
            setIsCreatingNew(true);
            resetError('create');
          }}
          variant="primary"
          size="md"
          fullWidth
        >
          <Plus className="w-5 h-5" />
          <span>إضافة عرض جديد</span>
        </AdminButton>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6">
        {loading.slides ? (
          <LoadingState />
        ) : errors.slides ? (
          <ErrorState message={errors.slides} />
        ) : slides.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {slides.map(slide => (
              <SlideCard
                key={slide.id}
                slide={slide}
                onDelete={deleteSlide}
                onUpdate={updateSlide}
                onToggleStatus={toggleSlideStatus}
                products={products}
                loading={loading}
                errors={errors}
                resetError={resetError}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create New Slide Sheet */}
      {isCreatingNew && (
        <CreateSlideSheet
          onClose={() => {
            setIsCreatingNew(false);
            resetError('create');
          }}
          onCreate={handleCreateSlide}
          products={products}
          isLoading={loading.create || productsLoading}
          error={errors.create}
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
      <div className={`
        w-10 h-5 rounded-full transition-colors duration-200 ml-[-48px]
        ${checked ? 'bg-green-500' : 'bg-neutral-700'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}>
        <div className={`
          absolute w-5 h-5 ml-6 bg-white rounded-full shadow transition-transform duration-200 transform
          ${checked ? 'translate-x-4 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'}
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}>
          {disabled && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-3 h-3 text-primary-500 animate-spin" />
            </div>
          )}
        </div>
      </div>
      <span className={`
        text-sm transition-colors duration-200
        ${checked ? 'text-green-400' : 'text-neutral-400'}
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
  loading,
  errors,
  resetError
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const product = products.find(p => p.id === slide.productId);

  const handleDelete = async () => {
    const success = await onDelete(slide.id);
    if (success) {
      setIsExpanded(false);
    }
  };

  const handleUpdate = async (data) => {
    const success = await onUpdate(slide.id, data);
    if (success) {
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-neutral-800/30 rounded-2xl border border-neutral-700/50 overflow-hidden hover:border-primary-500/30 transition-all duration-300 group">
      {/* Image */}
      <div className="relative aspect-video w-full rounded-t-2xl overflow-hidden">
        <img
          src={slide.imageUrl}
          alt={slide.title}
          className="w-full h-full object-cover transition-transform duration-300
                    group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${slide.status === 'active'
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : 'bg-neutral-800/60 text-neutral-400 border border-neutral-600/30'
            }`}>
            {slide.status === 'active' ? 'نشط' : 'غير نشط'}
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Content */}
        <div className="space-y-3">
          <h3 className="font-bold text-white text-lg leading-tight">{slide.title}</h3>

          {slide.description && (
            <p className="text-sm text-neutral-400 line-clamp-2 leading-relaxed">
              {slide.description}
            </p>
          )}

          {product && (
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-primary-400" />
              <span className="text-sm text-neutral-300 truncate">{product.name}</span>
            </div>
          )}

          {/* Status Toggle */}
          <div className="pt-2" dir="ltr">
            <StatusToggle
              checked={slide.status === 'active'}
              onChange={() => onToggleStatus(slide.id)}
              disabled={loading.status}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <AdminButton
            onClick={() => {
              setIsEditing(true);
              resetError('update');
            }}
            variant="secondary"
            size="sm"
            className="flex-1"
          >
            تعديل
          </AdminButton>
          <AdminButton
            onClick={handleDelete}
            disabled={loading.delete}
            variant="danger"
            size="sm"
            loading={loading.delete}
            className="flex-1"
          >
            {loading.delete ? 'جاري الحذف...' : 'حذف'}
          </AdminButton>
        </div>

        {errors.delete && (
          <p className="text-sm text-red-400 text-center mt-2">{errors.delete}</p>
        )}
      </div>

      {/* Edit Sheet */}
      {isEditing && (
        <EditSlideSheet
          slide={slide}
          onClose={() => {
            setIsEditing(false);
            resetError('update');
          }}
          onUpdate={handleUpdate}
          products={products}
          isLoading={loading.update}
          error={errors.update}
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
  error
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    productId: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [validationError, setValidationError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setValidationError('Please select a valid image file');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setValidationError('Image size should be less than 5MB');
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
      setValidationError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.image) {
      setValidationError('Please select an image');
      return;
    }

    if (!formData.title.trim() || !formData.productId) {
      setValidationError('Please fill in all required fields');
      return;
    }

    const success = await onCreate(formData);
    if (success) {
      onClose();
    }
  };

  return (
    <ResponsiveSheet
      isOpen={true}
      onClose={onClose}
      title="إضافة عرض جديد"
      size="default"
    >
      {(error || validationError) && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 text-red-500">
          {error || validationError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <ResponsiveFormField label="الصورة" required>
          <ImageUpload
            imagePreview={imagePreview}
            onChange={handleImageChange}
            inputId="create-slide-image"
          />
        </ResponsiveFormField>

        {/* Title Input */}
        <ResponsiveInput
          name="العنوان"
          value={getDefaultValue(formData.title)}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder=""
          hint="عنوان العرض"
          required
        />

        {/* Description Input */}
        <ResponsiveTextarea
          name="الوصف"
          value={getDefaultValue(formData.description)}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder=""
          hint="وصف العرض"
          rows={3}
        />

        {/* Product Select */}
        <ResponsiveSelect
          name="المنتج"
          value={getDefaultValue(formData.productId)}
          onChange={(value) => setFormData(prev => ({ ...prev, productId: value }))}
          options={products.map(product => ({
            value: product.id,
            label: product.name
          }))}
          placeholder=""
          hint="اختر منتج"
          required
        />

        {/* Action Buttons */}
        <ResponsiveButtonGroup className="pt-6 border-t border-neutral-800/50">
          <AdminButton
            type="button"
            onClick={onClose}
            variant="secondary"
            size="md"
          >
            إلغاء
          </AdminButton>
          <AdminButton
            type="submit"
            disabled={isLoading}
            variant="primary"
            size="md"
            loading={isLoading}
          >
            {isLoading ? 'جاري الإنشاء...' : 'إنشاء'}
          </AdminButton>
        </ResponsiveButtonGroup>
      </form>
    </ResponsiveSheet>
  );
};

const ImageUpload = ({ imagePreview, onChange, inputId }) => (
  <div className="relative">
    <input
      type="file"
      accept="image/*"
      onChange={onChange}
      className="hidden"
      id={inputId}
    />
    <label
      htmlFor={inputId}
      className="block w-full aspect-video rounded-xl border-2 border-dashed
               border-neutral-700/50 hover:border-blue-500/50 transition-colors
               cursor-pointer overflow-hidden"
    >
      {imagePreview ? (
        <img
          src={imagePreview}
          alt="Preview"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <Image className="w-8 h-8 text-neutral-400 mb-2" />
          <span className="text-sm text-neutral-400">
            اختر صورة أو اسحبها هنا
          </span>
        </div>
      )}
    </label>
  </div>
);

const ProductSelect = ({ value, onChange, products }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-12 bg-neutral-800/70 rounded-xl px-4 text-white
               border border-neutral-700/50 focus:border-blue-500/50
               appearance-none placeholder:text-neutral-500"
    >
      <option value="">اختر منتج</option>
      {products.map(product => (
        <option key={product.id} value={product.id}>
          {product.name}
        </option>
      ))}
    </select>
    <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 
                         w-5 h-5 text-neutral-400 pointer-events-none" />
  </div>
);

const EditSlideSheet = ({
  slide,
  onClose,
  onUpdate,
  products,
  isLoading,
  error
}) => {
  const [formData, setFormData] = useState({
    title: slide.title,
    description: slide.description || '',
    productId: slide.productId,
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [validationError, setValidationError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setValidationError('Please select a valid image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setValidationError('Image size should be less than 5MB');
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
      setValidationError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.productId) {
      setValidationError('Please fill in all required fields');
      return;
    }

    const success = await onUpdate(formData);
    if (success) {
      onClose();
    }
  };

  return (
    <ResponsiveSheet
      isOpen={true}
      onClose={onClose}
      title="تعديل العرض"
      size="default"
    >
      {(error || validationError) && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 text-red-500">
          {error || validationError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <ResponsiveFormField label="الصورة" required>
          <ImageUpload
            imagePreview={imagePreview || slide.imageUrl}
            onChange={handleImageChange}
            inputId="edit-slide-image"
          />
        </ResponsiveFormField>

        <ResponsiveInput
          name="العنوان"
          value={getDefaultValue(formData.title)}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder=""
          hint="عنوان العرض"
          required
        />

        <ResponsiveTextarea
          name="الوصف"
          value={getDefaultValue(formData.description)}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder=""
          hint="وصف العرض"
          rows={3}
        />

        <ResponsiveSelect
          name="المنتج"
          value={getDefaultValue(formData.productId)}
          onChange={(value) => setFormData(prev => ({ ...prev, productId: value }))}
          options={products.map(product => ({
            value: product.id,
            label: product.name
          }))}
          placeholder=""
          hint="اختر منتج"
          required
        />

        {formData.productId && (
          <div className="bg-neutral-800/30 rounded-xl p-4">
            <ProductPreview
              product={products.find(p => p.id === formData.productId)}
            />
          </div>
        )}

        <ResponsiveButtonGroup className="pt-6 border-t border-neutral-800/50">
          <AdminButton
            type="button"
            onClick={onClose}
            variant="secondary"
            size="md"
          >
            إلغاء
          </AdminButton>
          <AdminButton
            type="submit"
            disabled={isLoading}
            variant="primary"
            size="md"
            loading={isLoading}
          >
            {isLoading ? 'جاري الحفظ...' : 'حفظ'}
          </AdminButton>
        </ResponsiveButtonGroup>
      </form>
    </ResponsiveSheet>
  );
};

const LoadingState = () => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center space-y-4">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
      <p className="text-neutral-400">جاري تحميل العروض...</p>
    </div>
  </div>
);

const ErrorState = ({ message }) => (
  <div className="text-center py-12">
    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
    <h3 className="text-xl font-bold text-white mb-2">حدث خطأ</h3>
    <p className="text-neutral-400">{message}</p>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-16">
    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 
                  flex items-center justify-center mb-8 shadow-2xl shadow-black/20 border border-neutral-800/50">
      <Image className="w-12 h-12 text-blue-400" />
    </div>
    <h3 className="text-2xl font-bold text-white mb-4">لا توجد عروض</h3>
    <p className="text-neutral-400 text-lg max-w-md mx-auto leading-relaxed">
      ابدأ بإضافة عروض جديدة لعرضها للعملاء
    </p>
  </div>
);

const ProductPreview = ({ product }) => {
  if (!product) return null;

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
          <span className="text-sm text-neutral-400">
            {product.variants.length} {product.variants.length === 1 ? 'لون' : 'ألوان'}
          </span>
          <span className="text-sm text-neutral-400">
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