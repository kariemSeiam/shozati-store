import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Helmet } from 'react-helmet';
import App from './App';
import './index.css';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import AdminDashboard from './admin/AdminApp';

// Protected route component that checks for valid key
const ProtectedAdminRoute = ({ children }) => {
  const [searchParams] = useSearchParams();
  const key = searchParams.get('key');
  
  if (key !== '112233') {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Enhanced SEO Wrapper with Rich Structured Data
const SEOWrapper = ({ children }) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": "https://shozati.com",
    "name": "شوزاتي | Shozati",
    "alternateName": "Shozati Shoes",
    "description": "متجر شوزاتي - المتجر الرائد للأحذية العصرية في مصر. تشكيلة واسعة من الأحذية النسائية الأنيقة مع ضمان الجودة وخدمة التوصيل السريع لجميع المحافظات",
    "url": "https://shozati.com",
    "logo": "https://shozati.com/logo.svg",
    "image": [
      "https://shozati.com/storefront.jpg",
      "https://shozati.com/products.jpg"
    ],
    "telephone": "+201033939828",
    "currenciesAccepted": "EGP",
    "paymentAccepted": ["Cash on Delivery", "Credit Card", "Debit Card"],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "EG",
      "addressRegion": "Cairo"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "30.0444",
      "longitude": "31.2357"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "10:00",
      "closes": "23:00"
    },
    "priceRange": "$$",
    "hasMap": "https://g.page/shozati",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "1250"
    }
  };

  return (
    <>
      <Helmet>
        {/* Enhanced Primary Meta Tags */}
        <title>شوزاتي  | Shozati</title>
        <meta name="title" content="شوزاتي | Shozati" />
        <meta name="description" content="اكتشفي أحدث تشكيلات الأحذية النسائية العصرية في مصر. أحذية أنيقة بجودة عالية وأسعار مناسبة. توصيل سريع لجميع المحافظات، ضمان الجودة، وخدمة عملاء متميزة. تسوقي الآن!" />
        <meta name="keywords" content="احذية نسائية, احذية حريمي, شوزات, متجر احذية, احذية مصر, شوزاتي" />
        
        {/* Open Graph / Facebook - Enhanced */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://shozati.com/" />
        <meta property="og:site_name" content="Shozati شوزاتي" />
        <meta property="og:title" content="شوزاتي | Shozati" />
        <meta property="og:description" content="اكتشفي أحدث تشكيلات الأحذية النسائية العصرية في مصر. أحذية أنيقة بجودة عالية وأسعار مناسبة. توصيل لجميع المحافظات 🚚 ضمان الجودة ✨" />
        <meta property="og:image" content="https://shozati.com/social-cover.jpg" />
        <meta property="og:locale" content="ar_EG" />
        <meta property="og:locale:alternate" content="en_US" />

        {/* Twitter - Enhanced */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@shozati" />
        <meta name="twitter:creator" content="@shozati" />
        <meta name="twitter:title" content="شوزاتي | Shozati" />
        <meta name="twitter:description" content="اكتشفي أحدث تشكيلات الأحذية النسائية العصرية في مصر. توصيل سريع ✈️ ضمان الجودة 💎 أسعار مناسبة 🏷️" />
        <meta name="twitter:image" content="https://shozati.com/social-cover.jpg" />

        {/* Mobile & PWA Optimizations */}
        <meta name="theme-color" content="#1f2937" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="شوزاتي" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="شوزاتي" />
        
        {/* Additional SEO Optimizations */}
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-TileColor" content="#1f2937" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Fonts with Display Swap */}
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap"
          rel="stylesheet"
          media="print"
          onLoad="this.media='all'"
        />

        {/* Enhanced Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>

        {/* Language & Regional */}
        <link rel="canonical" href="https://shozati.com" />
        <link rel="alternate" href="https://shozati.com" hrefLang="ar-EG" />
        <link rel="alternate" href="https://shozati.com/" hrefLang="en" />
        <link rel="alternate" href="https://shozati.com" hrefLang="x-default" />
        
        {/* Preconnect to Required Origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Helmet>
      {children}
    </>
  );
};

// Main Routes component
const AppRoutes = () => {
  return (
    <Routes>
      {/* Main app route */}
      <Route path="/" element={<App />} />
      
      {/* Protected admin route */}
      <Route 
        path="/admin" 
        element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        } 
      />
      
      {/* Catch all route redirects to main app */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Enhanced Root Component
const Root = () => {
  return (
    <BrowserRouter basename="/">
      <StrictMode>
        <SEOWrapper>
          <AppRoutes />
        </SEOWrapper>
      </StrictMode>
    </BrowserRouter>
  );
};

// Initialize App
createRoot(document.getElementById('root')).render(<Root />);

export default Root;