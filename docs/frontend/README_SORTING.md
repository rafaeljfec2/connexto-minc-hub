# Sorting Guide for Custom Grid

This document explains how to implement column sorting in the custom grid using `useSort` and `SortableColumn`.

## Required Components

1. **`useSort`** - Hook to manage sort state
2. **`SortableColumn`** - Component for clickable headers
3. **`sortData`** - Function to sort data

## Full Example

```typescript
import { useSort, SortConfig } from '@/hooks/useSort'
import { SortableColumn } from '@/components/ui/SortableColumn'
import { CrudView } from '@/components/crud/CrudView'
import { TableRow, TableCell, TableHead } from '@/components/ui/Table'

// 1. Define the data type
interface MeuItem {
  id: string
  nome: string
  email: string
  dataCriacao: string
  status: 'ativo' | 'inativo'
}

export function MinhaPagina() {
  const [items, setItems] = useState<MeuItem[]>([])
  
  // 2. Initialize sort hook
  const { sortConfig, handleSort, sortData } = useSort<MeuItem>({
    defaultKey: 'nome',
    defaultDirection: 'asc',
  })

  // 3. Value extractors for sorting
  const sortExtractors = {
    nome: (item: MeuItem) => item.nome.toLowerCase(),
    email: (item: MeuItem) => item.email?.toLowerCase() ?? '',
    dataCriacao: (item: MeuItem) => new Date(item.dataCriacao).getTime(),
    status: (item: MeuItem) => item.status,
  }

  // 4. Apply sort to filtered data
  const filteredAndSortedItems = useMemo(() => {
    const filtered = items.filter(/* your filter logic */)
    return sortData(filtered, sortExtractors)
  }, [items, sortConfig, sortData])

  // 5. Helper to render sortable headers
  const renderHeader = (key: keyof MeuItem, label: string) => (
    <SortableColumn
      sortKey={key}
      currentSort={sortConfig}
      onSort={handleSort}
    >
      {label}
    </SortableColumn>
  )

  // 6. Grid view (cards) - data is already sorted
  const gridView = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredAndSortedItems.map(item => (
        <MeuCard key={item.id} item={item} />
      ))}
    </div>
  )

  // 7. List view (table) - use SortableColumn on headers
  const listViewRows = filteredAndSortedItems.map(item => (
    <TableRow key={item.id}>
      <TableCell>{item.nome}</TableCell>
      <TableCell>{item.email}</TableCell>
      <TableCell>
        {new Date(item.dataCriacao).toLocaleDateString('pt-BR')}
      </TableCell>
      <TableCell>{item.status}</TableCell>
    </TableRow>
  ))

  return (
    <CrudView
      viewMode={viewMode}
      gridView={gridView}
      listView={{
        headers: [
          renderHeader('nome', 'Name'),
          renderHeader('email', 'Email'),
          renderHeader('dataCriacao', 'Created At'),
          renderHeader('status', 'Status'),
          'Actions', // Non-sortable column
        ],
        rows: listViewRows,
      }}
    />
  )
}
```

## Step by Step

### 1. Import dependencies

```typescript
import { useSort, SortConfig } from '@/hooks/useSort'
import { SortableColumn } from '@/components/ui/SortableColumn'
```

### 2. Initialize the hook

```typescript
const { sortConfig, handleSort, sortData } = useSort<MeuTipo>({
  defaultKey: 'fieldPadrao', // Initial sort field
  defaultDirection: 'asc', // Initial direction
})
```

### 3. Create sort extractors

Extractors define how to read each field for comparison:

```typescript
const sortExtractors = {
  // String: lowercase for case-insensitive compare
  nome: (item: MeuTipo) => item.nome.toLowerCase(),
  
  // Optional string: handle nulls
  email: (item: MeuTipo) => item.email?.toLowerCase() ?? '',
  
  // Data: numeric timestamp
  dataCriacao: (item: MeuTipo) => new Date(item.dataCriacao).getTime(),
  
  // Enum/status: direct value
  status: (item: MeuTipo) => item.status,
  
  // Number: direct value
  quantidade: (item: MeuTipo) => item.quantidade ?? 0,
}
```

### 4. Apply sorting

```typescript
const dadosOrdenado = useMemo(() => {
  return sortData(dadosFiltrados, sortExtractors)
}, [dadosFiltrados, sortConfig, sortData])
```

### 5. Render sortable headers

```typescript
const renderHeader = (key: keyof MeuTipo, label: string) => (
  <SortableColumn
    sortKey={key}
    currentSort={sortConfig}
    onSort={handleSort}
  >
    {label}
  </SortableColumn>
)
```

### 6. Use in CrudView

```typescript
<CrudView
  listView={{
    headers: [
      renderHeader('nome', 'Name'),
      renderHeader('email', 'Email'),
      'Actions', // Non-sortable columns omit SortableColumn
    ],
    rows: listViewRows,
  }}
/>
```

## Supported Data Types

- **Strings**: Lowercase for comparison
- **Numbers**: Direct value
- **Dates**: Timestamp (`getTime()`)
- **Booleans**: As number (true = 1, false = 0)
- **Nulls**: Handle with `??` or `||`

## Tips

1. **Performance**: Use `useMemo` to avoid unnecessary re-sorts
2. **Nulls**: Always handle null/undefined in extractors
3. **Case-insensitive**: For strings, use `.toLowerCase()`
4. **Dates**: Convert to numeric timestamp for correct ordering
5. **Non-sortable columns**: Pass a plain string, not `SortableColumn`

## Example with Complex Values

```typescript
// Sort by nested property
const sortExtractors = {
  nomeMinisterio: (item: MeuTipo) => 
    item.ministerio?.nome?.toLowerCase() ?? '',
  
  // Sort by multiple fields (concatenation)
  nomeCompleto: (item: MeuTipo) => 
    `${item.nome} ${item.sobrenome}`.toLowerCase(),
}
```
