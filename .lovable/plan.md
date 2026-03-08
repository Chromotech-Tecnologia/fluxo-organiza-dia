

## Plan: Mobile date navigation + Sidebar active state fix

### 1. Mobile date navigation with prev/next day buttons (`TaskFiltersHorizontal.tsx`)

**Current**: Mobile shows "Ontem / Hoje / Amanhã" inside the filter Sheet, plus date range inputs.

**New behavior**: Outside the Sheet (visible on the main task page), show a date navigation bar:
- `◀` button (previous day) | Current date label (e.g., "Hoje - 08/03") | `▶` button (next day)
- Date range inputs (De/Até) below
- Each press of `◀` moves the date back 1 day, `▶` forward 1 day
- The label shows "Ontem", "Hoje", "Amanhã" when applicable, otherwise shows the formatted date
- Remove "Ontem/Hoje/Amanhã" buttons from inside the Sheet since they're now outside

**Implementation**:
- Add a helper function to offset a date string by N days
- Track the current single-date offset via the existing `dateRange` filter (start === end means single day)
- Render the nav bar between search row and Sheet on mobile only
- Keep desktop layout completely unchanged

### 2. Sidebar active state fix (`AppSidebar.tsx`)

**Problem**: The `getNavClass` applies green gradient classes but these get overridden by `SidebarMenuButton`'s default hover/active styles from `sidebarMenuButtonVariants`.

**Fix**: Add a visible left border indicator and stronger background for the active state:
```
isActive → "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 text-foreground font-medium border-l-2 border-primary"
```
Also add `!important` via Tailwind `!` prefix on the background classes to override the sidebar button defaults, or apply via inline style.

### Files to modify
1. `src/components/tasks/TaskFiltersHorizontal.tsx` — date nav bar on mobile
2. `src/components/layout/AppSidebar.tsx` — sidebar active highlight
3. `src/lib/utils.ts` — add `offsetDateString(dateStr, days)` helper

