import { Users } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedNumber from './AnimatedNumber';

interface PictographAudienceProps {
  totalReach: number;
  iconRepresents?: number;
  accentColor: string;
  maxIcons?: number;
}

const PictographAudience = ({
  totalReach,
  iconRepresents = 10000,
  accentColor,
  maxIcons = 50
}: PictographAudienceProps) => {
  const iconCount = Math.min(
    Math.floor(totalReach / iconRepresents),
    maxIcons
  );
  const remainder = totalReach % iconRepresents;
  const partialPercent = (remainder / iconRepresents) * 100;

  const displayValue = totalReach >= 1000000 
    ? (totalReach / 1000000).toFixed(1) + 'M'
    : totalReach >= 1000
    ? (totalReach / 1000).toFixed(0) + 'K'
    : totalReach.toLocaleString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Icon grid */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: iconCount }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.3,
              delay: i * 0.02,
              ease: 'backOut'
            }}
          >
            <Users
              size={28}
              fill={accentColor}
              stroke={accentColor}
              strokeWidth={1.5}
            />
          </motion.div>
        ))}
        
        {/* Partial icon */}
        {remainder > 0 && iconCount < maxIcons && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.3,
              delay: iconCount * 0.02,
              ease: 'backOut'
            }}
            className="relative"
          >
            <Users size={28} fill="none" stroke="#E5E7EB" strokeWidth={1.5} />
            <div
              className="absolute bottom-0 left-0 right-0 overflow-hidden"
              style={{ height: `${partialPercent}%` }}
            >
              <Users size={28} fill={accentColor} stroke={accentColor} strokeWidth={1.5} />
            </div>
          </motion.div>
        )}
      </div>

      {/* Total reach display */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <p className="text-xl">
          <span
            className="text-6xl font-black"
            style={{ color: accentColor }}
          >
            {displayValue}
          </span>{' '}
          <span className="text-2xl opacity-70">Total Projected Reach</span>
        </p>
        <p className="text-sm opacity-60 mt-2">
          Each icon represents {(iconRepresents / 1000).toFixed(0)}K people
        </p>
      </motion.div>
    </motion.div>
  );
};

export default PictographAudience;

