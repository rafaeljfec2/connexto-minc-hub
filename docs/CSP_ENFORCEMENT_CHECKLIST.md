# Checklist para Ativar CSP Enforcement

Use este checklist antes de mudar de `Report-Only` para `Enforcement`.

## Pré-requisitos

- [ ] CSP está em modo Report-Only há pelo menos 1 semana
- [ ] Todos os relatórios CSP foram analisados
- [ ] Violações legítimas foram identificadas e resolvidas
- [ ] Aplicação funciona corretamente sem erros no console
- [ ] Equipe foi notificada sobre a mudança

## Verificações Técnicas

### Frontend

- [ ] CSP está configurado corretamente no `index.html`
- [ ] Trusted Types está inicializado antes do React
- [ ] DOMPurify está sendo usado para sanitização
- [ ] URLs de recursos externos estão na whitelist CSP
- [ ] Não há uso de `eval()` ou `Function()` no código
- [ ] Não há scripts inline no HTML
- [ ] Não há estilos inline críticos

### Backend

- [ ] Endpoint `/minc-teams/v1/security/csp-report` está funcionando
- [ ] Logs estão sendo gerados corretamente
- [ ] Violações críticas estão sendo detectadas
- [ ] Sistema de alertas está configurado (se aplicável)

## Testes

- [ ] Testes E2E passam com CSP Report-Only
- [ ] Testes manuais em todos os navegadores principais
- [ ] Testes em dispositivos móveis
- [ ] Testes de funcionalidades críticas:
  - [ ] Login/Autenticação
  - [ ] Upload de arquivos
  - [ ] Chat/Mensagens
  - [ ] Formulários
  - [ ] Navegação entre páginas

## Monitoramento

- [ ] Sistema de monitoramento configurado
- [ ] Alertas configurados para violações críticas
- [ ] Dashboard de violações CSP (se disponível)
- [ ] Processo de rollback definido

## Plano de Ativação

### Fase 1: Preparação (1-2 dias antes)

- [ ] Comunicar equipe sobre a mudança
- [ ] Revisar política CSP final
- [ ] Preparar rollback se necessário

### Fase 2: Ativação Gradual

**Opção A: Por Ambiente**

- [ ] Ativar em desenvolvimento primeiro
- [ ] Monitorar por 24h
- [ ] Ativar em staging
- [ ] Monitorar por 48h
- [ ] Ativar em produção

**Opção B: Por Percentual de Usuários**

- [ ] Ativar para 10% dos usuários
- [ ] Monitorar por 24h
- [ ] Aumentar para 50%
- [ ] Monitorar por 24h
- [ ] Ativar para 100%

### Fase 3: Pós-Ativação

- [ ] Monitorar logs intensivamente nas primeiras 24h
- [ ] Verificar métricas de erro
- [ ] Coletar feedback dos usuários
- [ ] Ajustar política se necessário

## Rollback

Se problemas ocorrerem:

1. **Imediato**: Reverter para Report-Only
2. **Investigar**: Analisar logs e relatórios CSP
3. **Corrigir**: Ajustar política ou código
4. **Retestar**: Validar antes de tentar novamente

## Comandos Úteis

### Verificar CSP Atual

```bash
# No navegador console
document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content
```

### Testar Violação

```javascript
// No console do navegador
import { triggerCspViolation } from '@/utils/test-csp-violation'
triggerCspViolation('script-src', 'inline')
```

### Verificar Relatórios

```bash
# Ver logs da API
cd apps/api
pnpm start:dev | grep "CSP Violation"
```

## Contatos de Emergência

- **Equipe de Desenvolvimento**: [contatos]
- **Equipe de Segurança**: [contatos]
- **DevOps**: [contatos]

## Notas

- Mantenha este checklist atualizado
- Documente qualquer problema encontrado
- Revise periodicamente a política CSP
