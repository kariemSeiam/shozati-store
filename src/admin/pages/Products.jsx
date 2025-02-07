import React, { useState, useEffect } from 'react';
import {
  Search, PackageSearch, Plus, Edit3, Trash2, X, Image as ImageIcon,
  Filter, ChevronDown, Upload, Check, AlertCircle, CircleDollarSign, Package,
  Box, Tag, BarChart4, Archive, Grid, List
} from 'lucide-react';
import { useProducts } from '../hooks';
import { ProductImageUpload, useProductImageUpload } from './ImgUpload';
import { code } from 'framer-motion/client';


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
  const [viewMode, setViewMode] = useState('grid');
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
    <div className="min-h-screen bg-gray-900 pb-20" dir="rtl">
      {/* Stats Grid */}
      <div className="p-4 grid grid-cols-2 gap-4">
        <StatCard
          title="إجمالي المنتجات"
          value={stats.total}
          icon={Box}
          color="blue"
        />
        <StatCard
          title="منتجات نشطة"
          value={stats.active}
          icon={Check}
          color="emerald"
        />
        <StatCard
          title="نفذت الكمية"
          value={stats.outOfStock}
          icon={AlertCircle}
          color="red"
        />
        <StatCard
          title="الإيرادات"
          value={`${stats.revenue.toLocaleString('ar-EG')} جنيه`}
          icon={BarChart4}
          color="amber"
        />
      </div>

      {/* Actions Bar */}
      <div className="sticky top-0 z-30 bg-gray-900/95 backdrop-blur-sm p-4 space-y-4 border-b border-gray-800">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white 
                     rounded-xl font-medium hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>إضافة منتج</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-colors
                       ${viewMode === 'grid'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-colors
                       ${viewMode === 'list'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="ابحث عن منتج..."
              className="w-full h-12 bg-gray-800 rounded-xl px-12 text-white
                     border border-gray-700 focus:border-blue-500
                     focus:ring-2 focus:ring-blue-500/50 text-right"
              dir="rtl"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            {filters.search && (
              <button
                onClick={() => handleSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full
                       hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          <button
            className="flex items-center gap-2 px-4 bg-gray-800 rounded-xl
                     text-gray-400 hover:bg-gray-700 transition-colors"
          >
            <Filter className="w-5 h-5" />
            <span>تصفية</span>
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar py-2">
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm
                       whitespace-nowrap transition-colors
                       ${filters.category === category.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              <category.icon className="w-4 h-4" />
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid/List */}
      <div className={`p-4 ${viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}`}>
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

const ProductModal = ({ product, onClose, onSubmit, uploadImages }) => {
  // Form initialization with default values 
  const initialFormState = {
    name: '',
    code: '',
    category: '',
    description: '',
    basePrice: '',
    discountPrice: '',
    status: 'active',
    features: [''],
    tag: '',
    tagColor: '',
    variants: [{
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
        features: product.features.length ? product.features : [''],
        variants: product.variants.map(variant => ({
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


  // Form validation
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
      if (!variant.colorName) newErrors[`variant${i}Color`] = 'اسم اللون مطلوب';

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
        features: cleanData.features.length ? cleanData.features : [''],
        variants: cleanData.variants.map(variant => ({
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-gray-900 rounded-2xl w-full max-w-3xl 
                    max-h-[90vh] overflow-y-auto hide-scrollbar">
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Modal Header */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-xl transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
            <h2 className="text-xl font-bold text-white">
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

            <Input
              label="كود المنتج"
              name="code"
              value={formData.code}
              onChange={handleChange}
              error={errors.code}
            />

            <Select
              label="الفئة"
              name="category"
              value={formData.category}
              onChange={handleChange}
              error={errors.category}
              options={[
                { value: 'clothing', label: 'ملابس' },
                { value: 'accessories', label: 'إكسسوارات' },
                { value: 'shoes', label: 'أحذية' },
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

            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
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
                  { value: 'blue', label: 'أزرق' },
                  { value: 'green', label: 'أخضر' },
                  { value: 'red', label: 'أحمر' },
                  { value: 'yellow', label: 'أصفر' },
                  { value: 'purple', label: 'بنفسجي' },
                ]}
              />
            </div>

          </div>

          {/* Features Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">المميزات</h3>
              <button
                type="button"
                onClick={addFeature}
                className="p-2 bg-blue-500/10 text-blue-500 rounded-xl
                         hover:bg-blue-500/20 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {formData.features.map((feature, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  placeholder="أدخل ميزة المنتج..."
                />
                {formData.features.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="p-2 bg-red-500/10 text-red-500 rounded-xl
                             hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
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
                className="bg-gray-800/30 rounded-xl p-4 space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div className="grid grid-cols-2 gap-4 flex-1">
                    <Input
                      label="اسم اللون"
                      value={variant.colorName}
                      onChange={(e) => handleVariantChange(variantIndex, 'colorName', e.target.value)}
                      error={errors[`variant${variantIndex}Color`]}
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
                              hover:bg-red-500/20 transition-colors ml-4"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <ProductImageUpload
                  variant={variant}
                  variantIndex={variantIndex}
                  onImageUpload={handleImageUpload}
                  onImageRemove={handleImageRemove}
                  isUploading={isUploading}
                  uploadProgress={uploadProgress}
                  error={uploadErrors[variantIndex]}
                />

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
                      <div key={sizeIndex} className="flex gap-4">
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
                                     hover:bg-red-500/20 transition-colors"
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

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-800 text-gray-400 rounded-xl
                       hover:bg-gray-700 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="px-6 py-2 bg-blue-500 text-white rounded-xl
                       hover:bg-blue-600 transition-colors disabled:opacity-50
                       disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white
                                rounded-full animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>حفظ</span>
                </>
              )}
            </button>
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
    <div className="group bg-gray-800/30 rounded-2xl p-4 
                  border border-gray-700/50 hover:border-blue-500/30
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
              <p className="text-sm text-gray-400">
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
                <span className="text-sm text-gray-500 line-through">
                  {product.discountPrice.toLocaleString('ar-EG')} جنيه
                </span>
              )}
            </div>

            {/* Inventory */}
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400">
                المخزون: {totalStock}
              </span>
            </div>

            {/* Variants Count */}
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-amber-500"
                style={{ backgroundColor: product.variants[0]?.colorCode }} />
              <span className="text-gray-400">
                {variantCount} لون, {sizesCount} مقاس
              </span>
            </div>
          </div>

          {/* Features Preview */}
          {product.features?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {product.features.slice(0, 3).map((feature, index) => (
                <span key={index}
                  className="px-2 py-1 rounded-lg bg-gray-800 text-gray-400 
                               text-sm">
                  {feature}
                </span>
              ))}
              {product.features.length > 3 && (
                <span className="px-2 py-1 rounded-lg bg-gray-800 text-gray-400 
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
      <div className="mt-4 pt-4 border-t border-gray-700/50">
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
                <p className="text-sm text-gray-400">
                  {variant.colorName}
                </p>
                <p className="text-xs text-gray-500">
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
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-400">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={`w-full h-12 bg-gray-800/50 rounded-xl px-4 text-white
                   border transition-colors duration-300
                   placeholder:text-gray-500 text-right
                   ${error
            ? 'border-red-500/50 focus:border-red-500'
            : 'border-gray-700/50 focus:border-blue-500'}
                   ${type === 'color' ? 'h-12 p-1' : ''}
                   ${className}`}
        dir="rtl"
        {...props}
      />
      {error && (
        <div className="flex items-center gap-2 mt-1 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
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
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-400">
          {label}
        </label>
      )}
      <textarea
        className={`w-full h-32 bg-gray-800/50 rounded-xl p-4 text-white
                   border transition-colors duration-300 resize-none text-right
                   placeholder:text-gray-500
                   ${error
            ? 'border-red-500/50 focus:border-red-500'
            : 'border-gray-700/50 focus:border-blue-500'}
                   ${className}`}
        dir="rtl"
        {...props}
      />
      {error && (
        <div className="flex items-center gap-2 mt-1 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
const ImageUpload = ({
  images = [],
  onUpload,
  onRemove,
  isUploading,
  error,
  label = "الصور"
}) => {
  const handleFileSelect = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;

    try {
      await onUpload(files[0]);
    } catch (err) {
      console.error('Upload error:', err);
    }

    e.target.value = '';
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-400">
          {label}
        </label>
        {isUploading && (
          <span className="text-sm text-blue-500">جاري الرفع...</span>
        )}
      </div>

      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
        {/* Existing Images */}
        {images.map((image, index) => (
          <div
            key={index}
            className="relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden group"
          >
            <img
              src={image}
              alt={`Product Image ${index + 1}`}
              className="w-full h-full object-cover transition-transform 
                       group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 
                          to-transparent opacity-0 group-hover:opacity-100 
                          transition-opacity" />
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute top-1 right-1 p-1.5 bg-black/50 rounded-lg
                       opacity-0 group-hover:opacity-100 transition-opacity
                       hover:bg-red-500/20"
            >
              <X className="w-4 h-4 text-white group-hover:text-red-500" />
            </button>
          </div>
        ))}

        {/* Upload Button */}
        <label className={`flex-shrink-0 w-24 h-24 flex items-center justify-center
                        rounded-xl cursor-pointer group transition-all duration-300
                        border-2 border-dashed
                        ${isUploading
            ? 'bg-blue-500/10 border-blue-500/30'
            : 'bg-gray-800/50 border-gray-700 hover:border-blue-500'}`}>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
          <Upload className={`w-6 h-6 transition-colors duration-300
                          ${isUploading
              ? 'text-blue-500 animate-pulse'
              : 'text-gray-400 group-hover:text-blue-500'}`} />
        </label>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500">
          <AlertCircle className="w-4 h-4" />
          <p>{error}</p>
        </div>
      )}
    </div>
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
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-400">
          {label}
        </label>
      )}
      <select
        className={`w-full h-12 bg-gray-800/50 rounded-xl px-4 text-white
                   border transition-colors duration-300 text-right
                   ${error
            ? 'border-red-500/50 focus:border-red-500'
            : 'border-gray-700/50 focus:border-blue-500'}
                   ${className}`}
        dir="rtl"
        {...props}
      >
        <option value="">اختر...</option>
        {options.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      {error && (
        <div className="flex items-center gap-2 mt-1 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};


// Helper Components
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className={`relative overflow-hidden rounded-2xl p-4 
                 bg-${color}-500/10 border border-${color}-500/20`}>
    <div className="absolute top-4 right-4">
      <Icon className={`w-6 h-6 text-${color}-500`} />
    </div>
    <div className="mt-6">
      <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      <div className="mt-2">
        <span className={`text-2xl font-bold text-${color}-500`}>{value}</span>
      </div>
    </div>
  </div>
);

const ProductCard = ({ product, onEdit, onDelete }) => {
  const mainImage = product.variants[0]?.images[0];
  const totalStock = product.variants.reduce((sum, variant) =>
    sum + variant.sizes.reduce((acc, size) => acc + size.quantity, 0), 0);

  return (
    <div className="group bg-gray-800/30 rounded-2xl p-4 space-y-4
                  border border-gray-700/50 hover:border-blue-500/30
                  transition-all duration-300">
      <div className="relative aspect-square rounded-xl overflow-hidden">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover transform transition-transform
                   duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Product Status Badge */}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${product.status === 'active'
              ? 'bg-green-500/20 text-green-500'
              : 'bg-red-500/20 text-red-500'}`}>
            {product.status === 'active' ? 'نشط' : 'غير نشط'}
          </span>
        </div>

        {/* Quick Actions */}
        <div className="absolute bottom-2 left-2 flex gap-2 opacity-0 
                     group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-2 rounded-xl bg-blue-500/20 text-blue-500
                         hover:bg-blue-500/30 transition-colors"
          >
            <Edit3 className="w-5 h-5" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-xl bg-red-500/20 text-red-500
                         hover:bg-red-500/30 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            المخزون: {totalStock}
          </span>
          <span className="text-blue-500 font-bold">
            {product.basePrice.toLocaleString('ar-EG')} جنيه
          </span>
        </div>
      </div>
    </div>

  );
};

const DeleteConfirmationModal = ({ product, onClose, onConfirm }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-gray-900 rounded-2xl w-full max-w-md p-6 space-y-4">
      <h2 className="text-xl font-bold text-white text-center">تأكيد الحذف</h2>
      <p className="text-gray-400 text-center">
        هل أنت متأكد من حذف المنتج "{product.name}"؟
        <br />
        لا يمكن التراجع عن هذا الإجراء.
      </p>
      <div className="flex gap-4">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 bg-gray-800 text-gray-400 rounded-xl
                   hover:bg-gray-700 transition-colors"
        >
          إلغاء
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl
                   hover:bg-red-600 transition-colors"
        >
          حذف
        </button>
      </div>
    </div>
  </div>
);

const LoadingState = () => (
  <div className="col-span-full flex items-center justify-center py-12">
    <div className="space-y-4 text-center">
      <div className="animate-spin w-8 h-8 border-4 border-blue-500 
                    border-t-transparent rounded-full mx-auto" />
      <p className="text-gray-400">جاري تحميل المنتجات...</p>
    </div>
  </div>
);

const ErrorState = ({ message }) => (
  <div className="col-span-full text-center py-12">
    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
    <h3 className="text-xl font-bold text-white mb-2">حدث خطأ</h3>
    <p className="text-gray-400">{message}</p>
  </div>
);

const EmptyState = () => (
  <div className="col-span-full text-center py-12">
    <PackageSearch className="w-16 h-16 text-gray-700 mx-auto mb-4" />
    <h3 className="text-xl font-bold text-white mb-2">لا توجد منتجات</h3>
    <p className="text-gray-400">لم يتم العثور على منتجات تطابق معايير البحث</p>
  </div>
);

const CATEGORIES = [
  { id: 'all', label: 'الكل', icon: Box },
  { id: 'men', label: 'رجالي', icon: Tag },
  { id: 'women', label: 'حريمي', icon: Archive },
  { id: 'shoes', label: 'أحذية', icon: Box },
  { id: 'bags', label: 'حقائب', icon: Archive }
];

export default Products;