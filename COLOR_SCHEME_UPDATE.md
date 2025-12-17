# Color Scheme Update Guide

## New Color Palette

- **F26430** - Orange (Primary accent, destructive actions)
- **1A1F16** - Black (Dark background, dark text)
- **19297C** - Blue (Primary color, links)
- **028090** - Teal (Secondary accent, success states)
- **FFFCF2** - White (Light background, light text)
- **DBC2CF** - Thistle (Muted/secondary, borders)

## Color Usage

### Light Mode
- Background: `#FFFCF2`
- Text: `#1A1F16`
- Primary: `#19297C`
- Accent: `#028090`
- Destructive: `#F26430`
- Muted: `#DBC2CF`
- Borders: `#DBC2CF`

### Dark Mode
- Background: `#1A1F16`
- Text: `#FFFCF2`
- Primary: `#028090`
- Accent: `#19297C`
- Destructive: `#F26430`
- Muted: `#DBC2CF` or `#19297C`
- Borders: `#19297C`

## Tailwind Classes

Use these classes for consistent styling:

```tsx
// Backgrounds
bg-[#FFFCF2] dark:bg-[#1A1F16]

// Text
text-[#1A1F16] dark:text-[#FFFCF2]

// Primary
bg-[#19297C] dark:bg-[#028090]
text-[#19297C] dark:text-[#028090]

// Accent
bg-[#028090] text-white

// Destructive
bg-[#F26430] text-white
text-[#F26430]

// Muted
text-[#19297C] dark:text-[#DBC2CF]
bg-[#DBC2CF] dark:bg-[#19297C]

// Borders
border-[#DBC2CF] dark:border-[#19297C]
```

## Pages Updated

✅ Dashboard (`app/page.tsx`)
✅ Leaderboard (`app/leaderboard/page.tsx`)
✅ FPL Leaderboard (`app/leaderboard-fpl/page.tsx`)
✅ Navigation (`components/navigation.tsx`)
✅ Leaderboard Table (`components/leaderboard-table.tsx`)
✅ Global CSS (`app/globals.css`)

## Pages Still Need Update

- Teams (`app/teams/page.tsx`)
- Gameweeks (`app/gameweeks/page.tsx`)
- Financials (`app/financials/page.tsx`)
- Insights (`app/insights/page.tsx`)
- Transfers (`app/transfers/page.tsx`)
- Player Card (`components/player-card.tsx`)
- Position History Chart (`components/charts/position-history-chart.tsx`)
- League Comparison Chart (`components/charts/league-comparison-chart.tsx`)

## Replacement Patterns

### Old → New

1. `bg-[#1a1b2e]` → `bg-[#FFFCF2] dark:bg-[#1A1F16]`
2. `bg-[#2B2D42]` → `bg-white dark:bg-[#1A1F16]`
3. `border-[#3d3f56]` → `border-[#DBC2CF] dark:border-[#19297C]`
4. `text-white` → `text-[#1A1F16] dark:text-[#FFFCF2]`
5. `text-gray-400` → `text-[#19297C] dark:text-[#DBC2CF]`
6. `text-[#F7E733]` → `text-[#F26430]`
7. `text-[#1BE7FF]` → `text-[#028090]`
8. `text-[#4DAA57]` → `text-[#028090]`
9. `text-[#FF3A20]` → `text-[#F26430]`
10. `bg-[#F7E733]` → `bg-[#F26430]`
11. `bg-[#1BE7FF]` → `bg-[#028090]`
12. `bg-[#4DAA57]` → `bg-[#028090]`
13. `bg-[#FF3A20]` → `bg-[#F26430]`

