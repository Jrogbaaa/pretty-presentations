# 📊 Visualization Components Guide
## Complete Reference for Charts and Graphics

**Version**: 1.0.0  
**Created**: October 6, 2025  
**Libraries**: Recharts, React Spring, Framer Motion, Lucide React

---

## 🎯 What You Can Now Create

You now have **7 professional visualization components** that can display:

✅ **Animated numbers** with count-up effects  
✅ **Enhanced metric cards** with icons and trends  
✅ **Bar charts** for comparing data  
✅ **Donut/Pie charts** for budget breakdowns  
✅ **Pictographs** for audience reach visualization  
✅ **Progress bars** for completion/goals  
✅ **Line charts** for trends over time  

---

## 📚 Component Library

### 1. **AnimatedNumber**

Numbers that count up from 0 to target value.

**Import**:
```tsx
import { AnimatedNumber } from '@/components/charts';
```

**Usage**:
```tsx
<AnimatedNumber
  value={194000}
  duration={2000}
  decimals={0}
  prefix=""
  suffix=" followers"
  delay={0}
/>
```

**Props**:
- `value` (number, required): Target number
- `duration` (number, optional): Animation duration in ms (default: 2000)
- `decimals` (number, optional): Decimal places (default: 0)
- `prefix` (string, optional): Text before number (e.g., "€")
- `suffix` (string, optional): Text after number (e.g., "%")
- `delay` (number, optional): Delay before animation starts (ms)

**Examples**:
```tsx
// Follower count
<AnimatedNumber value={194000} suffix=" followers" />

// Percentage
<AnimatedNumber value={8.5} decimals={1} suffix="%" />

// Money
<AnimatedNumber value={75000} prefix="€" />

// Millions
<AnimatedNumber value={3.5} decimals={1} suffix="M reach" />
```

---

### 2. **EnhancedMetricCard**

Beautiful animated metric cards with icons and optional trend indicators.

**Import**:
```tsx
import { EnhancedMetricCard } from '@/components/charts';
import { TrendingUp, Users, Target } from 'lucide-react';
```

**Usage**:
```tsx
<EnhancedMetricCard
  label="Engagement Rate"
  value={8.5}
  icon={TrendingUp}
  accentColor="#3B82F6"
  suffix="%"
  decimals={1}
  trend={{ value: 15, isPositive: true }}
  delay={0}
/>
```

**Props**:
- `label` (string, required): Card label
- `value` (number, required): Metric value
- `accentColor` (string, required): Color for icon and value
- `icon` (LucideIcon, optional): Icon component
- `prefix/suffix` (string, optional): Text formatting
- `decimals` (number, optional): Decimal places
- `trend` (object, optional): `{ value: number, isPositive: boolean }`
- `delay` (number, optional): Animation delay

**Example - Grid of Metrics**:
```tsx
<div className="grid grid-cols-4 gap-6">
  <EnhancedMetricCard
    label="Total Reach"
    value={3500000}
    icon={Users}
    accentColor="#3B82F6"
    suffix=" people"
  />
  <EnhancedMetricCard
    label="Engagement"
    value={8.5}
    icon={TrendingUp}
    accentColor="#10B981"
    suffix="%"
    decimals={1}
    trend={{ value: 15, isPositive: true }}
  />
  <EnhancedMetricCard
    label="Budget"
    value={75000}
    icon={Target}
    accentColor="#8B5CF6"
    prefix="€"
  />
  <EnhancedMetricCard
    label="CPM"
    value={21}
    icon={TrendingUp}
    accentColor="#F59E0B"
    prefix="€"
  />
</div>
```

---

### 3. **BarChartComparison**

Horizontal or vertical bar charts for comparing values.

**Import**:
```tsx
import { BarChartComparison } from '@/components/charts';
```

**Usage**:
```tsx
<BarChartComparison
  data={[
    { name: "Carlos Ruiz", value: 12.0, color: "#10B981" },
    { name: "Rodrigo Navarro", value: 8.0, color: "#3B82F6" },
    { name: "María González", value: 6.2, color: "#8B5CF6" }
  ]}
  metric="%"
  averageLine={7.5}
  averageLabel="Industry Average"
  height={400}
  horizontal={true}
/>
```

