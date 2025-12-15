# Presentation Editor UI Design System

**Version**: 3.0.0  
**Implementation Date**: December 15, 2025  
**Status**: ✅ Fully Implemented

## Overview

A comprehensive design system for the presentation editor interface with multiple template styles. This design system prioritizes clean aesthetics, generous whitespace, subtle shadows, clear hierarchy, and purposeful color usage. The focus is on enabling effortless content creation with tools that are accessible but never overwhelming.

## Template System

### Available Templates

The system now supports 4 distinct presentation templates:

| Template | ID | Primary Color | Background | Style |
|----------|-----|--------------|------------|-------|
| Corporate Brochure | `corporate-brochure` | `#2E3F9E` (Royal Blue) | `#F5F3EB` (Cream) | Magazine/Editorial |
| Default | `default` | `#3B82F6` (Blue) | `#FFFFFF` (White) | Clean/Professional |
| Red Bull Event | `red-bull-event` | `#001489` (Deep Blue) | `#0A0E27` (Dark) | Energetic/Action |
| Scalpers Lifestyle | `scalpers-lifestyle` | `#000000` (Black) | `#1A1A1A` (Charcoal) | Premium/Fashion |

### Corporate Brochure Template (NEW - v4.4.0)

The flagship template for professional presentations with magazine-style layouts.

#### Color Palette
```typescript
colorPalette: {
  primary: "#2E3F9E",    // Royal Blue
  secondary: "#1E2A6E",  // Deep Blue
  accent: "#2E3F9E",     // Royal Blue accent
  background: "#F5F3EB", // Cream/Beige
  text: "#1A1A2E",       // Near black
  textLight: "#6B7280",  // Gray
}
```

#### Typography
```typescript
typography: {
  headingFont: "Georgia, serif",
  bodyFont: "Inter, -apple-system, sans-serif",
  headingStyle: "serif",
  bodyStyle: "editorial",
}
```

#### Slide Layouts

All slides use a **split-panel layout** with 50/50 left-right design:

1. **Cover Slide**
   - Left: Royal blue panel with title, decorative accent line
   - Right: Cream panel with vertical "TABLE OF CONTENT" text, numbered items (01-05)

2. **Index Slide (About Us)**
   - Left: Cream panel with "OUR STORY" section, year badge
   - Right: Blue panel with "OUR MISSION", numbered points, skills badges

3. **Objective Slide (Our Service)**
   - Left: Cream panel with service items (01, 02, 03...), percentage circles
   - Right: Blue panel with image grid placeholders

4. **Generic Slide (Our Vision)**
   - Left: Blue panel with numbered steps (01-06), progress bar
   - Right: Cream panel with content boxes, world map icon

5. **Talent Strategy Slide (Our Creative Team)**
   - Left: Blue panel with skills badges, founder quote
   - Right: Cream panel with 6-person team grid, metrics

6. **Recommended Scenario Slide (Our Create Work)**
   - Left: Blue panel with large statistics (25%, +15, 3x)
   - Right: Cream panel with content boxes grid

#### Visual Elements

- **Numbered Sections**: Large numbers (01, 02, 03...) in Georgia serif
- **Accent Lines**: `#F5F3EB` cream on blue, `#2E3F9E` blue on cream
- **Decorative Patterns**: Subtle SVG patterns for depth
- **Circular Avatars**: Team member profile images
- **Progress Bars**: Step indicators with fill states
- **Statistics Displays**: Large bold numbers with labels

## Design Philosophy

- **Minimal & Clean**: Inspired by Stripe's design principles
- **Generous Whitespace**: Breathing room for focused work
- **Subtle Shadows**: Depth without distraction
- **Clear Hierarchy**: Visual guidance through typography and spacing
- **Purposeful Color**: Every color has meaning and function
- **Accessibility First**: WCAG AA compliant with full keyboard navigation

## Color Palette

