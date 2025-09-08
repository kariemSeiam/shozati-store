import React, { useState, useEffect } from 'react';
import {
  Search, PackageSearch, Plus, Edit3, Trash2, X, Image as ImageIcon,
  Filter, ChevronDown, Upload, Check, AlertCircle, CircleDollarSign, Package,
  Box, Tag, BarChart4, Archive, Grid, List
} from 'lucide-react';
import { useProducts } from '../hooks';
import { ProductImageUpload, useProductImageUpload } from './ImgUpload';
import {
  AdminCard,
  AdminButton,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  AdminStatCard,
  AdminModal,
  ADMIN_COLORS
} from '../components/DesignSystem';

// First, let's define our color options constant
const COLOR_OPTIONS = [
  { label: 'أسود', value: 'black', code: '#000000' },
  { label: 'أبيض', value: 'white', code: '#FFFFFF' },
  { label: 'أحمر', value: 'red', code: '#FF0000' },
  { label: 'أخضر', value: 'green', code: '#008000' },
  { label: 'أزرق', value: 'blue', code: '#0000FF' },
  { label: 'أزرق', value: 'blue', code: '#0ea5e9' },
  { label: 'برتقالي', value: 'orange', code: '#FFA500' },
  { label: 'بنفسجي', value: 'purple', code: '#800080' },
  { label: 'وردي', value: 'pink', code: '#FFC0CB' },
  { label: 'رمادي', value: 'gray', code: '#808080' },
  { label: 'بني', value: 'brown', code: '#A52A2A' },
  { label: 'أزرق فاتح', value: 'lightblue', code: '#38bdf8' },
  { label: 'فضي', value: 'silver', code: '#C0C0C0' }
];

