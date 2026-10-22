# Refactoring Analysis - Web App

## 🔍 Refactoring Opportunities Identified

### 1. ⚠️ CRITICAL - PlusIcon Duplication

**Problem**: `PlusIcon` function duplicated in 6 files

- `ChurchesPage.tsx`
- `MinistriesPage.tsx`
- `TeamsPage.tsx`
- `ServicesPage.tsx`
- `SchedulesPage.tsx`
- `PeoplePage.tsx`

**Solution**: Move to `components/icons/index.tsx`

---

### 2. ⚠️ CRITICAL - Duplicated Routes in App.tsx

**Problem**: Repeated `MOCK_MODE` pattern on every route

- ~200 duplicated lines
- Hard to maintain
- Error-prone

**Solution**: Create `ProtectedRouteWrapper` component or helper

---

### 3. ⚠️ HIGH - Duplicated Modal/Form Logic

**Problem**: Repeated pattern on every CRUD page:

- `handleOpenModal` - similar everywhere
- `handleCloseModal` - similar everywhere
- `handleSubmit` - similar everywhere
- `handleDeleteClick` - similar everywhere
- `handleDeleteConfirm` - similar everywhere

**Solution**: Create `useCrudForm` hook encapsulating this logic

---

### 4. ⚠️ MEDIUM - Duplicated Mock Data

**Problem**: Mock data appears in multiple files

- `MOCK_MINISTRIES` in PeoplePage and TeamsPage
- `MOCK_TEAMS` in PeoplePage and TeamsPage
- `MOCK_PEOPLE` in TeamsPage

**Solution**: Centralize in `lib/mockData.ts` or `services/mockData.ts`

---

### 5. ⚠️ MEDIUM - Duplicated Search Filter

**Problem**: `filteredItems` with `useMemo` logic repeated

- Similar pattern on every page
- Could be extracted to a hook

**Solution**: Improve `useSearch` or create `useFilteredItems`

---

### 6. ⚠️ LOW - PageWithCrud Not Used

**Problem**: Component exists but is unused

- All pages use `CrudPageLayout` now
- `PageWithCrud` can be removed or updated

**Solution**: Remove or update to use new components

---

### 7. ⚠️ LOW - Duplicated MOCK_MODE Constant

**Problem**: `MOCK_MODE` defined in multiple places

- `App.tsx` (2x)
- `ProtectedRoute`

**Solution**: Centralize in `lib/constants.ts` or `useMockMode` hook

---

### 8. ⚠️ LOW - Duplicated Helper Functions

**Problem**: Functions like `getChurchName`, `getMinistryName`, `getTeamName` duplicated

- Appear on multiple pages
- Similar logic

**Solution**: Create helpers in `lib/helpers.ts` or specific hooks

---

## 📋 Refactoring Plan

### Phase 1: Components and Icons

1. ✅ Move `PlusIcon` to `components/icons`
2. ✅ Update all imports

### Phase 2: Custom Hooks

1. ✅ Create `useCrudForm` hook
2. ✅ Create `useMockMode` hook
3. ✅ Improve `useSearch` for custom filters

### Phase 3: Data Centralization

1. ✅ Centralize mock data
2. ✅ Centralize constants

### Phase 4: Routes and Layout

1. ✅ Refactor `App.tsx` to reduce duplication
2. ✅ Create helper for protected routes

### Phase 5: Cleanup

1. ✅ Remove `PageWithCrud` if unused
2. ✅ Remove dead code
3. ✅ Update imports

---

## 🎯 Prioritization

### High Priority

1. Duplicated PlusIcon
2. Duplicated routes in App.tsx
3. Duplicated modal/form logic

### Medium Priority

4. Duplicated mock data
5. Duplicated search filter

### Low Priority

6. Unused PageWithCrud
7. Duplicated MOCK_MODE constant
8. Duplicated helper functions