### Primary Colors
```typescript
primary: {
  DEFAULT: '#635BFF',      // Stripe-inspired purple
  hover: '#5851E8',        // Hover state
  active: '#4F47CC',       // Active/pressed state
}
```

### Neutral Colors
```typescript
secondary: '#0A2540',              // Dark navy for headings
background: {
  DEFAULT: '#F7F9FC',              // Soft gray-white
  surface: '#FFFFFF',              // Pure white for cards/panels
}
border: {
  DEFAULT: '#E3E8EF',              // Standard borders
  light: '#F0F4F8',                // Lighter borders
}
```

### Text Colors
```typescript
text: {
  primary: '#0A2540',              // Primary text (headings)
  secondary: '#425466',            // Body text
  muted: '#697386',                // Supporting text
}
```

### Feedback Colors
```typescript
success: '#00D924',                // Success states
warning: '#FFC043',                // Warning states
error: '#DF1642',                  // Error states
```

## Typography Scale

All typography is based on the system font stack for optimal rendering across platforms:

```typescript
fontFamily: {
  sans: [
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif',
  ],
}
```

### Font Sizes
- **Heading 1**: 32px / 600 / line-height: 1.3
- **Heading 2**: 24px / 600 / line-height: 1.3
- **Heading 3**: 18px / 600 / line-height: 1.3
- **Body Large**: 16px / 400 / line-height: 1.5
- **Body**: 14px / 400 / line-height: 1.5
- **Body Small**: 13px / 400 / line-height: 1.5
- **Caption**: 12px / 400 / line-height: 1.5
- **Label**: 12px / 600 / letter-spacing: 0.5px / uppercase

## Spacing System

Consistent spacing creates rhythm and visual harmony:

```typescript
xs: '4px',       // Extra small - tight spacing
sm: '8px',       // Small - compact elements
md: '12px',      // Medium - standard spacing
lg: '16px',      // Large - section spacing
xl: '24px',      // Extra large - major sections
2xl: '32px',     // 2X large - panel padding
3xl: '48px',     // 3X large - canvas padding
4xl: '64px',     // 4X large - major layout
```

## Component Library

### Button Component

Located at: `components/ui/Button.tsx`

**Variants:**
- `primary`: Main action button (purple background)
- `secondary`: Secondary action (transparent with border)
- `icon`: Icon-only button (transparent)

**Sizes:**
- `sm`: 32px height (h-8)
- `md`: 36px height (h-9) - default
- `lg`: 40px height (h-10)

**Usage:**
```tsx
import Button from '@/components/ui/Button';

<Button variant="primary" size="md">
  Export
</Button>

<Button variant="secondary">
  Cancel
</Button>

<Button variant="icon" size="sm">
  <IconComponent />
</Button>
```

### Input Component

Located at: `components/ui/Input.tsx`

**Features:**
- Label support with consistent styling
- Error state with error message display
- Focus states with ring styling
- Disabled state styling

**Usage:**
```tsx
import Input from '@/components/ui/Input';

<Input 
  label="Slide Title"
  placeholder="Enter title..."
  error={errors.title?.message}
/>
```

### Label Component

Located at: `components/ui/Label.tsx`

**Features:**
- Consistent uppercase styling
- Letter spacing for readability
- Muted color for hierarchy

**Usage:**
```tsx
import Label from '@/components/ui/Label';

<Label htmlFor="title">
  Slide Title
</Label>
```

## Layout Structure

### Top Navigation Bar
- **Height**: 60px
- **Background**: `#FFFFFF`
- **Border Bottom**: 1px solid `#E3E8EF`
- **Sections**: Left (logo/title), Center (toolbar), Right (actions/avatar)

### Slide Panel (Left Sidebar)
- **Width**: 240px
- **Background**: `#F7F9FC`
- **Border Right**: 1px solid `#E3E8EF`
- **Thumbnails**: 16:9 aspect ratio with subtle shadows

