import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { motion } from 'framer-motion';

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

interface BarChartComparisonProps {
  data: ChartDataItem[];
  metric: string;
  averageLine?: number;
  averageLabel?: string;
  height?: number;
  horizontal?: boolean;
}

const BarChartComparison = ({
  data,
  metric,
  averageLine,
  averageLabel = 'Average',
  height = 400,
  horizontal = true
}: BarChartComparisonProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout={horizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          {horizontal ? (
            <>
              <XAxis type="number" tick={{ fontSize: 16 }} />
              <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 16 }} />
            </>
          ) : (
            <>
              <XAxis type="category" dataKey="name" tick={{ fontSize: 16 }} />
              <YAxis type="number" tick={{ fontSize: 16 }} />
            </>
          )}
          
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '2px solid #E5E7EB',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '16px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
            }}
            formatter={(value: number) => [`${value}${metric}`, 'Value']}
          />

          <Bar
            dataKey="value"
            radius={horizontal ? [0, 8, 8, 0] : [8, 8, 0, 0]}
            animationDuration={1000}
            animationBegin={200}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>

          {averageLine && (
            <ReferenceLine
              x={horizontal ? averageLine : undefined}
              y={horizontal ? undefined : averageLine}
              stroke="#EF4444"
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{
                value: averageLabel,
                position: horizontal ? 'top' : 'right',
                fill: '#EF4444',
                fontSize: 14,
                fontWeight: 'bold'
              }}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default BarChartComparison;

