import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Star, Gift, Heart } from 'lucide-react';

const RamadanCountdown = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0
  });
  
  const ramadanStart = new Date('2025-03-01');
  const [showBlessing, setShowBlessing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = ramadanStart - new Date();
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24)
      };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    const blessingTimer = setInterval(() => {
      setShowBlessing(prev => !prev);
    }, 4000);

    return () => {
      clearInterval(timer);
      clearInterval(blessingTimer);
    };
  }, []);

  // Custom Crescent Moon SVG
  const CrescentMoon = () => (
    <motion.svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      animate={{
        rotate: [0, 15, 0],
        scale: [1, 1.1, 1]
      }}
      transition={{
        duration: 4,
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
        className="text-sky-500"
      />
      <circle cx="12" cy="12" r="2" fill="currentColor" className="text-sky-600" />
    </motion.svg>
  );

  // Custom Star SVG
  const IslamicStar = () => (
    <motion.svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-sky-400/40"
      />
    </motion.svg>
  );

  return (
    <motion.div 
      className="relative p-4 pb-5"
      dir='rtl'
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 flex justify-center overflow-hidden">
        <motion.div
          animate={{
            scale: isHovered ? 1.1 : 1,
            opacity: isHovered ? 0.2 : 0.1
          }}
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.1) 0%, transparent 70%),
              linear-gradient(45deg, rgba(56, 189, 248, 0.1) 0%, transparent 100%)
            `
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl relative overflow-hidden border border-sky-200"
        style={{
          background: `
            linear-gradient(110deg, 
              rgba(14, 165, 233, 0.05) 0%, 
              rgba(56, 189, 248, 0.05) 25%, 
              rgba(14, 165, 233, 0.05) 50%,
              rgba(56, 189, 248, 0.05) 75%,
              rgba(14, 165, 233, 0.05) 100%
            )
          `,
          backdropFilter: 'blur(10px)'
        }}
      >
        <div className="px-4 pr-2 py-3 flex items-center justify-between relative">
          {/* Left side - Moon and Title */}
          <div className="flex items-center gap-3">
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
              <div className="absolute inset-0 bg-sky-500/10 rounded-full blur-md" />
              <div className="relative">
                <CrescentMoon />
              </div>
            </motion.div>

            <div className="relative">
              <AnimatePresence mode="wait">
                {showBlessing ? (
                  <motion.p
                    key="blessing"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-xs bg-gradient-to-r from-sky-500 to-sky-600 
                             bg-clip-text text-transparent font-bold"
                  >
                    اللهم بلغنا رمضان
                  </motion.p>
                ) : (
                  <motion.h3
                    key="countdown"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="text-sm font-bold text-sky-800"
                  >
                    باقي على رمضان
                  </motion.h3>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right side - Counter */}
          <div className="flex items-center gap-3">
            {[
              { value: timeLeft.days, label: 'يوم' },
              { value: timeLeft.hours, label: 'ساعة' }
            ].map((unit, index) => (
              <div key={unit.label} className="flex items-center gap-1">
                <motion.div
                  key={unit.value}
                  className="relative px-2 py-1 rounded-lg overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(56, 189, 248, 0.1))'
                  }}
                >
                  <motion.div
                    className="absolute inset-0 opacity-20"
                    animate={{
                      background: [
                        'linear-gradient(0deg, transparent 0%, rgba(14, 165, 233, 0.2) 50%, transparent 100%)',
                        'linear-gradient(180deg, transparent 0%, rgba(14, 165, 233, 0.2) 50%, transparent 100%)'
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  <div className="flex items-baseline gap-1 relative">
                    <span className="text-lg font-bold bg-gradient-to-r from-sky-600 to-sky-500 
                                   bg-clip-text text-transparent font-mono">
                      {String(unit.value).padStart(2, '0')}
                    </span>
                    <span className="text-xs text-sky-600/70 font-medium">{unit.label}</span>
                  </div>
                </motion.div>
                {index === 0 && (
                  <motion.span
                    animate={{
                      opacity: [1, 0.3, 1],
                      scale: [1, 0.9, 1]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="text-sky-500 font-bold"
                  >
                    :
                  </motion.span>
                )}
              </div>
            ))}
          </div>

          {/* Decorative Elements */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                top: `${20 + i * 25}%`,
                right: `${-10 + i * 5}px`,
              }}
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                delay: i * 2,
                ease: "easeInOut"
              }}
            >
              <IslamicStar />
            </motion.div>
          ))}
        </div>

        {/* Animated Border */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              'linear-gradient(0deg, transparent 0%, rgba(14, 165, 233, 0.1) 50%, transparent 100%)',
              'linear-gradient(180deg, transparent 0%, rgba(14, 165, 233, 0.1) 50%, transparent 100%)'
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default RamadanCountdown;