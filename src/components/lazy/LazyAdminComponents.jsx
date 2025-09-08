import React, { lazy } from 'react';
import LazyWrapper from './LazyWrapper';

// Lazy load admin components
const LazyAnalytics = lazy(() => 
  import('../../admin/pages/Analytics').catch(err => {
    console.error('Failed to load Analytics component:', err);
    return { default: () => <div>Error loading Analytics</div> };
  })
);

const LazyProducts = lazy(() => 
  import('../../admin/pages/Products').catch(err => {
    console.error('Failed to load Products component:', err);
    return { default: () => <div>Error loading Products</div> };
  })
);

const LazyOrders = lazy(() => 
  import('../../admin/pages/Orders').catch(err => {
    console.error('Failed to load Orders component:', err);
    return { default: () => <div>Error loading Orders</div> };
  })
);

const LazyCustomers = lazy(() => 
  import('../../admin/pages/Customers').catch(err => {
    console.error('Failed to load Customers component:', err);
    return { default: () => <div>Error loading Customers</div> };
  })
);

const LazySlides = lazy(() => 
  import('../../admin/pages/Slides').catch(err => {
    console.error('Failed to load Slides component:', err);
    return { default: () => <div>Error loading Slides</div> };
  })
);

const LazyCoupons = lazy(() => 
  import('../../admin/pages/Coupons').catch(err => {
    console.error('Failed to load Coupons component:', err);
    return { default: () => <div>Error loading Coupons</div> };
  })
);

const LazyImgUpload = lazy(() => 
  import('../../admin/pages/ImgUpload').catch(err => {
    console.error('Failed to load ImgUpload component:', err);
    return { default: () => <div>Error loading ImgUpload</div> };
  })
);

// Wrapped components with loading states
export const Analytics = (props) => (
  <LazyWrapper
    component={LazyAnalytics}
    loadingMessage="جاري تحميل التحليلات..."
    {...props}
  />
);

export const Products = (props) => (
  <LazyWrapper
    component={LazyProducts}
    loadingMessage="جاري تحميل المنتجات..."
    {...props}
  />
);

export const Orders = (props) => (
  <LazyWrapper
    component={LazyOrders}
    loadingMessage="جاري تحميل الطلبات..."
    {...props}
  />
);

export const Customers = (props) => (
  <LazyWrapper
    component={LazyCustomers}
    loadingMessage="جاري تحميل العملاء..."
    {...props}
  />
);

export const Slides = (props) => (
  <LazyWrapper
    component={LazySlides}
    loadingMessage="جاري تحميل الشرائح..."
    {...props}
  />
);

export const Coupons = (props) => (
  <LazyWrapper
    component={LazyCoupons}
    loadingMessage="جاري تحميل الكوبونات..."
    {...props}
  />
);

export const ImgUpload = (props) => (
  <LazyWrapper
    component={LazyImgUpload}
    loadingMessage="جاري تحميل أداة رفع الصور..."
    {...props}
  />
);