### Canvas Area
- **Background**: `#F7F9FC`
- **Padding**: 48px
- **Slide Container**: Max-width 1280px, rounded-lg, shadow-subtle

### Properties Panel (Right Sidebar)
- **Width**: 280px
- **Background**: `#FFFFFF`
- **Border Left**: 1px solid `#E3E8EF`
- **Sections**: Separated by 24px margin

## Shadows

Subtle depth creates visual hierarchy without distraction:

```typescript
subtle: '0 1px 3px rgba(10, 37, 64, 0.1), 0 4px 12px rgba(10, 37, 64, 0.06)',
hover: '0 4px 12px rgba(10, 37, 64, 0.08)',
elevated: '0 4px 16px rgba(10, 37, 64, 0.12)',
modal: '0 8px 32px rgba(10, 37, 64, 0.16)',
floating: '0 4px 16px rgba(10, 37, 64, 0.2)',
```

## Animation Tokens

Smooth, purposeful animations enhance the user experience:

```typescript
fast: '150ms ease',      // Quick interactions (hover)
base: '200ms ease',      // Standard transitions
slow: '300ms ease',      // Deliberate transitions
```

## Border Radius

Consistent rounding creates cohesion:

```typescript
DEFAULT: '6px',          // Standard elements
lg: '8px',               // Cards, larger elements
xl: '12px',              // Modals, major containers
```

## Accessibility

### Focus States
- **Ring**: 3px solid primary color at 10% opacity
- **Border**: Primary color
- **Transition**: Fast (150ms)

### Keyboard Navigation
- All interactive elements accessible via Tab
- Arrow keys for slide navigation
- Escape key to close panels/modals
- Enter/Space to activate buttons

### ARIA Support
- Descriptive labels on all icon buttons
- Dialog roles for modals and panels
- Live regions for status updates
- Proper heading hierarchy

### Color Contrast
All text meets WCAG AA standards:
- Primary text on white: 12.6:1
- Secondary text on white: 7.8:1
- Muted text on white: 4.9:1

## Implementation Files

### Configuration
- `tailwind.config.ts` - Complete design tokens

### Components
- `components/PresentationEditor.tsx` - Main editor interface
- `components/NanoBananaPanel.tsx` - AI image assistant panel
- `components/ui/Button.tsx` - Button component
- `components/ui/Input.tsx` - Input component
- `components/ui/Label.tsx` - Label component

### Documentation
- `DESIGN_SYSTEM.md` - This file
- `README.md` - Updated with design system info
- `CHANGELOG.md` - Version history
- `ClaudeMD.md` - Technical documentation

## Migration Notes

### Breaking Changes
- Updated color palette (gray-* → text-*, border-*, background-*)
- New spacing scale (using sm, md, lg, xl instead of numbered scale)
- Typography tokens (text-body, text-heading-1, etc.)
- Shadow system (shadow-subtle, shadow-hover, etc.)

### Backwards Compatibility
- Old components continue to work
- Gradual migration recommended
- Use new components for new features

## Future Enhancements

### Planned
- [ ] Dark mode support
- [ ] Floating toolbar for element selection
- [ ] Context menu component
- [ ] Modal/dialog component
- [ ] Toast notification system
- [ ] Skeleton loader component
- [ ] Enhanced accessibility features

### Under Consideration
- [ ] Custom theme builder
- [ ] Brand color customization
- [ ] Export design tokens to other platforms
- [ ] Component playground/documentation site

## Resources

### Inspiration
- [Stripe Design System](https://stripe.com/docs/design)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://radix-ui.com)
- [Shadcn UI](https://ui.shadcn.com)

### Tools
- [Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Color Palette Generator](https://coolors.co)
- [Typography Scale Calculator](https://type-scale.com)

---

**Maintained by**: Pretty Presentations Team  
**Last Updated**: October 6, 2025  
**Version**: 2.0.0

