

## Plan: 4 Improvements to Task System

### 1. Fix Meeting Start/End Time Persistence

**Problem**: The `tasks` table has no `meeting_start_time` or `meeting_end_time` columns. The `addTask` and `updateTask` functions in `useSupabaseTasks.ts` never map these fields, so they're lost on save.

**Solution**:
- Add DB migration: `ALTER TABLE tasks ADD COLUMN meeting_start_time text, ADD COLUMN meeting_end_time text;`
- Update `addTask` in `useSupabaseTasks.ts` to include `meeting_start_time` and `meeting_end_time` in the insert data
- Update `updateTask` to map `meetingStartTime` -> `meeting_start_time`
- Update the query converter (line ~80) to read `meeting_start_time`/`meeting_end_time` back into the Task type

### 2. Fix Routine Functionality

**Problem**: Routine config fields (`routineCycle`, `routineStartDate`, etc.) aren't persisted to the DB. The `routine_config` jsonb column exists but is never used. When routine tasks are created via `generateRoutineTasks`, each individual task loses the routine metadata.

**Solution**:
- In `addTask`, save routine fields into the `routine_config` jsonb column: `{ cycle, startDate, endDate, includeWeekends }`
- In the query converter, read `routine_config` back into the Task type fields (`routineCycle`, `routineStartDate`, etc.)
- In `updateTask`, persist routine config changes
- Ensure `generateRoutineTasks` properly passes routine metadata to each generated task

### 3. Add Scrollbar to Large Checklists

**Problem**: When a task has many checklist items, the list grows unbounded inside the form/modal.

**Solution**:
- In `InteractiveSubItemList.tsx`, wrap the items list in a `ScrollArea` with `max-h-[300px]` (or similar) when there are more than ~5 items
- Also apply in `TaskCardImproved.tsx` if checklists are rendered there

### 4. Reorganize Task Form into Tabs

**Problem**: The form is a long scrollable list. User wants it organized into tabs.

**Solution** - Reorganize `TaskForm.tsx` using the existing `Tabs` component with 3 tabs:

- **Tab "Geral"** (General): Title, Description, Date, Order, Type, Assigned Person, Priority, Category, Meeting Times (conditional), Time Investment
- **Tab "Checklist e Anexos"**: InteractiveSubItemList, TaskAttachments, Observations
- **Tab "Rotina e Compartilhamento"**: Routine toggle + config, Share task section

The submit/cancel buttons remain outside the tabs at the bottom.

### Files to Change

| File | Change |
|---|---|
| DB migration | Add `meeting_start_time`, `meeting_end_time` columns |
| `src/hooks/useSupabaseTasks.ts` | Map meeting times and routine_config in add/update/read |
| `src/components/tasks/InteractiveSubItemList.tsx` | Add ScrollArea wrapper with max-height |
| `src/components/tasks/TaskForm.tsx` | Reorganize into 3 tabs using Tabs component |

### Technical Details

- The `routine_config` column already exists as `jsonb` - no migration needed for that
- Meeting time columns need a migration since they don't exist yet
- Tabs component is already available at `@/components/ui/tabs`
- ScrollArea component is already available at `@/components/ui/scroll-area`

