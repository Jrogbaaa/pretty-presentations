/**
 * CHART EXAMPLES - Copy and paste these into your slides
 * 
 * This file contains ready-to-use examples of all visualization components.
 * Simply copy the code you need and paste it into your slide components.
 */

import {
  AnimatedNumber,
  EnhancedMetricCard,
  BarChartComparison,
  DonutChart,
  PictographAudience,
  ProgressBar,
  LineChartTrend
} from '@/components/charts';
import { TrendingUp, Users, Target, DollarSign } from 'lucide-react';

// ============================================
// EXAMPLE 1: Animated Numbers
// ============================================
export const AnimatedNumberExamples = () => (
  <div className="space-y-4">
    {/* Follower count */}
    <div className="text-5xl font-black">
      <AnimatedNumber value={194000} suffix=" followers" />
    </div>

    {/* Percentage with decimals */}
    <div className="text-5xl font-black text-blue-500">
      <AnimatedNumber value={8.5} decimals={1} suffix="%" />
    </div>

    {/* Money */}
    <div className="text-5xl font-black text-green-500">
      <AnimatedNumber value={75000} prefix="€" />
    </div>

    {/* Large numbers (millions) */}
    <div className="text-5xl font-black text-purple-500">
      <AnimatedNumber value={3.5} decimals={1} suffix="M" />
    </div>
  </div>
);

// ============================================
// EXAMPLE 2: Enhanced Metric Cards
// ============================================
export const MetricCardsExample = ({ accentColor }: { accentColor: string }) => (
  <div className="grid grid-cols-4 gap-6 p-12">
    <EnhancedMetricCard
      label="Total Reach"
      value={3500000}
      icon={Users}
      accentColor={accentColor}
      suffix=" people"
      delay={0}
    />

    <EnhancedMetricCard
      label="Avg Engagement"
      value={8.5}
      icon={TrendingUp}
      accentColor="#10B981"
      suffix="%"
      decimals={1}
      trend={{ value: 15, isPositive: true }}
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

    <EnhancedMetricCard
      label="Cost per Mille"
      value={21}
      icon={DollarSign}
      accentColor="#F59E0B"
      prefix="€"
      trend={{ value: 8, isPositive: false }}
      delay={0.3}
    />
  </div>
);

// ============================================
// EXAMPLE 3: Bar Chart - Influencer Comparison
// ============================================
export const InfluencerComparisonChart = () => {
  const influencerData = [
    { name: "Carlos Ruiz", value: 12.0, color: "#10B981" },
    { name: "Rodrigo Navarro", value: 8.0, color: "#3B82F6" },
    { name: "María González", value: 6.2, color: "#8B5CF6" },
    { name: "Ana Martínez", value: 9.5, color: "#F59E0B" }
  ];

  return (
    <div className="p-12">
      <h2 className="text-4xl font-bold mb-8">
        Who Delivers the Best Engagement?
      </h2>
      
      <BarChartComparison
        data={influencerData}
        metric="%"
        averageLine={8.9}
        averageLabel="Industry Average"
        height={350}
        horizontal={true}
      />

      <div className="mt-8 p-6 bg-blue-50 rounded-xl">
        <p className="text-xl font-semibold text-blue-900">
          💡 Insight: Carlos delivers 35% better engagement than average, 
          making him the most cost-effective choice.
        </p>
      </div>
    </div>
  );
};