**Props**:
- `data` (array, required): Array of `{ name, value, color }`
- `metric` (string, required): Unit suffix (e.g., "%", "K", "€")
- `averageLine` (number, optional): Reference line value
- `averageLabel` (string, optional): Reference line label
- `height` (number, optional): Chart height in pixels
- `horizontal` (boolean, optional): Horizontal bars (default: true)

**Example - Influencer Engagement Comparison**:
```tsx
const influencerData = [
  { name: "Carlos", value: 12.0, color: "#10B981" },
  { name: "Rodrigo", value: 8.0, color: "#3B82F6" },
  { name: "María", value: 6.2, color: "#8B5CF6" },
  { name: "Ana", value: 9.5, color: "#F59E0B" }
];

<div>
  <h3 className="text-3xl font-bold mb-6">Who Delivers Best Engagement?</h3>
  <BarChartComparison
    data={influencerData}
    metric="%"
    averageLine={8.9}
    averageLabel="Campaign Average"
    height={350}
  />
  <p className="mt-6 text-xl italic opacity-80">
    💡 Carlos delivers 35% better engagement than average
  </p>
</div>
```

---

### 4. **DonutChart**

Donut/pie charts for showing proportions and breakdowns.

**Import**:
```tsx
import { DonutChart } from '@/components/charts';
```

**Usage**:
```tsx
<DonutChart
  data={[
    { name: "Micro Influencers", value: 45000, color: "#3B82F6" },
    { name: "Nano Influencers", value: 15000, color: "#10B981" },
    { name: "Macro Influencers", value: 15000, color: "#8B5CF6" }
  ]}
  height={400}
  innerRadius={80}
  outerRadius={140}
  showPercentage={true}
  centerLabel="Total Budget"
  centerValue="€75K"
/>
```

**Props**:
- `data` (array, required): Array of `{ name, value, color }`
- `height` (number, optional): Chart height
- `innerRadius` (number, optional): Inner circle radius (default: 80)
- `outerRadius` (number, optional): Outer circle radius (default: 140)
- `showPercentage` (boolean, optional): Show % in labels (default: true)
- `centerLabel` (string, optional): Label in center
- `centerValue` (string, optional): Value in center

**Example - Budget Breakdown**:
```tsx
const budgetData = [
  { name: "Micro (50-500K)", value: 45000, color: "#3B82F6" },
  { name: "Nano (5-50K)", value: 15000, color: "#10B981" },
  { name: "Macro (500K+)", value: 15000, color: "#8B5CF6" }
];

<div>
  <h3 className="text-3xl font-bold mb-6">Budget Allocation Strategy</h3>
  <DonutChart
    data={budgetData}
    centerLabel="Total"
    centerValue="€75K"
  />
  <p className="mt-6 text-lg opacity-80">
    Focus 60% of budget on proven mid-tier influencers for maximum ROI
  </p>
</div>
```

---

### 5. **PictographAudience**

Visual representation of audience size using person icons.

**Import**:
```tsx
import { PictographAudience } from '@/components/charts';
```

**Usage**:
```tsx
<PictographAudience
  totalReach={3500000}
  iconRepresents={10000}
  accentColor="#3B82F6"
  maxIcons={50}
/>
```

**Props**:
- `totalReach` (number, required): Total audience number
- `iconRepresents` (number, optional): People per icon (default: 10000)
- `accentColor` (string, required): Icon color
- `maxIcons` (number, optional): Max icons to show (default: 50)

**How it works**:
- Each full icon = `iconRepresents` people (default 10K)
- Partial icons show remainder
- Automatically formats large numbers (3.5M, 450K, etc.)

**Example**:
```tsx
<div className="p-12">
  <h3 className="text-3xl font-bold mb-6">Campaign Reach Projection</h3>
  <PictographAudience
    totalReach={3500000}
    iconRepresents={100000}  // 1 icon = 100K people
    accentColor="#3B82F6"
  />
</div>
```

---

### 6. **ProgressBar**

Animated progress bars for showing completion or goals.