const Products = () => {
  // Core state from hook
  const {
    products,
    totalProducts,
    filters,
    page,
    perPage,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    createError,
    updateError,
    deleteError,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImages,
    updateFilters,
    nextPage,
    previousPage
  } = useProducts();


  // Local UI state
  const [viewMode, setViewMode] = useState('list');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Calculate stats from products
  const stats = React.useMemo(() => {
    if (!products?.length) return {
      total: 0,
      active: 0,
      outOfStock: 0,
      revenue: 0
    };

    return products.reduce((acc, product) => {
      acc.total++;
      if (product.status === 'active') acc.active++;
      if (product.variants.some(v => v.sizes.every(s => !s.inStock))) {
        acc.outOfStock++;
      }
      acc.revenue += product.salesCount * product.basePrice;
      return acc;
    }, { total: 0, active: 0, outOfStock: 0, revenue: 0 });
  }, [products]);

  // Handlers
  const handleSearch = (value) => {
    updateFilters({ search: value });
  };


  const handleCategoryChange = (category) => {
    updateFilters({ category });
  };

  const handleCreateProduct = async (productData, imageFiles) => {
    try {
      const result = await createProduct(productData, imageFiles);
      if (result) {
        setIsCreateModalOpen(false);
        await fetchProducts();
      }
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };


  const handleUpdateProduct = async (productId, productData, imageFiles) => {
    try {
      const result = await updateProduct(productId, productData, imageFiles);
      if (result) {
        setIsEditModalOpen(false);
        setSelectedProduct(null);
        await fetchProducts();
      }
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    const result = await deleteProduct(productId);
    if (result) {
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
      await fetchProducts();
    }
  };
  return (
    <div className="min-h-screen bg-neutral-950 pb-20" dir="rtl">
      {/* Header for mobile */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-neutral-800/50">
        <h1 className="text-xl font-bold text-white">المنتجات</h1>
        <AdminButton
          onClick={() => setIsCreateModalOpen(true)}
          variant="primary"
          size="sm"
        >
          <Plus className="w-5 h-5" />
        </AdminButton>
      </div>

      {/* Stats Grid - Mobile Optimized */}
      <div className="p-4 md:p-6 grid grid-cols-2 gap-3 md:gap-6">
        <AdminStatCard
          title="إجمالي المنتجات"
          value={stats.total}
          icon={Box}
          color="primary"
        />
        <AdminStatCard
          title="منتجات نشطة"
          value={stats.active}
          icon={Check}
          color="success"
        />
      </div>

      {/* Actions Bar - Mobile Optimized */}
      <div className="sticky top-0 md:top-16 z-30 bg-neutral-950/95 backdrop-blur-xl p-4 md:p-6 
                     space-y-4 md:space-y-6 border-b border-neutral-800/50 shadow-2xl shadow-black/20">

        {/* Desktop Header and Actions */}
        <div className="hidden md:flex items-center justify-between gap-4">
          <AdminButton
            onClick={() => setIsCreateModalOpen(true)}
            variant="primary"
          >
            <Plus className="w-5 h-5" />
            <span>إضافة منتج</span>
          </AdminButton>

          <div className="flex items-center gap-2">
            <AdminButton
              onClick={() => setViewMode('grid')}
              variant={viewMode === 'grid' ? 'primary' : 'secondary'}
              size="sm"
            >
              <Grid className="w-5 h-5" />
            </AdminButton>
            <AdminButton
              onClick={() => setViewMode('list')}
              variant={viewMode === 'list' ? 'primary' : 'secondary'}
              size="sm"
            >
              <List className="w-5 h-5" />
            </AdminButton>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <AdminInput
            value={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="ابحث عن منتج..."
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
          {filters.search && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full
                       hover:bg-neutral-700/50 transition-colors"
            >
              <X className="w-4 h-4 text-neutral-400" />
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar py-2">
          {CATEGORIES.map(category => (
            <AdminButton
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              variant={filters.category === category.id ? 'primary' : 'ghost'}
              size="sm"
              className="whitespace-nowrap"
            >
              <category.icon className="w-4 h-4" />
              <span>{category.label}</span>
            </AdminButton>
          ))}
        </div>

        {/* Mobile View Mode Toggle */}
        <div className="md:hidden flex items-center justify-between">
          <span className="text-sm text-neutral-400">
            {products.length} منتج
          </span>
          <div className="flex items-center gap-2">
            <AdminButton
              onClick={() => setViewMode('grid')}
              variant={viewMode === 'grid' ? 'primary' : 'secondary'}
              size="sm"
            >
              <Grid className="w-5 h-5" />
            </AdminButton>
            <AdminButton
              onClick={() => setViewMode('list')}
              variant={viewMode === 'list' ? 'primary' : 'secondary'}
              size="sm"
            >
              <List className="w-5 h-5" />
            </AdminButton>
          </div>
        </div>
      </div>

      {/* Products Grid/List - Mobile Responsive */}
      <div className={`p-4 ${viewMode === 'grid'
        ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4'
        : 'space-y-3 md:space-y-4'}`}>
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} />
        ) : products.length === 0 ? (
          <EmptyState />
        ) : (
          products.map(product => (
            viewMode === 'grid' ? (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={() => {
                  setSelectedProduct(product);
                  setIsEditModalOpen(true);
                }}
                onDelete={() => {
                  setSelectedProduct(product);
                  setIsDeleteModalOpen(true);
                }}
              />
            ) : (
              <ProductListItem
                key={product.id}
                product={product}
                onEdit={() => {
                  setSelectedProduct(product);
                  setIsEditModalOpen(true);
                }}
                onDelete={() => {
                  setSelectedProduct(product);
                  setIsDeleteModalOpen(true);
                }}
              />
            )
          ))
        )}
      </div>

      {/* Modals */}
      {isCreateModalOpen && (
        <ProductModal
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateProduct}
          uploadImages={uploadProductImages}
          ediState={isEditModalOpen}
        />
      )}

      {isEditModalOpen && selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedProduct(null);
          }}
          onSubmit={(data, files) => handleUpdateProduct(selectedProduct.id, data, files)}
          uploadImages={uploadProductImages}
          editeState={isEditModalOpen}
        />
      )}

      {isDeleteModalOpen && selectedProduct && (
        <DeleteConfirmationModal
          product={selectedProduct}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedProduct(null);
          }}
          onConfirm={() => handleDeleteProduct(selectedProduct.id)}
          isDeleting={isDeleting}
          error={deleteError}
        />
      )}
    </div>
  );
};

