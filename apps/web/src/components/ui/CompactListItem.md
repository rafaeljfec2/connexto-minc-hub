# CompactListItem Component

Standard reusable component for compact, consistent lists across the application.

## Features

- ✅ Compact, efficient layout
- ✅ Custom icon support
- ✅ Badges with color variants
- ✅ Secondary metadata
- ✅ Optional three-dot menu
- ✅ Fully accessible
- ✅ Dark mode support

## Props

| Prop          | Type        | Description                            |
| ------------- | ----------- | -------------------------------------- |
| `icon`        | `ReactNode` | Icon to display (optional)             |
| `iconColor`   | `string`    | CSS classes for icon background color  |
| `title`       | `string`    | Main title (required)                  |
| `subtitle`    | `string`    | Subtitle/description (optional)        |
| `badge`       | `object`    | Badge with text and variant (optional) |
| `metadata`    | `string`    | Additional information (optional)      |
| `onClick`     | `function`  | Callback when the item is clicked      |
| `onMenuClick` | `function`  | Callback when the menu is clicked      |
| `className`   | `string`    | Additional CSS classes                 |

## Badge Variants

- `success` - Green (e.g. active status)
- `warning` - Yellow (e.g. pending)
- `error` - Red (e.g. error)
- `info` - Blue (e.g. information)
- `default` - Gray (default)

## Usage Examples

### Basic Example

\`\`\`tsx
import { CompactListItem } from '@/components/ui/CompactListItem'

<CompactListItem
icon={<UserIcon />}
title="John Silva"
subtitle="Developer"
onClick={() => console.log('Clicked')}
/>
\`\`\`

### With Badge and Metadata

\`\`\`tsx
<CompactListItem
icon={<TeamIcon />}
title="Worship Team"
subtitle="WELCOME"
metadata="15 members"
badge={{ text: 'Active', variant: 'success' }}
onClick={() => navigate('/team/123')}
onMenuClick={() => openMenu()}
/>
\`\`\`

### With Custom Icon

\`\`\`tsx
<CompactListItem
icon={
<svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
<path d="..." />
</svg>
}
iconColor="bg-blue-100 dark:bg-blue-900/20"
title="Music Ministry"
subtitle="Central Church"
onClick={() => {}}
/>
\`\`\`

### Full List

\`\`\`tsx

<div className="bg-white dark:bg-dark-900 rounded-lg overflow-hidden border border-dark-200 dark:border-dark-800">
  {items.map(item => (
    <CompactListItem
      key={item.id}
      icon={<item.Icon />}
      title={item.name}
      subtitle={item.description}
      metadata={item.count}
      badge={item.isActive ? { text: 'Active', variant: 'success' } : undefined}
      onClick={() => handleClick(item)}
      onMenuClick={() => handleMenu(item)}
    />
  ))}
</div>
\`\`\`

## Use Cases

This component is ideal for:

- ✅ Team lists
- ✅ User lists
- ✅ Ministry lists
- ✅ Event lists
- ✅ Message lists
- ✅ Any list that needs to be compact and scalable

## Accessibility

- Uses native `<button>` element for keyboard navigation
- Full screen reader support
- Visible hover and focus states
- Appropriate aria-labels

## Performance

- Optimized rendering
- No unnecessary data loading
- Ideal for long lists (100+ items)
- Efficient layout that saves space
