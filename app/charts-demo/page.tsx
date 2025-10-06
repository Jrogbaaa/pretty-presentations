'use client';

import {
  AnimatedNumber,
  EnhancedMetricCard,
  BarChartComparison,
  DonutChart,
  PictographAudience,
  ProgressBar,
  LineChartTrend
} from '@/components/charts';
import { TrendingUp, Users, Target, DollarSign, Heart, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChartsDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-12">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-7xl font-black text-gray-900 mb-4">
            🎨 Data Visualization Showcase
          </h1>
          <p className="text-2xl text-gray-600">
            Professional charts and animations for Pretty Presentations
          </p>
        </motion.div>

        {/* Animated Numbers Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-2xl p-12"
        >
          <h2 className="text-4xl font-bold mb-8 text-gray-900">
            1. Animated Numbers
          </h2>
          <div className="grid grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-6xl font-black text-blue-600 mb-2">
                <AnimatedNumber value={194000} />
              </div>
              <p className="text-lg text-gray-600">Followers</p>
            </div>
            <div className="text-center">
              <div className="text-6xl font-black text-green-600 mb-2">
                €<AnimatedNumber value={75000} />
              </div>
              <p className="text-lg text-gray-600">Budget</p>
            </div>
            <div className="text-center">
              <div className="text-6xl font-black text-purple-600 mb-2">
                <AnimatedNumber value={8.5} decimals={1} suffix="%" />
              </div>
              <p className="text-lg text-gray-600">Engagement</p>
            </div>
            <div className="text-center">
              <div className="text-6xl font-black text-pink-600 mb-2">
                <AnimatedNumber value={3.5} decimals={1} suffix="M" />
              </div>
              <p className="text-lg text-gray-600">Reach</p>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Metric Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl p-12"
        >
          <h2 className="text-4xl font-bold mb-8 text-gray-900">
            2. Enhanced Metric Cards
          </h2>
          <div className="grid grid-cols-3 gap-6">
            <EnhancedMetricCard
              label="Total Reach"
              value={3500000}
              icon={Users}
              accentColor="#3B82F6"
              suffix=" people"
              trend={{ value: 15, isPositive: true }}
              delay={0}
            />
            <EnhancedMetricCard
              label="Avg Engagement"
              value={8.5}
              icon={Heart}
              accentColor="#10B981"
              suffix="%"
              decimals={1}
              trend={{ value: 22, isPositive: true }}
              delay={0.1}
            />
            <EnhancedMetricCard
              label="Campaign Budget"
              value={75000}
              icon={Target}
              accentColor="#8B5CF6"
              prefix="€"
              delay={0.2}
            />
          </div>
        </motion.div>

        {/* Bar Chart Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-2xl p-12"
        >
          <h2 className="text-4xl font-bold mb-8 text-gray-900">
            3. Bar Chart - Influencer Comparison
          </h2>
          <BarChartComparison
            data={[
              { name: "Carlos Ruiz", value: 12.0, color: "#10B981" },
              { name: "Rodrigo Navarro", value: 8.0, color: "#3B82F6" },
              { name: "María González", value: 6.2, color: "#8B5CF6" },
              { name: "Ana Martínez", value: 9.5, color: "#F59E0B" },
              { name: "Pablo Sánchez", value: 7.3, color: "#EF4444" }
            ]}
            metric="%"
            averageLine={8.6}
            averageLabel="Industry Average"
            height={400}
          />
          <div className="mt-6 p-6 bg-blue-50 rounded-xl">
            <p className="text-xl font-semibold text-blue-900">
              💡 <strong>Insight:</strong> Carlos delivers 40% better engagement than average, 
              making him the most cost-effective choice for this campaign.
            </p>
          </div>
        </motion.div>

        {/* Donut Chart - Budget Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl shadow-2xl p-12"
        >
          <h2 className="text-4xl font-bold mb-8 text-gray-900">
            4. Donut Chart - Budget Allocation
          </h2>
          <div className="grid grid-cols-2 gap-12">
            <div>
              <DonutChart
                data={[
                  { name: "Micro Influencers (50-500K)", value: 45000, color: "#3B82F6" },
                  { name: "Nano Influencers (5-50K)", value: 15000, color: "#10B981" },
                  { name: "Macro Influencers (500K+)", value: 15000, color: "#8B5CF6" }
                ]}
                height={450}
                centerLabel="Total Budget"
                centerValue="€75K"
              />
            </div>
            <div className="flex flex-col justify-center space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-3">Strategic Rationale</h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  We allocate <strong>60%</strong> to micro influencers as they provide 
                  the best balance of reach and engagement rate. This data-driven approach 
                  maximizes ROI while ensuring campaign objectives are met.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500" />
                  <span className="text-lg">Micro: 6 influencers @ €7.5K each</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500" />
                  <span className="text-lg">Nano: 5 influencers @ €3K each</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500" />
                  <span className="text-lg">Macro: 1 influencer @ €15K</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pictograph - Audience Reach */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl shadow-2xl p-12"
        >
          <h2 className="text-4xl font-bold mb-8 text-gray-900">
            5. Pictograph - Audience Visualization
          </h2>
          <PictographAudience
            totalReach={3500000}
            iconRepresents={100000}
            accentColor="#3B82F6"
            maxIcons={50}
          />
        </motion.div>

        {/* Progress Bars */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-3xl shadow-2xl p-12"
        >
          <h2 className="text-4xl font-bold mb-8 text-gray-900">
            6. Progress Bars - Campaign Status
          </h2>
          <div className="space-y-8">
            <ProgressBar
              label="Budget Spent"
              value={52500}
              max={75000}
              color="#3B82F6"
              showPercentage={true}
              height="56px"
              delay={0}
            />
            <ProgressBar
              label="Content Delivered"
              value={8}
              max={12}
              color="#10B981"
              showPercentage={false}
              height="56px"
              delay={0.1}
            />
            <ProgressBar
              label="Influencer Onboarding"
              value={10}
              max={12}
              color="#8B5CF6"
              showPercentage={false}
              height="56px"
              delay={0.2}
            />
            <ProgressBar
              label="Campaign Completion"
              value={75}
              max={100}
              color="#F59E0B"
              showPercentage={true}
              height="56px"
              delay={0.3}
            />
          </div>
        </motion.div>

        {/* Line Chart - Growth Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-3xl shadow-2xl p-12"
        >
          <h2 className="text-4xl font-bold mb-8 text-gray-900">
            7. Line Chart - Reach Growth Projection
          </h2>
          <LineChartTrend
            data={[
              { label: "Month 1", value: 500000 },
              { label: "Month 2", value: 850000 },
              { label: "Month 3", value: 1200000, projected: 1500000 },
              { label: "Month 4", value: undefined, projected: 2000000 },
              { label: "Month 5", value: undefined, projected: 2800000 },
              { label: "Month 6", value: undefined, projected: 3500000 }
            ]}
            accentColor="#3B82F6"
            height={400}
            showArea={true}
            showProjected={true}
          />
          <div className="mt-6 flex gap-8 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500" />
              <span className="text-lg font-medium">Actual Performance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-2 bg-green-500 rounded" style={{ borderStyle: 'dashed' }} />
              <span className="text-lg font-medium">Projected Growth</span>
            </div>
          </div>
          <div className="mt-6 p-6 bg-green-50 rounded-xl">
            <p className="text-xl font-semibold text-green-900">
              📈 <strong>Projection:</strong> On track to reach 3.5M people by Month 6 - 
              that's 600% growth from launch!
            </p>
          </div>
        </motion.div>

        {/* Success Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl shadow-2xl p-12 text-white text-center"
        >
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-4xl font-black mb-4">
            All Components Working Perfectly!
          </h2>
          <p className="text-xl opacity-90 mb-6">
            If you can see animations, charts, and beautiful visualizations above, 
            everything is installed correctly and ready for production use.
          </p>
          <div className="flex gap-4 justify-center">
            <div className="bg-white/20 backdrop-blur px-6 py-3 rounded-full">
              <span className="text-lg font-bold">7 Components</span>
            </div>
            <div className="bg-white/20 backdrop-blur px-6 py-3 rounded-full">
              <span className="text-lg font-bold">3 Libraries</span>
            </div>
            <div className="bg-white/20 backdrop-blur px-6 py-3 rounded-full">
              <span className="text-lg font-bold">100% Functional</span>
            </div>
          </div>
        </motion.div>

        {/* Documentation Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-gray-900 rounded-3xl shadow-2xl p-12 text-white"
        >
          <h2 className="text-4xl font-bold mb-6">📚 Next Steps</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur p-6 rounded-xl">
              <h3 className="text-2xl font-bold mb-3">Read Documentation</h3>
              <p className="text-gray-300 mb-4">
                Check <code className="bg-white/20 px-2 py-1 rounded">START_HERE.md</code> for complete guide
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur p-6 rounded-xl">
              <h3 className="text-2xl font-bold mb-3">View Examples</h3>
              <p className="text-gray-300 mb-4">
                See <code className="bg-white/20 px-2 py-1 rounded">CHART_EXAMPLES.tsx</code> for code
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur p-6 rounded-xl">
              <h3 className="text-2xl font-bold mb-3">Integrate Into Slides</h3>
              <p className="text-gray-300 mb-4">
                Update TalentStrategySlide, RecommendedScenarioSlide, IndexSlide
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur p-6 rounded-xl">
              <h3 className="text-2xl font-bold mb-3">Test Presentations</h3>
              <p className="text-gray-300 mb-4">
                Generate a presentation and see charts in action!
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