**Import**:
```tsx
import { ProgressBar } from '@/components/charts';
```

**Usage**:
```tsx
<ProgressBar
  label="Budget Spent"
  value={52500}
  max={75000}
  color="#3B82F6"
  showPercentage={true}
  height="48px"
  delay={0}
/>
```

**Props**:
- `label` (string, required): Progress bar label
- `value` (number, required): Current value
- `max` (number, required): Maximum value
- `color` (string, required): Bar color
- `showPercentage` (boolean, optional): Show % or value/max (default: true)
- `height` (string, optional): Bar height (default: "40px")
- `delay` (number, optional): Animation delay

**Example - Multiple Progress Bars**:
```tsx
<div className="space-y-6">
  <ProgressBar
    label="Budget Spent"
    value={52500}
    max={75000}
    color="#3B82F6"
  />
  <ProgressBar
    label="Content Delivered"
    value={8}
    max={12}
    color="#10B981"
    showPercentage={false}
  />
  <ProgressBar
    label="Campaign Completion"
    value={75}
    max={100}
    color="#8B5CF6"
  />
</div>
```

---

### 7. **LineChartTrend**

Line or area charts for showing trends over time.

**Import**:
```tsx
import { LineChartTrend } from '@/components/charts';
```

**Usage**:
```tsx
<LineChartTrend
  data={[
    { label: "Month 1", value: 500000 },
    { label: "Month 2", value: 850000 },
    { label: "Month 3", value: 1200000 },
    { label: "Month 4", value: 1800000 },
    { label: "Month 5", value: 2500000 },
    { label: "Month 6", value: 3500000 }
  ]}
  accentColor="#3B82F6"
  height={350}
  showArea={true}
  showProjected={false}
/>
```

**Props**:
- `data` (array, required): Array of `{ label, value, projected? }`
- `accentColor` (string, required): Line/area color
- `height` (number, optional): Chart height
- `showArea` (boolean, optional): Fill area under line (default: false)
- `showProjected` (boolean, optional): Show projected line (default: false)

**Example - Growth Projection**:
```tsx
const growthData = [
  { label: "Month 1", value: 500000 },
  { label: "Month 2", value: 850000 },
  { label: "Month 3", value: 1200000, projected: 1500000 },
  { label: "Month 4", value: null, projected: 2000000 },
  { label: "Month 5", value: null, projected: 2800000 },
  { label: "Month 6", value: null, projected: 3500000 }
];

<div>
  <h3 className="text-3xl font-bold mb-6">Reach Growth Over Time</h3>
  <LineChartTrend
    data={growthData}
    accentColor="#3B82F6"
    showArea={true}
    showProjected={true}
  />
  <div className="mt-4 flex gap-6">
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 rounded-full bg-blue-500" />
      <span>Actual</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-4 h-1 bg-green-500" />
      <span>Projected</span>
    </div>
  </div>
</div>
```

---

## 🎨 Integration Examples

### Example 1: Enhanced Talent Strategy Slide

**Before** (metrics as cards):
```tsx
<div className="grid grid-cols-4 gap-4">
  {metrics.map(metric => (
    <div className="p-4 rounded-lg bg-blue-500/20">
      <div className="text-sm">{metric.label}</div>
      <div className="text-2xl font-bold">{metric.value}</div>
    </div>
  ))}
</div>
```

**After** (with bar chart):
```tsx
import { BarChartComparison } from '@/components/charts';

const influencerData = influencers.map(inf => ({
  name: inf.name,
  value: parseFloat(inf.engagement),
  color: getColorByEngagement(inf.engagement)
}));

<div>
  <h2 className="text-4xl font-bold mb-8">Influencer Engagement Comparison</h2>
  <BarChartComparison
    data={influencerData}
    metric="%"
    averageLine={7.5}
    averageLabel="Industry Average"
  />
  <p className="mt-6 text-xl italic">
    💡 {influencerData[0].name} delivers {influencerData[0].value}% engagement - 
    {((influencerData[0].value / 7.5 - 1) * 100).toFixed(0)}% above average
  </p>
</div>
```

---

### Example 2: Budget Breakdown Slide

