import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { motion } from 'framer-motion';

interface TrendDataItem {
  label: string;
  value: number;
  projected?: number;
}

interface LineChartTrendProps {
  data: TrendDataItem[];
  accentColor: string;
  height?: number;
  showArea?: boolean;
  showProjected?: boolean;
}

const LineChartTrend = ({
  data,
  accentColor,
  height = 350,
  showArea = false,
  showProjected = false
}: LineChartTrendProps) => {
  const ChartComponent = showArea ? AreaChart : LineChart;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={height}>
        <ChartComponent
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          
          <XAxis
            dataKey="label"
            tick={{ fontSize: 14 }}
            stroke="#6B7280"
          />
          
          <YAxis
            tick={{ fontSize: 14 }}
            stroke="#6B7280"
          />
          
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '2px solid #E5E7EB',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '16px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
            }}
            formatter={(value: number) => [value.toLocaleString(), 'Value']}
          />

          {showArea ? (
            <>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={accentColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={accentColor}
                strokeWidth={3}
                fill="url(#colorValue)"
                animationDuration={1500}
                animationBegin={200}
              />
            </>
          ) : (
            <Line
              type="monotone"
              dataKey="value"
              stroke={accentColor}
              strokeWidth={3}
              dot={{ r: 6, fill: accentColor }}
              activeDot={{ r: 8 }}
              animationDuration={1500}
              animationBegin={200}
            />
          )}

          {showProjected && (
            <Line
              type="monotone"
              dataKey="projected"
              stroke="#10B981"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ r: 6, fill: '#10B981' }}
              animationDuration={1500}
              animationBegin={400}
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default LineChartTrend;

