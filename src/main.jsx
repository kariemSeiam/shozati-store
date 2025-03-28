import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Helmet } from 'react-helmet';
import App from './App';
import './index.css';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import AdminDashboard from './admin/AdminApp';

// Protected route component that checks for valid key
const RouteHandler = () => {
  const [searchParams] = useSearchParams();
  const key = searchParams.get('key');
  const productCode = searchParams.get('code');
  
  // If admin key is present, show admin dashboard
  if (key === '123123') {
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

        {/* Preload Critical Assets */}
        <link rel="preload" href="/icon.svg" as="image" />
      </Helmet>
      {children}
    </>
  );
};

// Main Routes component
const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<RouteHandler />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

// Enhanced Root Component
const Root = () => (
  <BrowserRouter basename="/">
    <StrictMode>
      <SEOWrapper>
        <AppRoutes />
      </SEOWrapper>
    </StrictMode>
  </BrowserRouter>
);

// Initialize App
createRoot(document.getElementById('root')).render(<Root />);

export default Root;
