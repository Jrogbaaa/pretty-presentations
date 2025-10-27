import { motion } from 'framer-motion';
import AnimatedNumber from './AnimatedNumber';

interface ProgressBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
  showPercentage?: boolean;
  height?: string;
  delay?: number;
}

const ProgressBar = ({
  label,
  value,
  max,
  color,
  showPercentage = true,
  height = '40px',
  delay = 0
}: ProgressBarProps) => {
  const percentage = (value / max) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="space-y-2"
    >
      {/* Label and value */}
      <div className="flex justify-between items-center">
        <span className="text-lg font-medium">{label}</span>
        <span className="text-lg font-bold" style={{ color }}>
          {showPercentage ? (
            <>
              <AnimatedNumber value={percentage} decimals={0} delay={delay + 0.2} />%
            </>
          ) : (
            <>
              <AnimatedNumber value={value} decimals={0} delay={delay + 0.2} /> / {max}
            </>
          )}
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="w-full bg-gray-200 rounded-full overflow-hidden"
        style={{ height }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: 1.5,
            delay: delay + 0.3,
            ease: 'easeOut'
          }}
          className="h-full rounded-full flex items-center justify-end pr-4"
          style={{ backgroundColor: color }}
        >
          {percentage > 20 && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 1 }}
              className="text-white font-bold text-sm"
            >
              {percentage.toFixed(0)}%
            </motion.span>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProgressBar;

