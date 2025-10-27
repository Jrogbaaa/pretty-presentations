import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

interface DonutChartDataItem {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartDataItem[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  showPercentage?: boolean;
  centerLabel?: string;
  centerValue?: string;
}

const DonutChart = ({
  data,
  height = 400,
  innerRadius = 80,
  outerRadius = 140,
  showPercentage = true,
  centerLabel,
  centerValue
}: DonutChartProps) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full relative"
    >
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent }) => 
              showPercentage 
                ? `${name}: ${(percent * 100).toFixed(0)}%` 
                : name
            }
            labelLine={{ stroke: '#6B7280', strokeWidth: 1 }}
            animationDuration={1000}
            animationBegin={200}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '2px solid #E5E7EB',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '16px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
            }}
            formatter={(value: number) => [
              `€${value.toLocaleString()}`,
              'Amount'
            ]}
          />

          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            iconSize={12}
            wrapperStyle={{ fontSize: '14px' }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center label */}
      {(centerLabel || centerValue) && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          {centerLabel && (
            <div className="text-sm uppercase opacity-70 font-semibold mb-1">
              {centerLabel}
            </div>
          )}
          {centerValue && (
            <div className="text-3xl font-black">
              {centerValue}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default DonutChart;

