import React, { Suspense, lazy } from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import './index.css';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';

// Lazy load components for better performance
const App = lazy(() => import('./App.jsx'));
const AdminDashboard = lazy(() => import('./admin/AdminApp.jsx'));

// Performance optimized loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-neutral-600 text-sm">جاري التحميل...</p>
    </div>
  </div>
);

// Protected route component that checks for valid key
const RouteHandler = () => {
  const [searchParams] = useSearchParams();
  const key = searchParams.get('key');
  const productCode = searchParams.get('code');
  const path = window.location.pathname;

  // Check for admin access - either via key parameter or direct admin path
  const adminAccessKey = '123123';
  const isAdminAccess = key === adminAccessKey || path.includes('/admin') || path.includes('admin');

  // If admin access is detected, show admin dashboard
  if (isAdminAccess) {
    return <AdminDashboard />;
  }
  // If product code is present, pass it to App component
  return <App productCode={productCode} />;
};

// Enhanced SEO Wrapper with Bilingual Structured Data
const SEOWrapper = ({ children }) => {
  // Note: Only the logo is used for images throughout
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": "https://trendy-corner.org",
    "name": "تريندي كورنر | Trendy Corner",
    "alternateName": "Trendy Corner Egypt",
    "description": "تريندي كورنر - الوجهة الأولى للأناقة في مصر. تشكيلة واسعة من الأحذية والإكسسوارات العصرية للرجال والنساء بجودة فائقة وتوصيل سريع لجميع أنحاء مصر. Trendy Corner - Your premier fashion destination in Egypt. Discover modern footwear and accessories for men & women with nationwide delivery.",
    "url": "https://trendy-corner.org",
    "logo": "https://trendy-corner.org/icon.svg",
    "image": "https://trendy-corner.org/icon.svg",
    "telephone": "+20123456789",
    "currenciesAccepted": "EGP",
    "paymentAccepted": ["Cash on Delivery", "Credit Card", "Debit Card"],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "EG",
      "addressRegion": "Cairo",
      "streetAddress": "Downtown Mall, Talaat Harb Street"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "30.0444",
      "longitude": "31.2357"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "00:00",
      "closes": "24:00"
    },
    "priceRange": "$$$",
    "hasMap": "https://goo.gl/maps/example",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "1500"
    }
  };

  return (
    <>
      <Helmet>
        {/* Bilingual Meta Tags */}
        <title>تريندي كورنر | Trendy Corner</title>
        <meta name="title" content="تريندي كورنر | Trendy Corner" />
        <meta name="description" content="اكتشف أحدث صيحات الموضة في مصر من تريندي كورنر! أحذية وإكسسوارات عالية الجودة للرجال والنساء. توصيل سريع - دفع عند الاستلام - ضمان الجودة. Discover the latest fashion trends at Trendy Corner Egypt. Premium quality footwear & accessories for men & women. Fast delivery - Cash on Delivery - Quality assurance." />
        <meta name="keywords" content="أحذية رجالي, أحذية نسائي, إكسسوارات موضة, تريندي كورنر, موضة مصرية, Trendy Corner Egypt, mens shoes, womens footwear, fashion accessories, Egyptian fashion" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://trendy-corner.org/" />
        <meta property="og:site_name" content="Trendy Corner" />
        <meta property="og:title" content="تريندي كورنر | Trendy Corner - أزياء عصرية للجميع" />
        <meta property="og:description" content="تسوق الآن أحدث تشكيلات الأحذية والإكسسوارات للرجال والنساء من تريندي كورنر. جودة عالمية - أسعار مناسبة - توصيل لجميع المحافظات. Shop now at Trendy Corner for premium footwear & accessories. Worldwide quality - Competitive prices - Nationwide delivery." />
        <meta property="og:image" content="https://trendy-corner.org/icon.svg" />
        <meta property="og:locale" content="ar_EG" />
        <meta property="og:locale:alternate" content="en_US" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@trendycorner_eg" />
        <meta name="twitter:title" content="Trendy Corner | تريندي كورنر" />
        <meta name="twitter:description" content="أحدث صيحات الموضة للرجال والنساء في مصر 🇪🇬 توصيل سريع ✈️ ضمان الجودة 💎 أسعار تنافسية 💵 Latest fashion trends in Egypt for men & women 🚚 Fast delivery ✨ Quality assurance" />
        <meta name="twitter:image" content="https://trendy-corner.org/icon.svg" />

        {/* Mobile & PWA Optimizations */}
        <meta name="theme-color" content="#2d3748" />
        <meta name="apple-mobile-web-app-title" content="Trendy Corner" />

        {/* Enhanced Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>

        {/* Language & Regional */}
        <link rel="alternate" href="https://trendy-corner.org/ar" hrefLang="ar-EG" />
        <link rel="alternate" href="https://trendy-corner.org/en" hrefLang="en-US" />

      </Helmet>
      {children}
    </>
  );
};

// Main Routes component with Suspense for lazy loading
const AppRoutes = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <Routes>
      <Route path="/" element={<RouteHandler />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
);

// Enhanced Root Component
const Root = () => (
  <HelmetProvider>
    <BrowserRouter basename="/">
      <StrictMode>
        <SEOWrapper>
          <AppRoutes />
        </SEOWrapper>
      </StrictMode>
    </BrowserRouter>
  </HelmetProvider>
);

// Initialize App
createRoot(document.getElementById('root')).render(<Root />);

export default Root;
