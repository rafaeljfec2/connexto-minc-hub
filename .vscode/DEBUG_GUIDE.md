# Guia de Debug no VSCode

Este documento explica como usar as configurações de debug do VSCode para o projeto MINC Hub.

## 📋 Pré-requisitos

- VSCode instalado
- Extensões recomendadas:
  - **Debugger for Chrome** (para debug web no Chrome)
  - **Debugger for Microsoft Edge** (para debug web no Edge)

## 🎯 Configurações Disponíveis

### 1. Debug API (NestJS)

**Nome:** `Debug API (NestJS)`

Inicia a API em modo debug usando o nodemon. Esta configuração:

- Executa `pnpm run dev` na pasta `apps/api`
- Habilita source maps para debug do TypeScript
- Reinicia automaticamente quando há mudanças no código
- Usa o terminal integrado do VSCode

**Como usar:**

1. Pressione `F5` ou vá em "Run and Debug" (Ctrl+Shift+D)
2. Selecione "Debug API (NestJS)" no dropdown
3. Clique no botão play verde ou pressione `F5`
4. Coloque breakpoints nos arquivos `.ts` da API
5. Faça requisições para a API e o debugger vai parar nos breakpoints

### 2. Debug API (Attach)

**Nome:** `Debug API (Attach)`

Conecta o debugger a uma instância da API já em execução.

**Como usar:**

1. Primeiro, inicie a API manualmente com `pnpm run dev` na pasta `apps/api`
2. No VSCode, selecione "Debug API (Attach)"
3. Pressione `F5`
4. O debugger vai se conectar à porta 9229

**Quando usar:** Útil quando você já tem a API rodando em um terminal e quer apenas conectar o debugger.

### 3. Debug Web (Chrome)

**Nome:** `Debug Web (Chrome)`

Abre o Chrome com o debugger conectado ao frontend.

**Como usar:**

1. Certifique-se de que o dev server está rodando (`pnpm run dev` em `apps/web`)
2. Selecione "Debug Web (Chrome)" no VSCode
3. Pressione `F5`
4. O Chrome vai abrir em `http://localhost:5173`
5. Coloque breakpoints nos arquivos `.ts` e `.tsx` do frontend
6. Interaja com a aplicação e o debugger vai parar nos breakpoints

**Recursos:**

- Debug de código TypeScript/React
- Inspeção de variáveis
- Console integrado
- Source maps habilitados

### 4. Debug Web (Edge)

**Nome:** `Debug Web (Edge)`

Igual ao Debug Web (Chrome), mas usa o Microsoft Edge.

**Como usar:** Mesmo processo do Chrome, mas abre no Edge.

### 5. Debug Full Stack (API + Web Chrome)

**Nome:** `Debug Full Stack (API + Web Chrome)`

Inicia **simultaneamente** a API e o frontend no Chrome.

**Como usar:**

1. Selecione "Debug Full Stack (API + Web Chrome)"
2. Pressione `F5`
3. Ambos os debuggers vão iniciar
4. Você pode debugar tanto o backend quanto o frontend ao mesmo tempo

**Recursos:**

- Debug full-stack em uma única sessão
- Breakpoints funcionam em ambos API e Web
- Perfeito para debugar fluxos completos (ex: requisição do frontend → processamento na API → resposta)

### 6. Debug Full Stack (API + Web Edge)

**Nome:** `Debug Full Stack (API + Web Edge)`

Igual ao anterior, mas usa o Edge ao invés do Chrome.

## 🔧 Configuração do Nodemon

O arquivo `apps/api/nodemon.json` foi configurado para suportar debug:

```json
{
  "exec": "node --inspect=0.0.0.0:9229 -r ts-node/register -r tsconfig-paths/register src/main.ts"
}
```

A flag `--inspect=0.0.0.0:9229` habilita o debugger na porta 9229.

## 💡 Dicas de Uso

### Breakpoints

- Clique na margem esquerda do editor (ao lado dos números de linha) para adicionar breakpoints
- Breakpoints condicionais: clique com botão direito no breakpoint → "Edit Breakpoint"
- Logpoints: adicione logs sem modificar o código

### Debug Console

- Use o Debug Console (Ctrl+Shift+Y) para executar código no contexto atual
- Avalie variáveis, execute funções, etc.

### Watch

- Adicione expressões na aba "Watch" para monitorar valores em tempo real
- Útil para acompanhar mudanças em objetos complexos

### Call Stack

- Veja a pilha de chamadas na aba "Call Stack"
- Navegue entre diferentes frames para inspecionar o contexto

### Variables

- Inspecione todas as variáveis no escopo atual
- Expanda objetos para ver suas propriedades

## 🐛 Troubleshooting

### API não conecta ao debugger

- Verifique se a porta 9229 não está em uso
- Reinicie o VSCode
- Verifique se o nodemon está configurado corretamente

### Web não abre no navegador

- Certifique-se de que o dev server está rodando em `http://localhost:5173`
- Verifique se a porta 5173 está livre
- Instale a extensão "Debugger for Chrome" ou "Debugger for Microsoft Edge"

### Breakpoints não funcionam

- Verifique se os source maps estão habilitados
- Certifique-se de que o código está compilado
- Tente recarregar a janela do VSCode (Ctrl+Shift+P → "Reload Window")

### Debug Full Stack não inicia

- Verifique se ambas as aplicações podem iniciar individualmente
- Certifique-se de que não há conflitos de porta
- Tente iniciar cada debugger separadamente primeiro

## 📚 Recursos Adicionais

- [VSCode Debugging Guide](https://code.visualstudio.com/docs/editor/debugging)
- [Node.js Debugging](https://code.visualstudio.com/docs/nodejs/nodejs-debugging)
- [Browser Debugging](https://code.visualstudio.com/docs/nodejs/browser-debugging)
