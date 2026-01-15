# Guia de Ordenação para Grid Customizado

Este documento explica como implementar ordenação de colunas no grid customizado usando `useSort` e `SortableColumn`.

## Componentes Necessários

1. **`useSort`** - Hook para gerenciar estado de ordenação
2. **`SortableColumn`** - Componente para renderizar cabeçalhos clicáveis
3. **`sortData`** - Função para ordenar os dados

## Exemplo Completo

```typescript
import { useSort, SortConfig } from '@/hooks/useSort'
import { SortableColumn } from '@/components/ui/SortableColumn'
import { CrudView } from '@/components/crud/CrudView'
import { TableRow, TableCell, TableHead } from '@/components/ui/Table'

// 1. Definir o tipo dos dados
interface MeuItem {
  id: string
  nome: string
  email: string
  dataCriacao: string
  status: 'ativo' | 'inativo'
}

export function MinhaPagina() {
  const [items, setItems] = useState<MeuItem[]>([])
  
  // 2. Inicializar o hook de ordenação
  const { sortConfig, handleSort, sortData } = useSort<MeuItem>({
    defaultKey: 'nome',
    defaultDirection: 'asc',
  })

  // 3. Criar função de extração de valores para ordenação
  const sortExtractors = {
    nome: (item: MeuItem) => item.nome.toLowerCase(),
    email: (item: MeuItem) => item.email?.toLowerCase() ?? '',
    dataCriacao: (item: MeuItem) => new Date(item.dataCriacao).getTime(),
    status: (item: MeuItem) => item.status,
  }

  // 4. Aplicar ordenação aos dados filtrados
  const filteredAndSortedItems = useMemo(() => {
    const filtered = items.filter(/* sua lógica de filtro */)
    return sortData(filtered, sortExtractors)
  }, [items, sortConfig, sortData])

  // 5. Criar função helper para renderizar cabeçalhos ordenáveis
  const renderHeader = (key: keyof MeuItem, label: string) => (
    <SortableColumn
      sortKey={key}
      currentSort={sortConfig}
      onSort={handleSort}
    >
      {label}
    </SortableColumn>
  )

  // 6. Grid View (cards) - não precisa de ordenação visual, mas os dados já estão ordenados
  const gridView = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredAndSortedItems.map(item => (
        <MeuCard key={item.id} item={item} />
      ))}
    </div>
  )

  // 7. List View (tabela) - usar SortableColumn nos cabeçalhos
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
          renderHeader('nome', 'Nome'),
          renderHeader('email', 'Email'),
          renderHeader('dataCriacao', 'Data de Criação'),
          renderHeader('status', 'Status'),
          'Ações', // Coluna sem ordenação
        ],
        rows: listViewRows,
      }}
    />
  )
}
```

## Passo a Passo

### 1. Importar dependências

```typescript
import { useSort, SortConfig } from '@/hooks/useSort'
import { SortableColumn } from '@/components/ui/SortableColumn'
```

### 2. Inicializar o hook

```typescript
const { sortConfig, handleSort, sortData } = useSort<MeuTipo>({
  defaultKey: 'campoPadrao', // Campo inicial para ordenação
  defaultDirection: 'asc', // Direção inicial
})
```

### 3. Criar extractors de ordenação

Os extractors definem como extrair valores de cada campo para comparação:

```typescript
const sortExtractors = {
  // String: converter para lowercase para comparação case-insensitive
  nome: (item: MeuTipo) => item.nome.toLowerCase(),
  
  // String opcional: tratar valores nulos
  email: (item: MeuTipo) => item.email?.toLowerCase() ?? '',
  
  // Data: converter para timestamp numérico
  dataCriacao: (item: MeuTipo) => new Date(item.dataCriacao).getTime(),
  
  // Enum/Status: usar valor direto
  status: (item: MeuTipo) => item.status,
  
  // Número: usar valor direto
  quantidade: (item: MeuTipo) => item.quantidade ?? 0,
}
```

### 4. Aplicar ordenação

```typescript
const dadosOrdenados = useMemo(() => {
  return sortData(dadosFiltrados, sortExtractors)
}, [dadosFiltrados, sortConfig, sortData])
```

### 5. Renderizar cabeçalhos ordenáveis

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

### 6. Usar no CrudView

```typescript
<CrudView
  listView={{
    headers: [
      renderHeader('nome', 'Nome'),
      renderHeader('email', 'Email'),
      'Ações', // Colunas sem ordenação não usam SortableColumn
    ],
    rows: listViewRows,
  }}
/>
```

## Tipos de Dados Suportados

- **Strings**: Converter para lowercase
- **Números**: Usar valor direto
- **Datas**: Converter para timestamp (`getTime()`)
- **Booleanos**: Converter para número (true = 1, false = 0)
- **Valores nulos**: Tratar com `??` ou `||`

## Dicas

1. **Performance**: Use `useMemo` para evitar reordenações desnecessárias
2. **Valores nulos**: Sempre trate valores nulos/undefined nos extractors
3. **Case-insensitive**: Para strings, sempre use `.toLowerCase()`
4. **Datas**: Converta para timestamp numérico para comparação correta
5. **Colunas sem ordenação**: Não use `SortableColumn`, apenas passe a string diretamente

## Exemplo com Valores Complexos

```typescript
// Ordenar por propriedade aninhada
const sortExtractors = {
  nomeMinisterio: (item: MeuTipo) => 
    item.ministerio?.nome?.toLowerCase() ?? '',
  
  // Ordenar por múltiplos campos (concatenação)
  nomeCompleto: (item: MeuTipo) => 
    `${item.nome} ${item.sobrenome}`.toLowerCase(),
}
```
