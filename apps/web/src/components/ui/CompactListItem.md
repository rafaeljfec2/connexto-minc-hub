# CompactListItem Component

Componente padrão reutilizável para criar listas compactas e consistentes em todo o aplicativo.

## Características

- ✅ Layout compacto e eficiente
- ✅ Suporte a ícones personalizados
- ✅ Badges com variantes de cores
- ✅ Metadata secundária
- ✅ Menu de três pontos opcional
- ✅ Totalmente acessível
- ✅ Suporte a dark mode

## Props

| Prop          | Tipo        | Descrição                              |
| ------------- | ----------- | -------------------------------------- |
| `icon`        | `ReactNode` | Ícone a ser exibido (opcional)         |
| `iconColor`   | `string`    | Classes CSS para cor de fundo do ícone |
| `title`       | `string`    | Título principal (obrigatório)         |
| `subtitle`    | `string`    | Subtítulo/descrição (opcional)         |
| `badge`       | `object`    | Badge com texto e variante (opcional)  |
| `metadata`    | `string`    | Informação adicional (opcional)        |
| `onClick`     | `function`  | Callback ao clicar no item             |
| `onMenuClick` | `function`  | Callback ao clicar no menu             |
| `className`   | `string`    | Classes CSS adicionais                 |

## Badge Variants

- `success` - Verde (ex: status ativo)
- `warning` - Amarelo (ex: pendente)
- `error` - Vermelho (ex: erro)
- `info` - Azul (ex: informação)
- `default` - Cinza (padrão)

## Exemplos de Uso

### Exemplo Básico

\`\`\`tsx
import { CompactListItem } from '@/components/ui/CompactListItem'

<CompactListItem
icon={<UserIcon />}
title="João Silva"
subtitle="Desenvolvedor"
onClick={() => console.log('Clicked')}
/>
\`\`\`

### Com Badge e Metadata

\`\`\`tsx
<CompactListItem
icon={<TeamIcon />}
title="Equipe de Louvor"
subtitle="BOAS VINDAS"
metadata="15 membros"
badge={{ text: 'Ativa', variant: 'success' }}
onClick={() => navigate('/team/123')}
onMenuClick={() => openMenu()}
/>
\`\`\`

### Com Ícone Customizado

\`\`\`tsx
<CompactListItem
icon={
<svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
<path d="..." />
</svg>
}
iconColor="bg-blue-100 dark:bg-blue-900/20"
title="Ministério de Música"
subtitle="Igreja Central"
onClick={() => {}}
/>
\`\`\`

### Lista Completa

\`\`\`tsx

<div className="bg-white dark:bg-dark-900 rounded-lg overflow-hidden border border-dark-200 dark:border-dark-800">
  {items.map(item => (
    <CompactListItem
      key={item.id}
      icon={<item.Icon />}
      title={item.name}
      subtitle={item.description}
      metadata={item.count}
      badge={item.isActive ? { text: 'Ativa', variant: 'success' } : undefined}
      onClick={() => handleClick(item)}
      onMenuClick={() => handleMenu(item)}
    />
  ))}
</div>
\`\`\`

## Casos de Uso

Este componente é ideal para:

- ✅ Listas de equipes
- ✅ Listas de usuários
- ✅ Listas de ministérios
- ✅ Listas de eventos
- ✅ Listas de mensagens
- ✅ Qualquer lista que precise ser compacta e escalável

## Acessibilidade

- Usa elemento `<button>` nativo para navegação por teclado
- Suporte completo a leitores de tela
- Estados de hover e focus visíveis
- Aria-labels apropriados

## Performance

- Renderização otimizada
- Sem carregamento desnecessário de dados
- Ideal para listas longas (100+ itens)
- Layout eficiente que economiza espaço
