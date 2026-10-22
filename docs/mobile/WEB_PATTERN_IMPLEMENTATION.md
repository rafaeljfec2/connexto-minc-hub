# Mobile Implementation Using Web Patterns

This document describes how mobile screens are implemented following the same functional patterns as the web version.

## Web patterns identified

### 1. DashboardPage

- **Structure**: Grid of stat cards
- **Components**: Cards with title and value
- **Features**:
  - Total volunteers
  - Active teams
  - Next worship service
  - Attendance (month)
  - Recent activity
  - Upcoming schedules

### 2. CRUD pages (People, Teams, Schedules)

- **Structure**: `CrudPageLayout` + `CrudFilters` + `CrudView`
- **Components**:
  - PageHeader (title, description, icon, create button)
  - CrudFilters (search + filters)
  - CrudView (grid cards or list table)
  - Specific cards (`VolunteerCard`, `TeamCard`, `ScheduleCard`)
- **Features**:
  - List items (grid or list)
  - Search
  - Filter
  - Create (modal)
  - Edit (modal)
  - Delete (confirm dialog)
  - `useCrud` hook for state management

### 3. ProfilePage

- **Structure**: PageHeader + form cards
- **Components**:
  - PageHeader (title, description)
  - Card with personal information form
  - Card with change-password form
  - Logout button
- **Features**:
  - Display user information
  - Edit information
  - Change password (future)
  - Logout

## Mobile adaptation

### Mobile-first design

- **Lists**: `FlatList` with cards (no table)
- **Search**: SearchBar at the top (input with icon)
- **Filters**: Select/Picker (native dropdown)
- **Modals**: Bottom sheet or native modal
- **Forms**: `ScrollView` with inputs
- **Navigation**: Stack Navigator + bottom tab navigator

### Mobile equivalents

| Web | Mobile |
|-----|--------|
| `CrudPageLayout` | Screen with `ScrollView`/`FlatList` |
| `PageHeader` | View with title + description text |
| `CrudFilters` | View with search input + picker filters |
| `CrudView` | `FlatList` with cards |
| `VolunteerCard` | Card component (React Native) |
| `TeamCard` | Card component (React Native) |
| `ScheduleCard` | Card component (React Native) |
| `Modal` | React Native `Modal` |
| `ConfirmDialog` | `Alert` or custom modal |

## Implementation structure

### PeopleScreen

```typescript
// Similar structure to PeoplePage
- useState for data
- useMemo for filters
- FlatList with VolunteerCard
- SearchBar
- Filters (ministry, team)
- Modal for create/edit
- ConfirmDialog for delete
```

### TeamsScreen

```typescript
// Similar structure to TeamsPage
- useState for data
- useMemo for filters
- FlatList with TeamCard
- SearchBar
- Modal for create/edit
- ConfirmDialog for delete
```

### SchedulesScreen

```typescript
// Similar structure to SchedulesPage
- useState for data
- useMemo for filters
- FlatList with ScheduleCard
- SearchBar
- Modal for create/edit
- ConfirmDialog for delete
```

### ProfileScreen

```typescript
// Similar structure to ProfilePage
- useState for formData
- ScrollView with cards
- Input components
- Logout button
```

### DashboardScreen

```typescript
// Similar structure to DashboardPage
- Grid of stat cards (2 columns on mobile)
- Recent activity cards
- Upcoming schedule cards
```

## Implementation notes

1. **Data**: Use the same mock data as the web (`@minc-hub/shared`) or a mobile-specific variant
2. **Services**: Use shared services (`peopleService`, `teamsService`, etc.)
3. **Types**: Use shared types (`@minc-hub/shared/types`)
4. **Design system**: Use the shared theme (already implemented)
5. **Hooks**: Add mobile-specific hooks if needed (e.g. mobile `useCrud`)

## Implementation checklist

- [ ] DashboardScreen (statistics)
- [ ] PeopleScreen (`FlatList` + `VolunteerCard` + search + filters)
- [ ] TeamsScreen (`FlatList` + `TeamCard` + search)
- [ ] SchedulesScreen (`FlatList` + `ScheduleCard` + search)
- [ ] ProfileScreen (`ScrollView` + form + logout)
- [ ] Card components (`VolunteerCard`, `TeamCard`, `ScheduleCard`)
- [ ] SearchBar component
- [ ] Modal component (if needed)
- [ ] ConfirmDialog component (if needed)
