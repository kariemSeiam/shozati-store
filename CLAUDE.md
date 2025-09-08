# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Trendy Corner** - a bilingual (Arabic/English) React-based e-commerce platform specializing in premium footwear and fashion accessories for the Egyptian market. The project uses modern React 18 with Vite for fast development and optimized production builds.

## Development Commands

### Core Development
- `npm run dev` - Start development server with host binding (0.0.0.0) for network access
- `npm run build` - Production build with optimizations
- `npm run build:analyze` - Build and analyze bundle size with vite-bundle-analyzer
- `npm run preview` - Preview production build locally

### Code Quality
- `npm run lint` - Run ESLint with React rules and max 0 warnings
- ESLint is configured for JSX files with React 18.3 settings

### Deployment
- `npm run deploy` - Deploy to GitHub Pages (runs build first)
- Uses gh-pages for automated deployment to trendy-corner.org

## Architecture Overview

### Frontend Stack
- **React 18.3.1** with automatic JSX runtime
- **Vite 7.0.5** for build tooling with custom chunk splitting
- **Tailwind CSS 3.4.17** with custom design system
- **Framer Motion 11.0.8** for animations and transitions
- **React Router DOM 7.1.3** for navigation
- **Axios 1.7.9** for API communication

### Key Libraries
- **react-hot-toast** - Notification system
- **lucide-react** - Icon library
- **react-leaflet + leaflet** - Map functionality
- **recharts** - Analytics charts
- **react-helmet-async** - SEO/head management

### API Integration
- Backend API: `https://shozati.pythonanywhere.com/api`
- Local dev API: `http://127.0.0.1:5004/api`
- JWT authentication with phone verification
- Centralized API utilities in `src/hooks.jsx`

### Project Structure

#### Core Application Files
- `src/App.jsx` - Main application component with routing and context providers
- `src/hooks.jsx` - Custom hooks, API utilities, and React contexts (AuthContext, CartContext)
- `src/main.jsx` - Application entry point
- `src/index.css` - Global styles and Tailwind imports

#### Key Components
- `src/HeaderComponent.jsx` - Navigation header with bilingual support
- `src/ProductComponent.jsx` - Product display with grid and detail sheets
- `src/CartProductComponent.jsx` - Shopping cart functionality
- `src/OrdersComponent.jsx` - Order tracking and history
- `src/ProfileComponent.jsx` - User profile with phone verification
- `src/FavoritesComponent.jsx` - Wishlist management
- `src/PromotionalSlider.jsx` - Marketing content slider
- `src/ImageViewer.jsx` - Product image gallery with zoom
- `src/HorizontalCategoryScroller.jsx` - Category navigation
- `src/PlacesGrid.jsx` - Location/delivery features

#### Admin Panel
- `src/admin/AdminApp.jsx` - Admin dashboard entry point
- `src/admin/hooks.jsx` - Admin-specific API hooks
- `src/admin/pages/` - Admin management pages:
  - `Analytics.jsx` - Sales and performance metrics
  - `Products.jsx` - Product CRUD operations
  - `Orders.jsx` - Order management
  - `Customers.jsx` - Customer management
  - `Slides.jsx` - Promotional content management
  - `Coupons.jsx` - Discount/coupon system
  - `ImgUpload.jsx` - Image upload utilities

### Design System

#### Tailwind Configuration
- Custom color palette with primary blue branding
- Arabic/RTL typography support using Tajawal font
- Enhanced animations and micro-interactions
- Responsive breakpoints optimized for mobile-first approach
- Custom gradient system and shadow utilities

#### Key Design Patterns
- Bilingual UI with seamless Arabic/English switching
- Mobile-first responsive design
- Performance-optimized animations using Framer Motion
- Consistent spacing and typography scales
- Accessible color contrast ratios

### State Management
- React Context for authentication (`AuthContext`)
- React Context for shopping cart (`CartContext`) 
- Local storage integration for persistence
- Optimistic UI updates with error handling

### Performance Optimizations
- Vite build configuration with manual chunk splitting:
  - `vendor-react` - React core
  - `vendor-motion` - Framer Motion
  - `vendor-ui` - UI libraries
  - `vendor-charts` - Recharts
  - `vendor-maps` - Leaflet
- Console removal in production builds
- Image optimization and lazy loading
- Bundle size monitoring with analyzer

### Authentication Flow
- Phone-based registration with OTP verification
- JWT token management with localStorage
- Protected routes based on authentication state
- Admin access via query parameter `?key=123123`

### Development Notes
- Uses ES modules with Vite
- Hot reload enabled for fast development
- ESLint enforces React best practices
- PostCSS with Autoprefixer for CSS compatibility
- No TypeScript - pure JavaScript with JSX