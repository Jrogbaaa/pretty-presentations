import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';

interface EnhancedMetricCardProps {
  label: string;
  value: number;
  icon?: LucideIcon;
  accentColor: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number;
}

const EnhancedMetricCard = ({
  label,
  value,
  icon: Icon,
  accentColor,
  prefix = '',
  suffix = '',
  decimals = 0,
  trend,
  delay = 0
}: EnhancedMetricCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="p-8 rounded-2xl relative overflow-hidden"
      style={{ backgroundColor: accentColor + '20' }}
    >
      {/* Background gradient */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          background: `linear-gradient(135deg, ${accentColor} 0%, transparent 100%)`
        }}
      />

      <div className="relative z-10">
        {/* Icon */}
        {Icon && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: delay + 0.2 }}
          >
            <Icon size={48} style={{ color: accentColor }} strokeWidth={2} />
          </motion.div>
        )}

        {/* Label */}
        <div className="text-sm uppercase font-semibold opacity-70 mt-4 mb-2 tracking-wide">
          {label}
        </div>

        {/* Animated Value */}
        <div className="flex items-baseline gap-3">
          <AnimatedNumber
            value={value}
            decimals={decimals}
            prefix={prefix}
            suffix={suffix}
            delay={delay + 0.3}
            className="text-5xl font-black"
            style={{ color: accentColor }}
          />

          {/* Trend indicator */}
          {trend && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.6 }}
              className="flex items-center gap-1 text-lg font-bold"
              style={{ color: trend.isPositive ? '#10B981' : '#EF4444' }}
            >
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedMetricCard;

