# 🛍️ [Trendy Corner](https://www.trendy-corner.org) | تريندي كورنر

<div align="center">

![Trendy Corner Logo](public/logo.png)

**🇪🇬 Egypt's Premier Fashion E-commerce Platform | الوجهة الأولى للأناقة في مصر**

*A sophisticated, bilingual (Arabic/English) React-based e-commerce platform specializing in premium footwear and fashion accessories, featuring real-time inventory management, advanced admin dashboard, and seamless mobile experience*

[![Version](https://img.shields.io/badge/version-1.0.1-blue.svg)](https://github.com/trendy-corner/trendy-corner.org)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/demo-live-success.svg)](https://www.trendy-corner.org)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB.svg?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1.1-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)

[🚀 Live Demo](https://www.trendy-corner.org) • [📖 Documentation](#documentation) • [🤝 Contributing](#contributing) • [🌟 Features](#features)

</div>

---

## 🌟 Overview

**Trendy Corner** is a cutting-edge, full-stack e-commerce platform built with modern React and sophisticated backend integration. Designed specifically for the Egyptian fashion market, it offers a seamless bilingual shopping experience with advanced features including:

- 🌍 **Bilingual Support**: Full Arabic/English localization with RTL support
- 📱 **Mobile-First Design**: Responsive across all devices with native app-like experience
- 🎨 **Premium UI/UX**: Modern design with smooth animations and micro-interactions
- 🛒 **Advanced E-commerce**: Smart cart, wishlist, order tracking, and inventory management
- 🔐 **Secure Authentication**: Phone verification, OTP, and secure user sessions
- 📊 **Analytics Dashboard**: Comprehensive admin panel with real-time insights
- 🚀 **Performance Optimized**: Fast loading, image optimization, and SEO-ready

## 🎯 Target Audience

- **Fashion Enthusiasts** looking for premium footwear and accessories
- **Mobile Shoppers** who prefer seamless mobile commerce experience
- **Egyptian Market** with bilingual Arabic/English support
- **Admin Users** managing inventory, orders, and customer relationships

## ✨ Features

### 🛍️ **Customer Experience**
- **Bilingual Shopping** - Complete Arabic/English experience with RTL support
- **Smart Product Discovery** - Advanced filtering, search, and categorization
- **Interactive Product Views** - High-quality image galleries with zoom functionality
- **Real-time Cart Management** - Dynamic cart with quantity updates and calculations
- **Wishlist & Favorites** - Save and manage favorite products
- **Order Tracking** - Real-time order status with detailed tracking information
- **User Profiles** - Comprehensive account management with address book

### 📱 **Mobile Experience**
- **Progressive Web App** features for native app-like experience
- **Touch-optimized UI** with swipe gestures and smooth animations
- **Responsive Design** that works perfectly on all device sizes
- **Fast Loading** with optimized images and efficient caching

### 🎨 **Design & UX**
- **Modern UI Components** built with Tailwind CSS and custom styling
- **Smooth Animations** using Framer Motion for enhanced user experience
- **Interactive Elements** with hover effects, loading states, and micro-interactions
- **Accessibility Features** ensuring inclusive design for all users

### 🔧 **Admin Dashboard**
- **📊 Analytics & Reports** - Comprehensive sales and customer insights
- **📦 Product Management** - Full CRUD operations with image uploads
- **📋 Order Management** - Order processing, status updates, and tracking
- **👥 Customer Management** - Customer profiles, communication, and support
- **🎬 Promotional Content** - Slider management for marketing campaigns
- **🎫 Coupon System** - Discount codes and promotional campaigns

### 🔐 **Security & Authentication**
- **Phone Verification** with OTP for secure account creation
- **JWT Authentication** for secure API communications
- **Protected Routes** with role-based access control
- **Data Validation** on both frontend and backend
- **CORS Protection** and secure API endpoints

## 🛠️ Technology Stack

### **Frontend**
- **React 18.3.1** - Modern React with hooks and concurrent features
- **Vite 6.1.1** - Next-generation frontend tooling for fast development
- **React Router DOM 7.1.3** - Declarative routing for React applications
- **Tailwind CSS 3.4.17** - Utility-first CSS framework for rapid UI development
- **Framer Motion 11.0.8** - Production-ready motion library for React

### **UI Components & Libraries**
- **Lucide React 0.469.0** - Beautiful & consistent icons
- **React Hot Toast 2.5.1** - Smoking hot React notifications
- **React Helmet 6.1.0** - Document head management for SEO
- **Recharts 2.15.0** - Composable charting library for analytics

### **Maps & Location**
- **React Leaflet 4.2.1** - React components for Leaflet maps
- **Leaflet 1.9.4** - Leading open-source JavaScript library for maps

### **HTTP & API**
- **Axios 1.7.9** - Promise-based HTTP client for API communications

### **Development & Build Tools**
- **ESLint 9.17.0** - Code linting and quality assurance
- **PostCSS 8.4.49** - CSS transformation tool
- **Autoprefixer 10.4.20** - CSS vendor prefixing
- **gh-pages 6.3.0** - Automated deployment to GitHub Pages

### **Typography & Fonts**
- **Noto Kufi Arabic** - Beautiful Arabic typography support
- **Google Fonts Integration** - Optimized font loading

## 🏗️ Project Architecture

```
trendy-corner.org/
├── 📁 public/                    # Static assets
│   ├── logo.png                  # Brand logo
│   ├── vite.svg                  # Vite icon
│   └── icon.svg                  # App icon
├── 📁 src/                       # Source code
│   ├── 📁 admin/                 # Admin dashboard
│   │   ├── AdminApp.jsx          # Main admin component
│   │   ├── hooks.jsx             # Admin-specific hooks
│   │   └── 📁 pages/             # Admin pages
│   │       ├── Analytics.jsx     # Sales & performance analytics
│   │       ├── Products.jsx      # Product management
│   │       ├── Orders.jsx        # Order processing
│   │       ├── Customers.jsx     # Customer management
│   │       ├── Slides.jsx        # Promotional content
│   │       ├── Coupons.jsx       # Discount management
│   │       └── ImgUpload.jsx     # Image upload utility
│   ├── 📁 assets/                # Media assets
│   ├── App.jsx                   # Main application component
│   ├── main.jsx                  # Application entry point
│   ├── hooks.jsx                 # Custom React hooks & API logic
│   ├── index.css                 # Global styles
│   ├── CartProductComponent.jsx  # Shopping cart functionality
│   ├── FavoritesComponent.jsx    # Wishlist management
│   ├── HeaderComponent.jsx       # Navigation header
│   ├── HorizontalCategoryScroller.jsx # Category navigation
│   ├── ImageViewer.jsx           # Product image gallery
│   ├── OrdersComponent.jsx       # Order tracking & history
│   ├── PlacesGrid.jsx           # Location-based features
│   ├── ProductComponent.jsx      # Product display & interaction
│   ├── ProfileComponent.jsx      # User profile management
│   ├── PromotionalSlider.jsx     # Marketing slider
│   └── RamadanCountdown.jsx      # Special event features
├── 📄 package.json               # Dependencies & scripts
├── 📄 vite.config.js            # Build configuration
├── 📄 tailwind.config.js        # Styling configuration
├── 📄 postcss.config.js         # CSS processing
├── 📄 eslint.config.js          # Code quality rules
├── 📄 index.html                # HTML template
└── 📄 CNAME                     # Domain configuration
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (version 18.0 or higher)
- **npm** or **yarn** package manager
- Modern web browser with ES6+ support

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/trendy-corner/trendy-corner.org.git
   cd trendy-corner.org
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to see the application

### Build for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

## 🎮 Usage Examples

### Customer Shopping Flow
```bash
# Browse products by category
Visit: /

# Search for specific items
Use the search bar with Arabic or English terms

# Add items to cart
Click product → Select size/variant → Add to cart

# Checkout process
Cart → Login/Register → Address → Confirm Order
```

### Admin Dashboard Access
```bash
# Access admin panel
Visit: /?key=123123

# Manage products
Admin → Products → Add/Edit/Delete items

# Process orders
Admin → Orders → Update status, track shipments

# View analytics
Admin → Analytics → Sales reports, customer insights
```

## 🌐 API Integration

The application integrates with a Python/Flask backend API:

- **Base URL**: `https://shozati.pythonanywhere.com/api`
- **Authentication**: JWT-based with phone verification
- **Endpoints**: Products, Orders, Users, Analytics, Media Upload
- **Real-time Features**: Order tracking, inventory updates

## 📱 Mobile Features

- **Touch Gestures** - Swipe navigation, pinch-to-zoom
- **Offline Support** - Cached data for limited offline browsing
- **Push Notifications** - Order updates and promotional offers (planned)
- **Mobile Payments** - Integrated payment gateway support
- **GPS Integration** - Location-based delivery options

## 🎨 Design System

### Color Palette
- **Primary**: Blue gradient (#3B82F6 to #1E40AF)
- **Background**: Clean white (#FAFAFA) with subtle grays
- **Text**: High contrast (#111827) with accessible secondary (#6B7280)
- **Accent**: Success green, warning amber, error red

### Typography
- **Arabic**: Noto Kufi Arabic for perfect RTL support
- **Latin**: System fonts with fallbacks for optimal performance
- **Hierarchy**: Clear heading structure with proper spacing

### Components
- **Cards**: Subtle shadows with hover effects
- **Buttons**: Multiple variants with loading states
- **Forms**: Validation with real-time feedback
- **Modals**: Smooth animations with backdrop blur

## 🔐 Security Features

- **Input Validation** - All user inputs sanitized and validated
- **CSRF Protection** - Cross-site request forgery prevention
- **Rate Limiting** - API rate limiting to prevent abuse
- **Secure Headers** - Security headers for XSS protection
- **Data Encryption** - Sensitive data encrypted in transit and at rest

## 📊 Performance Optimizations

- **Code Splitting** - Dynamic imports for optimal bundle size
- **Image Optimization** - WebP format with fallbacks, lazy loading
- **Caching Strategy** - Service worker for efficient caching
- **Bundle Analysis** - Optimized dependencies and tree shaking
- **CDN Integration** - Fast content delivery worldwide

## 🌍 Internationalization (i18n)

- **Bilingual Support** - Complete Arabic and English translations
- **RTL Layout** - Right-to-left layout for Arabic content
- **Date Formatting** - Localized date and time formats
- **Currency** - Egyptian Pound (EGP) with proper formatting
- **Cultural Adaptation** - UI adapted for Egyptian market preferences

## 🧪 Testing

```bash
# Run linting
npm run lint

# Format code
npm run format

# Type checking (if TypeScript)
npm run type-check
```

## 📈 Analytics & Monitoring

The admin dashboard provides comprehensive analytics:

- **Sales Metrics** - Revenue, orders, conversion rates
- **Customer Insights** - User behavior, demographics, retention
- **Product Performance** - Best sellers, inventory turnover
- **Geographic Data** - Sales by region, delivery performance
- **Real-time Monitoring** - Live visitor tracking, system health

## 🚀 Deployment

The application is deployed on GitHub Pages with custom domain:

- **Production URL**: [www.trendy-corner.org](https://www.trendy-corner.org)
- **CI/CD**: Automated deployment via GitHub Actions
- **SSL**: Secure HTTPS with SSL certificate
- **CDN**: Fast global content delivery

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Process
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards
- Follow ESLint configuration
- Use Prettier for code formatting
- Write descriptive commit messages
- Include tests for new features
- Update documentation as needed

### Issues & Bug Reports
- Use the issue template
- Provide detailed reproduction steps
- Include browser/device information
- Add screenshots when applicable

## 📄 License

This project is released under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🏆 Acknowledgments

### Technologies
- **React Team** for the amazing React framework
- **Vite Team** for the lightning-fast build tool
- **Tailwind CSS** for the utility-first CSS framework
- **Framer Motion** for smooth animations
- **Leaflet** for mapping capabilities

### Design Inspiration
- Modern e-commerce platforms
- Egyptian cultural design elements
- Mobile-first design principles
- Accessibility best practices

### Community
- Open source contributors
- Beta testers and early users
- Feedback from the Egyptian developer community

## 📞 Contact & Support

- **Website**: [www.trendy-corner.org](https://www.trendy-corner.org)
- **Business Email**: [info@trendy-corner.org](mailto:info@trendy-corner.org)
- **Developer Email**: [dev@trendy-corner.org](mailto:dev@trendy-corner.org)
- **Phone**: +20 123 456 789
- **Address**: Downtown Mall, Talaat Harb Street, Cairo, Egypt

### Social Media
- **Facebook**: [@TrendyCornerEgypt](https://facebook.com/TrendyCornerEgypt)
- **Instagram**: [@trendy_corner_egypt](https://instagram.com/trendy_corner_egypt)
- **Twitter**: [@trendycorner_eg](https://twitter.com/trendycorner_eg)

---

<div align="center">

**Made with ❤️ in Egypt | صُنع بـ ❤️ في مصر**

*Bringing modern e-commerce to the Egyptian fashion market*

[![GitHub stars](https://img.shields.io/github/stars/trendy-corner/trendy-corner.org?style=social)](https://github.com/trendy-corner/trendy-corner.org)
[![Follow on Twitter](https://img.shields.io/twitter/follow/trendycorner_eg?style=social)](https://twitter.com/trendycorner_eg)

</div>
