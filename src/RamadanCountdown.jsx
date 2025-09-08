import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Star, Gift, Sparkles } from 'lucide-react';

// Optimized sub-components
const MemoizedMoon = memo(({ size = 20 }) => (
  <motion.svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    animate={{
      rotate: [0, 10, 0],
      scale: [1, 1.05, 1]
    }}
    transition={{
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    <path
      d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="rgba(59, 130, 246, 0.1)"
      className="text-primary-500"
    />
                  <circle cx="12" cy="12" r="2" fill="currentColor" className="text-primary-600" />
  </motion.svg>
));

const MemoizedStar = memo(({ size = 12, delay = 0, className = "" }) => (
  <motion.svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    animate={{
      scale: [0.8, 1, 0.8],
      opacity: [0.6, 1, 0.6]
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      delay,
      ease: "easeInOut"
    }}
  >
    <path
      d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="rgba(59, 130, 246, 0.1)"
      className="text-primary-400"
    />
  </motion.svg>
));

// Main component
const RamadanToEidProgress = () => {
  // Current Ramadan day (hardcoded to 22 as per requirement)
  const currentDay = 22;
  const totalDays = 30;
  const remainingDays = totalDays - currentDay;
  
  // Messages for inspiration
  const [messageIndex, setMessageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  // Pre-compute days array for performance
  const daysArray = useMemo(() => 
    Array.from({ length: totalDays }, (_, i) => ({
      day: i + 1,
      completed: i + 1 <= currentDay,
      current: i + 1 === currentDay,
      eid: i + 1 === totalDays
    })), [currentDay]);
  
  // Inspirational messages
  const messages = useMemo(() => [
    "اللهم بلغنا ليلة القدر",
    "اجتهد في العشر الأواخر",
    "العيد قادم ان شاء الله"
  ], []);
  
  // Event handlers
  const handleHoverStart = useCallback(() => setIsHovered(true), []);
  const handleHoverEnd = useCallback(() => setIsHovered(false), []);
  
  // Cycle through messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [messages]);

  return (
    <motion.div
      dir="rtl"
      className="relative px-4 pb-0 pt-4 overflow-hidden"
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
    >
      {/* Background effect */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: isHovered ? 1.05 : 1,
            opacity: isHovered ? 0.15 : 0.1
          }}
          className="w-full h-full"
          style={{
                          backgroundImage: `
                radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 70%),
                linear-gradient(45deg, rgba(245, 158, 11, 0.1) 0%, transparent 100%)
              `
          }}
        />
      </div>
      
      {/* Main container */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-12 rounded-xl border border-primary-200 relative overflow-hidden shadow-sm"
        style={{
          background: `
            linear-gradient(90deg, 
              rgba(59, 130, 246, 0.03) 0%, 
              rgba(245, 158, 11, 0.03) 50%,
              rgba(59, 130, 246, 0.03) 100%
            )
          `,
          backdropFilter: 'blur(5px)'
        }}
      >
        <div className="h-full px-3 flex items-center justify-between">
          {/* Left: Icon and current day */}
          <div className="flex items-center gap-1.5 h-full">
            <motion.div
              className="relative"
              animate={{
                rotate: [0, 360],
                scale: isHovered ? 1.1 : 1
              }}
              transition={{
                rotate: {
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                },
                scale: {
                  duration: 0.3
                }
              }}
            >
                              <div className="absolute inset-0 bg-primary-500/10 rounded-full blur-sm" />
              <MemoizedMoon size={18} />
            </motion.div>
            
            <div className="flex flex-col justify-center h-full">
              <div className="flex items-baseline">
                <span className="text-xs font-semibold text-primary-600">
                  {currentDay === totalDays ? "عيد مبارك" : `رمضان ${currentDay}`}
                </span>
              </div>
            </div>
          </div>
          
          {/* Middle: Progress bar and days */}
          <div className="flex-grow mx-3 h-full relative flex items-center">
            {/* Progress line */}
                          <div className="h-1 bg-primary-100 rounded-full w-full absolute">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full"
                style={{ width: `${(currentDay / totalDays) * 100}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${(currentDay / totalDays) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            
            {/* Days markers */}
            <div className="w-full h-full absolute flex justify-between items-center px-1">
              {daysArray.map((day, index) => {
                // Only show a subset of day markers for compactness
                if (index % 5 !== 0 && !day.current && index !== totalDays - 1) return null;
                
                return (
                  <motion.div
                    key={day.day}
                    className={`relative ${day.current ? 'z-10' : ''}`}
                    animate={{
                      scale: day.current ? [1, 1.2, 1] : 1
                    }}
                    transition={{
                      duration: 2,
                      repeat: day.current ? Infinity : 0,
                      ease: "easeInOut"
                    }}
                  >
                    <motion.div
                      className={`w-1.5 h-1.5 rounded-full ${
                                          day.eid ? 'bg-gradient-to-r from-primary-500 to-secondary-400' :
                  day.completed ? 'bg-primary-500' : 'bg-primary-200'
                      }`}
                      style={{
                        boxShadow: day.current ? '0 0 5px rgba(14, 165, 233, 0.5)' : 'none'
                      }}
                    />
                    
                    {day.current && (
                      <motion.div
                        className="absolute -inset-1"
                        animate={{
                          boxShadow: ['0 0 0px rgba(14, 165, 233, 0)', '0 0 8px rgba(14, 165, 233, 0.5)', '0 0 0px rgba(14, 165, 233, 0)']
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    )}
                    
                    {(day.eid || index % 10 === 0) && (
                      <span className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-[8px] text-primary-600">
                        {day.day}
                      </span>
                    )}
                    
                    {day.eid && (
                      <>
                        <MemoizedStar size={10} className="absolute -top-2.5 -right-2.5" />
                        <MemoizedStar size={10} delay={0.3} className="absolute -top-2.5 -left-2.5" />
                      </>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
          
          {/* Right: Countdown & message */}
          <div className="flex items-center gap-1.5">
            <AnimatePresence mode="wait">
              <motion.div
                key={messageIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-xs"
              >
                <span className="bg-gradient-to-r from-primary-600 to-secondary-500 
                               bg-clip-text text-transparent font-medium">
                  {messages[messageIndex]}
                </span>
              </motion.div>
            </AnimatePresence>
            
            {remainingDays > 0 ? (
                          <div className="flex items-baseline gap-1 bg-gradient-to-r from-primary-50 to-secondary-100
                       px-2 py-0.5 rounded-md border border-primary-200">
                <span className="text-xs font-bold text-primary-600">
                  {remainingDays}
                </span>
                                  <span className="text-[10px] text-primary-500">
                  {remainingDays === 1 ? 'يوم' : 'أيام'}
                </span>
              </div>
            ) : (
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [-1, 1, -1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Gift size={18} className="text-primary-500" />
              </motion.div>
            )}
          </div>
        </div>
        
        {/* Animated flowing highlight */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              'linear-gradient(90deg, transparent 0%, rgba(14, 165, 233, 0.1) 50%, transparent 100%)',
              'linear-gradient(270deg, transparent 0%, rgba(14, 165, 233, 0.1) 50%, transparent 100%)'
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Day 22 highlight effect */}
        {daysArray.findIndex(d => d.current) > 0 && (
          <motion.div
            className="absolute"
            style={{
              left: `${(currentDay / totalDays) * 100}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
            animate={{
              opacity: [0.7, 0, 0.7]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
                          <div className="w-4 h-4 rounded-full bg-primary-400/20 blur-sm" />
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default RamadanToEidProgress;