```tsx
import { DonutChart, EnhancedMetricCard } from '@/components/charts';
import { DollarSign } from 'lucide-react';

const BudgetSlide = ({ budget, breakdown }) => (
  <div className="grid grid-cols-2 gap-12 p-16">
    {/* Left: Donut chart */}
    <div>
      <h3 className="text-3xl font-bold mb-6">Budget Allocation</h3>
      <DonutChart
        data={breakdown}
        centerLabel="Total"
        centerValue={`€${(budget / 1000).toFixed(0)}K`}
      />
    </div>

    {/* Right: Metrics */}
    <div className="space-y-6">
      <h3 className="text-3xl font-bold mb-6">Key Metrics</h3>
      <EnhancedMetricCard
        label="Cost Per Engagement"
        value={0.12}
        icon={DollarSign}
        accentColor="#3B82F6"
        prefix="€"
        decimals={2}
      />
      <EnhancedMetricCard
        label="Projected CPM"
        value={21}
        icon={DollarSign}
        accentColor="#10B981"
        prefix="€"
      />
    </div>
  </div>
);
```

---

### Example 3: Campaign Summary with Pictograph

```tsx
import { PictographAudience, AnimatedNumber } from '@/components/charts';

<div className="p-16">
  <h2 className="text-5xl font-bold mb-12">Campaign Reach</h2>
  
  <PictographAudience
    totalReach={3500000}
    iconRepresents={100000}
    accentColor="#3B82F6"
  />

  <div className="mt-12 grid grid-cols-3 gap-8">
    <div className="text-center">
      <div className="text-5xl font-black text-blue-500">
        <AnimatedNumber value={12} />
      </div>
      <div className="text-xl opacity-70 mt-2">Influencers</div>
    </div>
    <div className="text-center">
      <div className="text-5xl font-black text-green-500">
        <AnimatedNumber value={45} suffix="%" decimals={0} />
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
```

---

## 🎯 Best Practices

### 1. **Color Consistency**
Always use template colors for consistency:
```tsx
// Get colors from slide design
const accentColor = slide.design.accentColor;
const primaryColor = slide.design.textColor;

// Use in components
<BarChartComparison
  data={data}
  accentColor={accentColor}  // ✅ Consistent
/>
```

### 2. **Animation Delays**
Stagger animations for polish:
```tsx
<div className="grid grid-cols-4 gap-6">
  {metrics.map((metric, index) => (
    <EnhancedMetricCard
      key={index}
      {...metric}
      delay={index * 0.1}  // 0s, 0.1s, 0.2s, 0.3s
    />
  ))}
</div>
```

### 3. **Responsive Heights**
Adjust chart heights based on data:
```tsx
const chartHeight = data.length * 60 + 100;  // 60px per item + padding

<BarChartComparison
  data={data}
  height={chartHeight}
/>
```

### 4. **Accessible Colors**
Ensure sufficient contrast:
```tsx
const colors = {
  high: "#10B981",    // Green for positive
  medium: "#3B82F6",  // Blue for neutral
  low: "#EF4444"      // Red for concerning
};

const getColorByValue = (value: number, threshold: number) =>
  value >= threshold * 1.2 ? colors.high :
  value >= threshold * 0.8 ? colors.medium :
  colors.low;
```

---

## 🚀 Quick Start Checklist

- [x] Installed Recharts and React Spring
- [x] Created 7 visualization components
- [ ] Update TalentStrategySlide to use BarChartComparison
- [ ] Update RecommendedScenarioSlide to use DonutChart
- [ ] Update IndexSlide to use PictographAudience
- [ ] Replace static numbers with AnimatedNumber
- [ ] Replace metric cards with EnhancedMetricCard
- [ ] Test all components in presentations
- [ ] Update AI prompts to generate chart data

---

## 📚 Next Steps

1. **Read the components** - Review each component file
2. **Test in isolation** - Create a test page to see them work
3. **Integrate into slides** - Update slide components
4. **Update AI prompts** - Generate chart-friendly data
5. **Polish animations** - Fine-tune delays and durations

---

**Created by**: Look After You Development Team  
**Status**: Ready to use  
**Version**: 1.0.0

