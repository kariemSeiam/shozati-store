import React from 'react';
import { motion } from 'framer-motion';

const badgeVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 }
};

const QuantityBadge = React.memo(({ quantity }) => (
  <div className="absolute -top-2 -right-2">
    <motion.div
      variants={badgeVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-6 h-6 rounded-full bg-gradient-primary
                flex items-center justify-center shadow-lg"
    >
      <span className="text-white text-xs font-bold">
        {quantity > 99 ? '99+' : quantity}
      </span>
    </motion.div>
  </div>
));

QuantityBadge.displayName = 'QuantityBadge';

export default QuantityBadge;