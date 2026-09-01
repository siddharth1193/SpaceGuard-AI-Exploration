# SpaceGuard AI — Design System

## Visual Identity

SpaceGuard AI uses a **mission-control-inspired** dark interface optimized for operational monitoring. The design prioritizes information density, status visibility, and readability over decorative aesthetics.

**Design thesis**: Every visual element must support the operator's ability to assess satellite fleet health at a glance. No decorative elements without functional purpose.

## Color System

### Primary Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `space-950` | `#020818` | Page background |
| `space-900` | `#040d24` | Card backgrounds |
| `gray-700/50` | `rgba(55,65,81,0.5)` | Borders, dividers |
| `blue-600` | `#3b82f6` | Primary action, active nav |
| `cyan-500` | `#06b6d4` | Secondary accent, velocity |

### Status Colors
| Status | Hex | Context |
|--------|-----|---------|
| HEALTHY / GREEN | `#22c55e` | Normal operations |
| WARNING / YELLOW | `#eab308` | Requires attention |
| DEGRADED / ORANGE | `#f97316` | Action needed |
| CRITICAL / RED | `#ef4444` | Immediate intervention |
| DEMO | `#a855f7` | Demo/simulated data indicator |

### Status Badge Pattern
```css
.status-badge {
  background: {color}/15;   /* 15% opacity fill */
  border: 1px solid {color}/25;  /* 25% opacity border */
  color: {color};  /* Full color text */
}
```

## Typography

| Role | Font | Weight | Size |
|------|------|--------|------|
| Body text | Inter | 400 | 14px (default) |
| Headings | Inter | 600-700 | 14-20px |
| Card titles | Inter | 600 | 12px, uppercase, tracked |
| Data values | JetBrains Mono | 500-700 | 14-28px |
| Labels | Inter | 400 | 10-12px, uppercase, tracked |
| Badges | Inter | 600 | 10-12px, uppercase |

**Rule**: All telemetry values, metrics, and numerical data use `JetBrains Mono` for alignment and readability.

## Spacing Scale

Uses Tailwind's default 4px scale: `0.5` (2px), `1` (4px), `1.5` (6px), `2` (8px), `3` (12px), `4` (16px), `6` (24px), `8` (32px)

Page padding: `p-4` (mobile) / `p-6` (desktop)

## Radius System

| Element | Radius |
|---------|--------|
| Cards | `rounded-xl` (12px) |
| Buttons | `rounded-lg` (8px) |
| Badges | `rounded-full` (999px) |
| Inputs | `rounded-lg` (8px) |

## Elevation

Flat design — no box-shadows on cards. Depth communicated through:
- Border opacity (50% for cards, stronger on hover)
- Background opacity differences
- Backdrop blur on header

## Component Patterns

### Cards
```css
.card {
  bg-gray-900 border border-gray-700/50 rounded-xl p-4
}
```

### Data Display
```
┌─ card-header (title + badge/action) ─────────────┐
│                                                     │
│  data-row: label ··················· value          │
│  data-row: label ··················· value          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### KPI Cards
Large monospace number + uppercase label below. Color indicates severity.

## Interaction Model

- **Navigation**: Sidebar nav with active state highlighting
- **Hover**: Cards lighten border on hover, nav items change text color
- **Transitions**: `transition-colors` for color changes (200ms default)
- **Click**: Satellite cards link to detail pages via React Router

## Motion Strategy

- **Minimal**: Only functional animations (loading spinner, bounce dots)
- **Reduced motion**: All animations disabled via `prefers-reduced-motion`
- **Transition timing**: 200ms for hover states

## Responsive Behavior

| Breakpoint | Layout |
|-----------|--------|
| < 1024px | Sidebar hidden (hamburger menu), single column |
| ≥ 1024px (lg) | Fixed sidebar + main content |
| ≥ 768px (md) | 2-column grids for cards/charts |
| ≥ 1280px (xl) | 3-column grids for satellite explorer |

## Accessibility

- **Focus visibility**: `outline-2 outline-offset-2 outline-blue-500` on `:focus-visible`
- **Contrast**: All text meets WCAG AA minimum (4.5:1 for body, 3:1 for large)
- **Keyboard**: All interactive elements focusable and operable via keyboard
- **Screen reader**: Semantic HTML, meaningful link text
- **Reduced motion**: Animations suppressed for users who prefer it

## Signature Visual Element

A subtle blue grid overlay (`48px` spacing, 3% opacity) creates a mission-control aesthetic without visual noise. This is applied to the `body::before` pseudo-element.

## Empty, Loading, and Error States

| State | Behavior |
|-------|----------|
| Loading | Blue spinner with descriptive message |
| Error | Warning icon + red error text + Retry button |
| Empty | Checkmark icon + "No items" message |
| No data | Skeleton placeholders (shimmer) |