const ProductModal = ({ product, onClose, onSubmit, uploadImages, ediState = true }) => {

  // Form initialization with default values 
  const initialFormState = {
    id: '',
    name: '',
    code: '',
    category: '',
    description: '',
    basePrice: '',
    discountPrice: '',
    status: 'active',
    features: [],
    tag: '',
    tagColor: '',
    variants: [{
      id: '',
      product_id: '',
      colorName: '',
      colorCode: '#000000',
      images: [],
      sizes: [{ size: '', quantity: 0 }]
    }],
    _imageFiles: {} // Add image files storage
  };

  // Form states
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize image upload hook
  const {
    handleFormImageUpload,
    clearImageFiles,
    uploadErrors,
    isUploading,
    uploadProgress
  } = useProductImageUpload(uploadImages);

  // Initialize form with product data if editing
  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id || '',
        name: product.name,
        code: product.code,
        category: product.category,
        description: product.description || '',
        basePrice: product.basePrice.toString(),
        discountPrice: product.discountPrice?.toString() || '',
        status: product.status,
        tag: product.tag,
        _imageFiles: {}, // Initialize empty image files storage
        tagColor: product.tagColor,
        features: product.features,
        variants: product.variants.map(variant => ({
          product_id: product.id,
          id: variant.id,
          colorName: variant.colorName,
          colorCode: variant.colorCode,
          images: variant.images,
          sizes: variant.sizes.map(size => ({
            size: size.size,
            quantity: size.quantity
          }))
        }))
      });
    }
  }, [product]);
  // Form field handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Feature handlers
  const handleFeatureChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  const addFeature = () => setFormData(prev => ({
    ...prev,
    features: [...prev.features, '']
  }));

  const removeFeature = (index) => setFormData(prev => ({
    ...prev,
    features: prev.features.filter((_, i) => i !== index)
  }));

  // Variant handlers
  const handleVariantChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      )
    }));
  };

  const addVariant = () => setFormData(prev => ({
    ...prev,
    variants: [...prev.variants, {
      id: '',
      product_id: '',
      colorName: '',
      colorCode: '#000000',
      images: [],
      sizes: [{ size: '', quantity: 0 }]
    }]
  }));

  const removeVariant = (index) => setFormData(prev => ({
    ...prev,
    variants: prev.variants.filter((_, i) => i !== index)
  }));

  // Size handlers
  const handleSizeChange = (variantIndex, sizeIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) =>
        i === variantIndex ? {
          ...variant,
          sizes: variant.sizes.map((size, j) =>
            j === sizeIndex ? { ...size, [field]: value } : size
          )
        } : variant
      )
    }));
  };

  const addSize = (variantIndex) => setFormData(prev => ({
    ...prev,
    variants: prev.variants.map((variant, i) =>
      i === variantIndex ? {
        ...variant,
        sizes: [...variant.sizes, { size: '', quantity: 0 }]
      } : variant
    )
  }));

  const removeSize = (variantIndex, sizeIndex) => setFormData(prev => ({
    ...prev,
    variants: prev.variants.map((variant, i) =>
      i === variantIndex ? {
        ...variant,
        sizes: variant.sizes.filter((_, j) => j !== sizeIndex)
      } : variant
    )
  }));

  // Update the form validation
  const validateForm = () => {
    const newErrors = {};

    // Basic field validation
    if (!formData.name.trim()) newErrors.name = 'اسم المنتج مطلوب';
    if (!formData.category) newErrors.category = 'الفئة مطلوبة';
    if (!formData.basePrice) newErrors.basePrice = 'السعر الأساسي مطلوب';
    if (isNaN(parseFloat(formData.basePrice))) newErrors.basePrice = 'السعر يجب أن يكون رقماً';
    if (formData.discountPrice && isNaN(parseFloat(formData.discountPrice))) {
      newErrors.discountPrice = 'سعر الخصم يجب أن يكون رقماً';
    }

    // Variant validation
    formData.variants.forEach((variant, i) => {
      if (!variant.colorName) newErrors[`variant${i}Color`] = 'اللون مطلوب';

      variant.sizes.forEach((size, j) => {
        if (!size.size) newErrors[`variant${i}Size${j}`] = 'المقاس مطلوب';
        if (isNaN(parseInt(size.quantity))) {
          newErrors[`variant${i}Quantity${j}`] = 'الكمية يجب أن تكون رقماً';
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Updated image upload handling
  const handleImageUpload = async (variantIndex, files) => {
    try {
      const updatedData = await handleFormImageUpload(variantIndex, formData, files);
      setFormData(updatedData);
    } catch (error) {
      console.error('Image upload failed:', error);
      // Error is already handled by the hook
    }
  };

  const handleImageRemove = (variantIndex, imageIndex) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, idx) =>
        idx === variantIndex ? {
          ...variant,
          images: variant.images.filter((_, imgIdx) => imgIdx !== imageIndex)
        } : variant
      )
    }));
  };

  // Updated submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const { cleanData, imageFiles } = clearImageFiles(formData);

      const submissionData = {
        ...cleanData,
        id: cleanData.id,
        name: cleanData.name,
        code: cleanData.code,
        category: cleanData.category,
        description: cleanData.description || '',
        basePrice: cleanData.basePrice.toString(),
        discountPrice: cleanData.discountPrice?.toString() || '',
        status: cleanData.status,
        tag: cleanData.tag,
        imageFiles: cleanData.imageFiles,
        tagColor: cleanData.tagColor,
        ...(cleanData.features?.length ? { features: cleanData.features } : {}),
        variants: cleanData.variants.map(variant => ({
          id: variant.id,
          product_id: cleanData.id,
          colorName: variant.colorName,
          colorCode: variant.colorCode,
          images: variant.images,
          sizes: variant.sizes.map(size => ({
            size: size.size,
            quantity: parseInt(size.quantity)
          }))
        }))
      };




      await onSubmit(submissionData, imageFiles);
      setIsSubmitting(false)
      onClose();
    } catch (error) {
      setErrors(prev => ({ ...prev, submit: error.message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-neutral-900 rounded-xl md:rounded-2xl w-full max-w-full md:max-w-3xl 
                    h-full md:max-h-[95vh] overflow-y-auto hide-scrollbar border border-neutral-700/50 backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 p-4 md:p-6">
          {/* Modal Header */}
          <div className="flex justify-between items-center sticky top-0 bg-neutral-900 py-2 -mx-4 md:-mx-6 px-4 md:px-6 border-b border-neutral-800/50"
            dir='ltr'>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-neutral-800/50 rounded-xl transition-colors"
            >
              <X className="w-6 h-6 text-neutral-400" />
            </button>
            <h2 className="text-lg md:text-xl font-bold text-white" dir="rtl">
              {product ? 'تعديل منتج' : 'إضافة منتج'}
            </h2>
          </div>

          {/* Basic Info Section */}
          <div className="space-y-4">
            <Input
              label="اسم المنتج"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
            />

            <Select
              label="الفئة"
              name="category"
              value={formData.category}
              onChange={handleChange}
              error={errors.category}
              options={[
                { value: 'men', label: 'رجالي' },
                { value: 'women', label: 'حريمي' },
                { value: 'bags', label: 'حقائب' }
              ]}
            />

            <Textarea
              label="الوصف"
              name="description"
              value={formData.description}
              onChange={handleChange}
              error={errors.description}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="السعر الأساسي"
                name="basePrice"
                type="number"
                value={formData.basePrice}
                onChange={handleChange}
                error={errors.basePrice}
              />
              <Input
                label="سعر الخصم (اختياري)"
                name="discountPrice"
                type="number"
                value={formData.discountPrice}
                onChange={handleChange}
                error={errors.discountPrice}
              />
            </div>

            <Select
              label="الحالة"
              name="status"
              value={formData.status}
              onChange={handleChange}
              error={errors.status}
              options={[
                { value: 'active', label: 'نشط' },
                { value: 'inactive', label: 'غير نشط' }
              ]}
            />
          </div>

          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="العلامة (اختياري)"
                name="tag"
                type="text"
                value={formData.tag}
                onChange={e => setFormData({ ...formData, tag: e.target.value })}
                error={errors.discountPrice}
              />
              <Select
                label="لون العلامة"
                name="tagColor"
                value={formData.tagColor}
                onChange={e => setFormData({ ...formData, tagColor: e.target.value })}
                error={errors.status}
                options={[
                  // Essential colors
                  { label: 'أزرق', value: '#3B82F6' },    // Blue
                  { label: 'أخضر', value: '#10B981' },    // Green
                  { label: 'أحمر', value: '#EF4444' },    // Red
                  { label: 'أزرق', value: '#0ea5e9' },    // Blue
                  { label: 'بنفسجي', value: '#8B5CF6' },  // Purple
                  { label: 'رمادي', value: '#64748B' },   // Gray
                  { label: 'وردي', value: '#EC4899' },    // Pink
                  { label: 'سماوي', value: '#0EA5E9' }    // Sky blue
                ]}
              />
            </div>
          </div>

          {/* Features Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">المميزات (اختياري)</h3>
              <button
                type="button"
                onClick={addFeature}
                className="p-2 bg-blue-500/10 text-blue-500 rounded-xl
                 hover:bg-blue-500/20 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {formData.features?.map((feature, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  placeholder="أدخل ميزة المنتج..."
                />
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="p-2 bg-red-500/10 text-red-500 rounded-xl
                   hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          {/* Variants Section */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">الألوان والمقاسات</h3>
              <button
                type="button"
                onClick={addVariant}
                className="p-2 bg-blue-500/10 text-blue-500 rounded-xl
                         hover:bg-blue-500/20 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {formData.variants.map((variant, variantIndex) => (
              <div
                key={variantIndex}
                className="bg-neutral-800/30 rounded-xl p-4 space-y-4"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                    <Select
                      label="اللون"
                      value={variant.colorName}
                      onChange={(e) => {
                        const selectedColor = COLOR_OPTIONS.find(color => color.value === e.target.value);
                        handleVariantChange(variantIndex, 'colorName', e.target.value);
                        handleVariantChange(variantIndex, 'colorCode', selectedColor?.code || '#000000');
                      }}
                      error={errors[`variant${variantIndex}Color`]}
                      options={COLOR_OPTIONS}
                    />

                    <Input
                      label="كود اللون"
                      type="color"
                      value={variant.colorCode}
                      onChange={(e) => handleVariantChange(variantIndex, 'colorCode', e.target.value)}
                    />
                  </div>
                  {formData.variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(variantIndex)}
                      className="p-2 bg-red-500/10 text-red-500 rounded-xl
                              hover:bg-red-500/20 transition-colors md:mr-4 self-start"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {ediState && (
                  <ProductImageUpload
                    variant={variant}
                    variantIndex={variantIndex}
                    onImageUpload={handleImageUpload}
                    onImageRemove={handleImageRemove}
                    isUploading={isUploading}
                    uploadProgress={uploadProgress}
                    error={uploadErrors[variantIndex]}
                  />
                )}


                {/* Sizes Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-white">المقاسات</h4>
                    <button
                      type="button"
                      onClick={() => addSize(variantIndex)}
                      className="p-2 bg-blue-500/10 text-blue-500 rounded-xl
                               hover:bg-blue-500/20 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {variant.sizes.map((size, sizeIndex) => (
                      <div key={sizeIndex} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <div className="flex-1">
                          <Input
                            placeholder="المقاس"
                            value={size.size}
                            onChange={(e) => handleSizeChange(
                              variantIndex,
                              sizeIndex,
                              'size',
                              e.target.value
                            )}
                            error={errors[`variant${variantIndex}Size${sizeIndex}`]}
                          />
                        </div>
                        <div className="flex-1">
                          <Input
                            type="number"
                            placeholder="الكمية"
                            value={size.quantity}
                            onChange={(e) => handleSizeChange(
                              variantIndex,
                              sizeIndex,
                              'quantity',
                              e.target.value
                            )}
                            error={errors[`variant${variantIndex}Quantity${sizeIndex}`]}
                          />
                        </div>
                        {variant.sizes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSize(variantIndex, sizeIndex)}
                            className="p-2 bg-red-500/10 text-red-500 rounded-xl
                                     hover:bg-red-500/20 transition-colors self-start"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-500/10 text-red-500 p-4 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <p>{errors.submit}</p>
            </div>
          )}

          {/* Submit Buttons - Mobile Fixed Bottom */}
          <div className="sticky bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800/50 
                         -mx-4 md:-mx-6 px-4 md:px-6 py-4 flex gap-3 md:gap-4">
            <AdminButton
              type="button"
              onClick={onClose}
              variant="secondary"
              className="flex-1 md:flex-none"
            >
              إلغاء
            </AdminButton>
            <AdminButton
              type="submit"
              disabled={isSubmitting || isUploading}
              variant="primary"
              loading={isSubmitting}
              className="flex-1 md:flex-none"
            >
              {isSubmitting ? (
                <span>جاري الحفظ...</span>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>حفظ</span>
                </>
              )}
            </AdminButton>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProductListItem = ({ product, onEdit, onDelete }) => {
  const mainImage = product.variants[0]?.images[0];
  const totalStock = product.variants.reduce((sum, variant) =>
    sum + variant.sizes.reduce((acc, size) => acc + size.quantity, 0), 0);

  // Calculate total variants and sizes
  const variantCount = product.variants.length;
  const sizesCount = product.variants.reduce((sum, variant) =>
    sum + variant.sizes.length, 0);

  return (
    <div className="group bg-neutral-800/30 rounded-2xl p-4 
                  border border-neutral-700/50 hover:border-blue-500/30
                  transition-all duration-300"
      dir='ltr'>
      <div className="flex gap-4"
        dir='rtl'>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-4"
            dir='ltr'>

            {/* Status Badge */}
            <div className={`px-2 py-1 rounded-full text-xs font-medium
                         ${product.status === 'active'
                ? 'bg-green-500/20 text-green-500'
                : 'bg-red-500/20 text-red-500'}`}>
              {product.status === 'active' ? 'نشط' : 'غير نشط'}
            </div>

            {/* Title and Code */}
            <div className="text-right">
              <h3 className="font-bold text-white group-hover:text-blue-500 
                           transition-colors">
                {product.name}
              </h3>
              <p className="text-sm text-neutral-400" dir='rtl'>
                كود: {product.code}
              </p>
            </div>
          </div>

          {/* Product Details */}
          <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2">
            {/* Price */}
            <div className="flex items-center gap-2">
              <CircleDollarSign className="w-4 h-4 text-blue-500" />
              <span className="text-blue-500 font-bold">
                {product.basePrice.toLocaleString('ar-EG')} جنيه
              </span>
              {product.discountPrice && (
                <span className="text-sm text-neutral-500 line-through">
                  {product.discountPrice.toLocaleString('ar-EG')} جنيه
                </span>
              )}
            </div>

            {/* Inventory */}
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-neutral-400" />
              <span className="text-neutral-400">
                المخزون: {totalStock}
              </span>
            </div>

            {/* Variants Count */}
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-blue-500"
                style={{ backgroundColor: product.variants[0]?.colorCode }} />
              <span className="text-neutral-400">
                {variantCount} لون, {sizesCount} مقاس
              </span>
            </div>
          </div>

          {/* Features Preview */}
          {product.features?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {product.features.slice(0, 3).map((feature, index) => (
                <span key={index}
                  className="px-2 py-1 rounded-lg bg-neutral-800 text-neutral-400 
                               text-sm">
                  {feature}
                </span>
              ))}
              {product.features.length > 3 && (
                <span className="px-2 py-1 rounded-lg bg-neutral-800 text-neutral-400 
                               text-sm">
                  +{product.features.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={onEdit}
            className="p-2 rounded-xl bg-blue-500/10 text-blue-500
                     hover:bg-blue-500/20 transition-colors"
          >
            <Edit3 className="w-5 h-5" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-xl bg-red-500/10 text-red-500
                     hover:bg-red-500/20 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Variants Preview */}
      <div className="mt-4 pt-4 border-t border-neutral-700/50">
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
          {product.variants.map((variant, index) => (
            <div key={index}
              className="flex-shrink-0 group/variant cursor-pointer">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                <img
                  src={variant.images[0]}
                  alt={variant.colorName}
                  className="w-full h-full object-cover transform transition-transform
                           duration-500 group-hover/variant:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t 
                               from-black/50 to-transparent" />
                <div className="absolute bottom-1 right-1 w-3 h-3 rounded-full"
                  style={{ backgroundColor: variant.colorCode }} />
              </div>
              <div className="mt-1 text-center">
                <p className="text-sm text-neutral-400">
                  {variant.colorName}
                </p>
                <p className="text-xs text-neutral-500">
                  {variant.sizes.length} مقاس
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


// Helper Form Components
const Input = React.forwardRef(({
  label,
  error,
  type = 'text',
  className = '',
  ...props
}, ref) => {
  return (
    <AdminInput
      ref={ref}
      label={label}
      error={error}
      type={type}
      className={className}
      {...props}
    />
  );
});

Input.displayName = 'Input';

const Textarea = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <AdminTextarea
      label={label}
      error={error}
      className={className}
      {...props}
    />
  );
};

const Select = ({
  label,
  error,
  options = [],
  className = '',
  ...props
}) => {
  return (
    <AdminSelect
      label={label}
      error={error}
      options={options}
      className={className}
      {...props}
    />
  );
};


// Helper Components (Using AdminStatCard from design system)
const StatCard = ({ title, value, icon, color }) => {
  return (
    <AdminStatCard
      title={title}
      value={value}
      icon={icon}
      color={color}
    />
  );
};

const ProductCard = ({ product, onEdit, onDelete }) => {
  const mainImage = product.variants[0]?.images[0];
  const totalStock = product.variants.reduce((sum, variant) =>
    sum + variant.sizes.reduce((acc, size) => acc + size.quantity, 0), 0);

  return (
    <AdminCard
      variant="default"
      padding="md"
      className="border-neutral-700/50 hover:border-primary-500/30 group space-y-3 md:space-y-4"
    >
      <div className="relative aspect-square rounded-lg md:rounded-xl overflow-hidden">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover transform transition-transform
                   duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Product Status Badge */}
        <div className="absolute top-1 md:top-2 right-1 md:right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${product.status === 'active'
              ? 'bg-green-500/20 text-green-500'
              : 'bg-red-500/20 text-red-500'}`}>
            {product.status === 'active' ? 'نشط' : 'غير نشط'}
          </span>
        </div>

        {/* Quick Actions */}
        <div className="absolute bottom-1 md:bottom-2 left-1 md:left-2 flex gap-1 md:gap-2 
                     opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-blue-500/20 text-blue-500
                         hover:bg-blue-500/30 transition-colors"
          >
            <Edit3 className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 md:p-2 rounded-lg md:rounded-xl bg-red-500/20 text-red-500
                         hover:bg-red-500/30 transition-colors"
          >
            <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-2">
        <h3 className="font-bold text-white text-sm md:text-base truncate">{product.name}</h3>
        <div className="flex items-center justify-between">
          <span className="text-xs md:text-sm text-neutral-400">
            المخزون: {totalStock}
          </span>
          <span className="text-primary-500 font-bold text-sm md:text-base">
            {product.basePrice.toLocaleString('ar-EG')} جنيه
          </span>
        </div>
      </div>
    </AdminCard>
  );
};

const DeleteConfirmationModal = ({ product, onClose, onConfirm }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
    <AdminCard variant="elevated" padding="lg" className="w-full max-w-md space-y-4">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-danger-500/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-danger-500" />
        </div>
        <h2 className="text-xl font-bold text-white" dir="rtl">تأكيد الحذف</h2>
        <p className="text-neutral-400" dir="rtl">
          هل أنت متأكد من حذف المنتج "{product.name}"؟
          <br />
          لا يمكن التراجع عن هذا الإجراء.
        </p>
        <div className="flex gap-4 pt-2">
          <AdminButton
            onClick={onClose}
            variant="secondary"
            className="flex-1"
          >
            إلغاء
          </AdminButton>
          <AdminButton
            onClick={onConfirm}
            variant="danger"
            className="flex-1"
          >
            حذف
          </AdminButton>
        </div>
      </div>
    </AdminCard>
  </div>
);

const LoadingState = () => (
  <div className="col-span-full flex items-center justify-center py-12">
    <div className="space-y-4 text-center">
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 
                    border-t-transparent rounded-full mx-auto" />
      <p className="text-neutral-400">جاري تحميل المنتجات...</p>
    </div>
  </div>
);

const ErrorState = ({ message }) => (
  <div className="col-span-full text-center py-12">
    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
    <h3 className="text-xl font-bold text-white mb-2">حدث خطأ</h3>
    <p className="text-neutral-400">{message}</p>
  </div>
);

const EmptyState = () => (
  <div className="col-span-full text-center py-12">
    <PackageSearch className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
    <h3 className="text-xl font-bold text-white mb-2">لا توجد منتجات</h3>
    <p className="text-neutral-400">لم يتم العثور على منتجات تطابق معايير البحث</p>
  </div>
);

const CATEGORIES = [
  { id: 'all', label: 'الكل', icon: Box },
  { id: 'men', label: 'رجالي', icon: Tag },
  { id: 'women', label: 'حريمي', icon: Archive }
];

export default Products;