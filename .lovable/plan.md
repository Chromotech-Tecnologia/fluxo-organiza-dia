

## Plan: Mobile-first responsive improvements (mobile only)

Three areas to fix, all using `md:` breakpoint to preserve desktop layout:

### 1. TaskCardImproved - Mobile card layout
**Problem**: Badges and action buttons overflow horizontally, forcing zoom/scroll.

**Changes in `src/components/tasks/TaskCardImproved.tsx`**:
- Top row: Keep only drag handle, order badge, and title on first line. Move other badges (meeting time, delegated, shared, attachments) to wrap below on mobile
- Action buttons row: Stack vertically on mobile using `flex-col md:flex-row` and make buttons full-width on mobile (`w-full md:w-auto`), remove `min-w-[]` on mobile
- Checklist progress: Move below buttons on mobile instead of side-by-side

### 2. TaskFiltersHorizontal - Wrap in Sheet/Drawer on mobile
**Problem**: All filters are inline, causing horizontal overflow on mobile.

**Changes in `src/components/tasks/TaskFiltersHorizontal.tsx`**:
- On mobile: Show only search input + a "Filtros" button that opens a `Sheet` (bottom drawer) containing all filter controls stacked vertically
- On desktop (`md:` and up): Keep current inline layout unchanged
- Use `useIsMobile()` hook to conditionally render Sheet vs inline
- Inside the Sheet: stack date buttons, date range, status, reagendar, conclusão, compartilhadas, sort, and advanced filters vertically with proper spacing

### 3. TaskStatsCompact - Accordion on mobile
**Problem**: `grid-cols-4` cards overflow on mobile.

**Changes in `src/components/tasks/TaskStatsCompact.tsx`**:
- On mobile: Replace the 4-column grid with an `Accordion` component where each stat card becomes an accordion item
- On desktop: Keep the existing `grid-cols-4` layout using `hidden md:grid` / `md:hidden` conditional rendering
- Each accordion item shows the card title + a summary (e.g., "12 tarefas") in the trigger, full details in the content

### 4. TasksPage header - Minor mobile tweaks
**Changes in `src/pages/TasksPage.tsx`**:
- Reduce title size on mobile: `text-xl md:text-3xl`
- Stack header vertically on mobile: `flex-col md:flex-row`

### Files to modify
1. `src/components/tasks/TaskCardImproved.tsx`
2. `src/components/tasks/TaskFiltersHorizontal.tsx`
3. `src/components/tasks/TaskStatsCompact.tsx`
4. `src/pages/TasksPage.tsx`