// ============================================
// EXAMPLE 4: Donut Chart - Budget Breakdown
// ============================================
export const BudgetBreakdownChart = () => {
  const budgetData = [
    { name: "Micro Influencers (50-500K)", value: 45000, color: "#3B82F6" },
    { name: "Nano Influencers (5-50K)", value: 15000, color: "#10B981" },
    { name: "Macro Influencers (500K+)", value: 15000, color: "#8B5CF6" }
  ];

  return (
    <div className="p-12">
      <h2 className="text-4xl font-bold mb-8">Budget Allocation Strategy</h2>
      
      <div className="grid grid-cols-2 gap-12">
        {/* Left: Chart */}
        <div>
          <DonutChart
            data={budgetData}
            height={400}
            centerLabel="Total Budget"
            centerValue="€75K"
          />
        </div>

        {/* Right: Explanation */}
        <div className="flex flex-col justify-center space-y-6">
          <div>
            <h3 className="text-2xl font-bold mb-2">Strategic Rationale</h3>
            <p className="text-lg opacity-80 leading-relaxed">
              We allocate 60% to micro influencers (50-500K followers) as they 
              provide the best balance of reach and engagement rate.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500" />
              <span className="text-lg">Micro: 6 influencers @ €7.5K each</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-green-500" />
              <span className="text-lg">Nano: 5 influencers @ €3K each</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-500" />
              <span className="text-lg">Macro: 1 influencer @ €15K</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// EXAMPLE 5: Pictograph - Audience Reach
// ============================================
export const AudienceReachPictograph = ({ accentColor }: { accentColor: string }) => (
  <div className="p-12">
    <h2 className="text-5xl font-bold mb-12">
      Projected Campaign Reach
    </h2>

    <PictographAudience
      totalReach={3500000}
      iconRepresents={100000}  // 1 icon = 100K people
      accentColor={accentColor}
      maxIcons={50}
    />

    <div className="mt-12 grid grid-cols-3 gap-8">
      <div className="text-center">
        <div className="text-5xl font-black" style={{ color: accentColor }}>
          <AnimatedNumber value={12} />
        </div>
        <div className="text-xl opacity-70 mt-2">Influencers</div>
      </div>
      <div className="text-center">
        <div className="text-5xl font-black text-green-500">
          <AnimatedNumber value={45} suffix="%" />
        </div>
        <div className="text-xl opacity-70 mt-2">Engagement Lift</div>
      </div>
      <div className="text-center">
        <div className="text-5xl font-black text-purple-500">
          €<AnimatedNumber value={75000} />
        </div>
        <div className="text-xl opacity-70 mt-2">Total Budget</div>
      </div>
    </div>
  </div>
);

// ============================================
// EXAMPLE 6: Progress Bars
// ============================================
export const ProgressBarsExample = () => (
  <div className="p-12 space-y-8">
    <h2 className="text-4xl font-bold mb-8">Campaign Progress</h2>

    <ProgressBar
      label="Budget Spent"
      value={52500}
      max={75000}
      color="#3B82F6"
      showPercentage={true}
      height="48px"
      delay={0}
    />

    <ProgressBar
      label="Content Delivered"
      value={8}
      max={12}
      color="#10B981"
      showPercentage={false}
      height="48px"
      delay={0.2}
    />

    <ProgressBar
      label="Influencer Onboarding"
      value={10}
      max={12}
      color="#8B5CF6"
      showPercentage={false}
      height="48px"
      delay={0.4}
    />

    <ProgressBar
      label="Campaign Completion"
      value={75}
      max={100}
      color="#F59E0B"
      showPercentage={true}
      height="48px"
      delay={0.6}
    />
  </div>
);

// ============================================
// EXAMPLE 7: Line Chart - Growth Trend
// ============================================
export const GrowthTrendChart = ({ accentColor }: { accentColor: string }) => {
  const growthData = [
    { label: "Month 1", value: 500000 },
    { label: "Month 2", value: 850000 },
    { label: "Month 3", value: 1200000, projected: 1500000 },
    { label: "Month 4", projected: 2000000 },
    { label: "Month 5", projected: 2800000 },
    { label: "Month 6", projected: 3500000 }
  ];

  return (
    <div className="p-12">
      <h2 className="text-4xl font-bold mb-8">
        Projected Reach Growth Over Time
      </h2>

      <LineChartTrend
        data={growthData}
        accentColor={accentColor}
        height={400}
        showArea={true}
        showProjected={true}
      />

      <div className="mt-6 flex gap-8 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: accentColor }} />
          <span className="text-lg">Actual Performance</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-12 h-1 bg-green-500" style={{ borderStyle: 'dashed' }} />
          <span className="text-lg">Projected Growth</span>
        </div>
      </div>

      <div className="mt-8 p-6 bg-green-50 rounded-xl">
        <p className="text-xl font-semibold text-green-900">
          📈 On track to reach 3.5M people by Month 6 - 
          that's 600% growth from launch!
        </p>
      </div>
    </div>
  );
};

// ============================================
// EXAMPLE 8: Complete Slide with Multiple Charts
// ============================================
export const CompleteDataSlide = ({ accentColor }: { accentColor: string }) => (
  <div className="p-12 space-y-12">
    {/* Header */}
    <div>
      <h1 className="text-6xl font-black mb-4">Campaign Performance Overview</h1>
      <p className="text-2xl opacity-80">Real-time metrics and projections</p>
    </div>

    {/* Top Row: Metric Cards */}
    <div className="grid grid-cols-4 gap-6">
      <EnhancedMetricCard
        label="Total Reach"
        value={3500000}
        icon={Users}
        accentColor={accentColor}
        suffix=" people"
      />
      <EnhancedMetricCard
        label="Engagement Rate"
        value={8.5}
        icon={TrendingUp}
        accentColor="#10B981"
        suffix="%"
        decimals={1}
        trend={{ value: 15, isPositive: true }}
      />
      <EnhancedMetricCard
        label="Total Budget"
        value={75000}
        icon={Target}
        accentColor="#8B5CF6"
        prefix="€"
      />
      <EnhancedMetricCard
        label="CPM"
        value={21}
        icon={DollarSign}
        accentColor="#F59E0B"
        prefix="€"
      />
    </div>

    {/* Bottom Row: Charts */}
    <div className="grid grid-cols-2 gap-12">
      {/* Left: Bar Chart */}
      <div>
        <h3 className="text-2xl font-bold mb-4">Top Performers</h3>
        <BarChartComparison
          data={[
            { name: "Carlos", value: 12.0, color: "#10B981" },
            { name: "Rodrigo", value: 8.0, color: "#3B82F6" },
            { name: "María", value: 6.2, color: "#8B5CF6" }
          ]}
          metric="%"
          averageLine={8.7}
          height={250}
        />
      </div>

      {/* Right: Budget Donut */}
      <div>
        <h3 className="text-2xl font-bold mb-4">Budget Allocation</h3>
        <DonutChart
          data={[
            { name: "Micro", value: 45000, color: "#3B82F6" },
            { name: "Nano", value: 15000, color: "#10B981" },
            { name: "Macro", value: 15000, color: "#8B5CF6" }
          ]}
          height={300}
          innerRadius={60}
          outerRadius={100}
          centerLabel="Total"
          centerValue="€75K"
        />
      </div>
    </div>
  </div>
);

// ============================================
// HOW TO USE IN YOUR SLIDES
// ============================================
/*

STEP 1: Import the components you need
--------------------------------------
import { BarChartComparison, DonutChart } from '@/components/charts';

STEP 2: Add to your slide component
------------------------------------
const MySlide = ({ slide }: { slide: Slide }) => {
  // Get colors from template
  const accentColor = slide.design.accentColor;
  
  // Prepare your data
  const data = [
    { name: "Item 1", value: 100, color: "#3B82F6" },
    { name: "Item 2", value: 200, color: "#10B981" }
  ];

  return (
    <div className="p-16">
      <h1 className="text-5xl font-bold mb-8">{slide.title}</h1>
      
      <BarChartComparison
        data={data}
        metric="units"
        accentColor={accentColor}
      />
    </div>
  );
};

STEP 3: Update AI prompts to generate chart data
-------------------------------------------------
Add to your AI content generation:
"Return chart data in this format: 
{ chartData: [{ name: string, value: number, color: string }] }"

STEP 4: Store chart data in customData
---------------------------------------
slide.content.customData = {
  chartData: influencers.map(inf => ({
    name: inf.name,
    value: parseFloat(inf.engagement),
    color: getColorByValue(inf.engagement)
  }))
};

*/

