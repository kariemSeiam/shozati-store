import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { useSlides } from './hooks';

const PromotionalSlider = ({ onSelect }) => {
  const { slides, loading, error, fetchSlides } = useSlides();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const touchRef = useRef({ start: 0, end: 0 });
  const autoPlayRef = useRef(null);
  const sliderRef = useRef(null);

  const AUTO_PLAY_INTERVAL = 5000;
  const SWIPE_THRESHOLD = 50;
  const SWIPE_VELOCITY_THRESHOLD = 0.5;

  const goToSlide = useCallback((index) => {
    let newIndex = index;
    if (index < 0) newIndex = slides?.length - 1;
    else if (index >= slides?.length) newIndex = 0;
    setCurrentIndex(newIndex);
  }, [slides?.length]);

  const handleSwipe = useCallback((direction) => {
    setSwipeDirection(direction);
    if (direction === 'right') {
      goToSlide(currentIndex - 1);
    } else {
      goToSlide(currentIndex + 1);
    }
    setTimeout(() => setSwipeDirection(null), 300);
  }, [currentIndex, goToSlide]);

  // Auto-play functionality
  useEffect(() => {
    if (!slides?.length || slides.length <= 1 || isPaused) return;
    autoPlayRef.current = setInterval(() => {
      handleSwipe('left');
    }, AUTO_PLAY_INTERVAL);
    return () => autoPlayRef.current && clearInterval(autoPlayRef.current);
  }, [slides, isPaused, handleSwipe]);

  // Touch handlers with velocity tracking
  const handleTouchStart = (e) => {
    setIsPaused(true);
    touchRef.current = {
      start: e.touches[0].clientX,
      startTime: Date.now(),
      end: e.touches[0].clientX
    };
  };

  const handleTouchMove = (e) => {
    touchRef.current.end = e.touches[0].clientX;
    const diff = touchRef.current.start - touchRef.current.end;
    const element = sliderRef.current;
    if (element) {
      element.style.transform = `translateX(${-diff * 0.5}px)`;
    }
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    const element = sliderRef.current;
    if (element) {
      element.style.transform = '';
    }

    const { start, end, startTime } = touchRef.current;
    const distance = start - end;
    const duration = Date.now() - startTime;
    const velocity = Math.abs(distance / duration);

    if (Math.abs(distance) > SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY_THRESHOLD) {
      handleSwipe(distance > 0 ? 'left' : 'right');
    }

    touchRef.current = { start: 0, end: 0 };
  };

  if (loading) {
    return (
      <div className="relative h-48 md:h-96 rounded-xl overflow-hidden bg-sky-50">
        <div className="absolute inset-0 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-sky-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative h-48 md:h-96 rounded-xl overflow-hidden bg-sky-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-sky-700 mb-4">فشل في تحميل المحتوى</p>
          <button
            onClick={fetchSlides}
            className="px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 
                     transition-colors shadow-sm hover:shadow-md"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (!slides?.length) return null;

  return (
    <div className="relative h-48 md:h-96 rounded-xl overflow-hidden bg-sky-50/50 shadow-md">
      <div
        ref={sliderRef}
        className="absolute inset-0 transition-transform duration-300"
        dir="rtl"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence initial={false} mode="wait">
          {slides.map((slide, index) => (
            <motion.div
              key={slide.id}
              initial={{ 
                opacity: 0,
                x: swipeDirection === 'left' ? 100 : -100 
              }}
              animate={{ 
                opacity: index === currentIndex ? 1 : 0,
                x: index === currentIndex ? 0 : swipeDirection === 'left' ? -100 : 100,
                transition: { duration: 0.3 }
              }}
              exit={{ 
                opacity: 0,
                x: swipeDirection === 'left' ? -100 : 100 
              }}
              className="absolute inset-0 cursor-pointer"
              onClick={() => onSelect?.(slide.product)}
            >
              <div className="relative h-full">
                <img
                  src={slide.imageUrl}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                />
                <div className="absolute" />
                <div className="absolute bottom-0 right-0 p-6 text-right max-w-2xl">
                  <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                    {slide.title}
                  </h3>
                  <p className="text-sm text-sky-50 drop-shadow-md">
                    {slide.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Progress indicators */}
        <div className="absolute bottom-2 inset-x-0 flex justify-center gap-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                goToSlide(index);
              }}
              className="group"
              aria-label={`الانتقال إلى الشريحة ${index + 1}`}
            >
              <motion.div
                animate={{
                  width: currentIndex === index ? 24 : 8,
                  opacity: currentIndex === index ? 1 : 0.7
                }}
                className="h-2 bg-white rounded-full transition-all duration-300 
                         shadow-sm group-hover:opacity-90"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromotionalSlider;