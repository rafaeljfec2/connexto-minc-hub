# Estudo Técnico - Sistema de QR Code para Check-in

## 📋 Objetivo

Implementar um sistema de check-in via QR Code que permita aos líderes de equipe validar a presença dos servos nos cultos de forma rápida e segura.

---

## 🎯 Requisitos Funcionais

### RF-001: Geração de QR Code
- Servo deve poder gerar seu QR Code único
- QR Code deve ser vinculado ao ID do servo e data/hora
- QR Code deve ter validade temporal (ex: 1 hora)
- QR Code deve ser atualizável pelo servo

### RF-002: Leitura de QR Code
- Líder de equipe deve poder ler QR Code via câmera do dispositivo
- Sistema deve validar QR Code em tempo real
- Sistema deve registrar check-in automaticamente após validação
- Sistema deve exibir confirmação visual e sonora

### RF-003: Validações
- Verificar se QR Code é válido
- Verificar se QR Code não expirou
- Verificar se servo pertence à equipe do líder
- Verificar se servo está na escala do dia/culto
- Verificar se check-in já foi realizado

### RF-004: Check-in Manual
- Líder de equipe deve poder fazer check-in manual
- Lista de servos da equipe na escala
- Marcação individual de presença
- Campo para justificativa de ausência

---

## 🔒 Requisitos Não Funcionais

### RNF-001: Segurança
- QR Code deve ser criptografado
- QR Code deve conter assinatura digital
- Prevenção de replay attacks
- Validação server-side obrigatória

### RNF-002: Performance
- Leitura de QR Code em < 2 segundos
- Validação server-side em < 500ms
- Suporte a múltiplas leituras simultâneas

### RNF-003: Usabilidade
- Interface intuitiva para leitura
- Feedback visual claro
- Suporte a diferentes condições de iluminação
- Funcionamento offline (com sincronização posterior)

---

## 🏗️ Arquitetura Proposta

### Estrutura do QR Code

```json
{
  "servoId": "uuid-do-servo",
  "timestamp": "2024-01-15T10:30:00Z",
  "expiresAt": "2024-01-15T11:30:00Z",
  "version": "1.0",
  "signature": "hash-assinatura"
}
```

### Fluxo de Geração

1. Servo solicita geração de QR Code
2. Backend gera payload com dados do servo
3. Backend assina digitalmente o payload
4. Backend retorna QR Code codificado (Base64 ou URL)
5. Frontend exibe QR Code para o servo

### Fluxo de Leitura

1. Líder de equipe abre tela de leitura
2. Câmera é ativada
3. QR Code é escaneado
4. Payload é decodificado
5. Validações são executadas:
   - Assinatura digital
   - Expiração
   - Pertencimento à equipe
   - Escala do dia
6. Check-in é registrado
7. Confirmação é exibida

---

## 📚 Bibliotecas Recomendadas

### Frontend (React)

#### Geração de QR Code
- **qrcode.react** ou **react-qr-code**
  - Leve e performático
  - Suporte a customização
  - Bom para exibição

#### Leitura de QR Code
- **react-qr-reader** ou **@zxing/library**
  - Suporte a câmera
  - Boa performance
  - Suporte a múltiplos formatos

### Backend (NestJS)

#### Geração
- **qrcode** (Node.js)
  - Biblioteca padrão
  - Suporte a múltiplos formatos
  - Customização de tamanho/erro

#### Validação e Criptografia
- **crypto** (Node.js nativo)
  - Assinatura digital
  - Hash de validação
  - Criptografia simétrica/assimétrica

---

## 🔐 Segurança

### Assinatura Digital

```typescript
// Exemplo de assinatura
const payload = {
  servoId: 'uuid',
  timestamp: Date.now(),
  expiresAt: Date.now() + 3600000 // 1 hora
}

const signature = crypto
  .createHmac('sha256', SECRET_KEY)
  .update(JSON.stringify(payload))
  .digest('hex')

const qrCodeData = {
  ...payload,
  signature
}
```

### Validação

```typescript
// Validação no backend
function validateQRCode(qrData: QRCodeData): boolean {
  // 1. Verificar expiração
  if (Date.now() > qrData.expiresAt) {
    return false
  }

  // 2. Verificar assinatura
  const { signature, ...payload } = qrData
  const expectedSignature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(JSON.stringify(payload))
    .digest('hex')

  if (signature !== expectedSignature) {
    return false
  }

  // 3. Verificar se servo existe e está ativo
  // 4. Verificar se servo pertence à equipe do líder
  // 5. Verificar se servo está na escala do dia

  return true
}
```

### Prevenção de Replay Attacks

- Timestamp obrigatório
- Expiração curta (1 hora)
- Registro de QR Codes usados (cache Redis)
- Validação de unicidade por timestamp

---

## 📱 Implementação Mobile vs Web

### Web (Líder de Equipe)
- Leitura via câmera do computador
- Melhor para gestão em desktop
- Suporte a múltiplas câmeras

### Mobile (React Native)
- Leitura nativa via câmera
- Melhor experiência para check-in
- Funcionamento offline

---

## 🗄️ Modelo de Dados

### Tabela: check_ins

```sql
CREATE TABLE check_ins (
  id UUID PRIMARY KEY,
  servo_id UUID NOT NULL REFERENCES pessoas(id),
  schedule_id UUID NOT NULL REFERENCES schedules(id),
  checked_in_at TIMESTAMP NOT NULL,
  checked_in_by UUID NOT NULL REFERENCES usuarios(id), -- Líder que fez check-in
  method VARCHAR(20) NOT NULL, -- 'qr_code' ou 'manual'
  qr_code_data JSONB, -- Dados do QR Code usado (se método for qr_code)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_check_ins_servo ON check_ins(servo_id);
CREATE INDEX idx_check_ins_schedule ON check_ins(schedule_id);
CREATE INDEX idx_check_ins_date ON check_ins(checked_in_at);
```

### Tabela: qr_code_logs (Auditoria)

```sql
CREATE TABLE qr_code_logs (
  id UUID PRIMARY KEY,
  servo_id UUID NOT NULL,
  qr_code_data JSONB NOT NULL,
  scanned_at TIMESTAMP NOT NULL,
  scanned_by UUID NOT NULL,
  is_valid BOOLEAN NOT NULL,
  validation_error TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎨 Interface do Usuário

### Tela: Geração de QR Code (Servo)

```
┌─────────────────────────────┐
│   Meu QR Code               │
├─────────────────────────────┤
│                             │
│     [QR CODE IMAGE]          │
│                             │
│  Válido por: 1 hora         │
│  Expira em: 10:30           │
│                             │
│  [Atualizar QR Code]         │
│                             │
└─────────────────────────────┘
```

### Tela: Leitura de QR Code (Líder)

```
┌─────────────────────────────┐
│   Check-in - Equipe Manhã   │
├─────────────────────────────┤
│                             │
│   [CAMERA VIEW]             │
│                             │
│   Aponte a câmera para      │
│   o QR Code do servo        │
│                             │
│   [Alternar Câmera]        │
│   [Check-in Manual]         │
│                             │
└─────────────────────────────┘
```

### Tela: Confirmação de Check-in

```
┌─────────────────────────────┐
│   ✓ Check-in Realizado!     │
├─────────────────────────────┤
│                             │
│   João Silva                │
│   Equipe Manhã              │
│   15/01/2024 - 10:30        │
│                             │
│   [OK]                      │
│                             │
└─────────────────────────────┘
```

---

## 🔄 Fluxos de Uso

### Fluxo 1: Check-in via QR Code (Sucesso)

1. Servo gera QR Code no app
2. No dia do culto, servo apresenta QR Code
3. Líder abre app e acessa "Check-in"
4. Líder seleciona equipe e culto
5. Líder ativa câmera
6. Líder escaneia QR Code
7. Sistema valida:
   - ✅ QR Code válido
   - ✅ Não expirado
   - ✅ Servo na equipe
   - ✅ Servo na escala
8. Sistema registra check-in
9. Confirmação é exibida
10. Lista de check-ins é atualizada

### Fluxo 2: Check-in via QR Code (Erro)

1-6. (Mesmo do Fluxo 1)
7. Sistema valida:
   - ❌ QR Code expirado
8. Erro é exibido: "QR Code expirado. Peça ao servo para gerar um novo."
9. Líder pode tentar novamente ou fazer check-in manual

### Fluxo 3: Check-in Manual

1. Líder acessa "Check-in Manual"
2. Líder seleciona equipe e culto
3. Lista de servos da escala é exibida
4. Líder marca presença de cada servo
5. Para ausentes, pode adicionar justificativa
6. Líder confirma check-in
7. Sistema registra todos os check-ins
8. Confirmação é exibida

---

## 🧪 Casos de Teste

### CT-001: Geração de QR Code
- ✅ Servo pode gerar QR Code
- ✅ QR Code contém dados corretos
- ✅ QR Code tem assinatura válida
- ✅ QR Code expira após 1 hora

### CT-002: Leitura de QR Code
- ✅ Líder pode ler QR Code válido
- ✅ Check-in é registrado corretamente
- ✅ Confirmação é exibida

### CT-003: Validações
- ✅ QR Code expirado é rejeitado
- ✅ QR Code inválido é rejeitado
- ✅ Servo de outra equipe é rejeitado
- ✅ Servo não na escala é rejeitado
- ✅ Check-in duplicado é rejeitado

### CT-004: Check-in Manual
- ✅ Líder pode fazer check-in manual
- ✅ Lista mostra apenas servos da equipe
- ✅ Justificativa de ausência é salva

---

## 📊 Métricas

### Métricas a Acompanhar

- Taxa de check-in via QR Code vs Manual
- Tempo médio de check-in
- Taxa de erro de leitura
- Taxa de QR Codes expirados
- Satisfação dos usuários

---

## 🚀 Roadmap de Implementação

### Fase 1: Estudo e Prototipagem (1 semana)
- [ ] Pesquisa de bibliotecas
- [ ] Protótipo de geração
- [ ] Protótipo de leitura
- [ ] Testes de segurança

### Fase 2: Backend (2 semanas)
- [ ] Endpoint de geração
- [ ] Endpoint de validação
- [ ] Modelo de dados
- [ ] Testes unitários

### Fase 3: Frontend Web (2 semanas)
- [ ] Tela de geração (servo)
- [ ] Tela de leitura (líder)
- [ ] Integração com câmera
- [ ] Testes E2E

### Fase 4: Mobile (2 semanas)
- [ ] Adaptação para React Native
- [ ] Câmera nativa
- [ ] Testes em dispositivos

### Fase 5: Refinamentos (1 semana)
- [ ] Melhorias de UX
- [ ] Performance
- [ ] Documentação

---

## 📝 Notas Técnicas

### Formato do QR Code

- **Tipo**: QR Code (não Data Matrix)
- **Nível de correção de erro**: M (15%)
- **Tamanho**: 256x256 pixels (mínimo)
- **Formato de dados**: JSON compactado + Base64

### Performance

- Geração: < 100ms
- Leitura: < 2s
- Validação: < 500ms
- Cache de QR Codes válidos: 5 minutos

### Offline

- QR Code pode ser gerado offline
- Check-in pode ser feito offline (com sincronização)
- Validação completa requer conexão

---

## 🔗 Referências

- [QR Code Specification](https://www.qrcode.com/en/)
- [ZXing Library](https://github.com/zxing/zxing)
- [Node.js Crypto](https://nodejs.org/api/crypto.html)
- [React QR Code](https://www.npmjs.com/package/qrcode.react)

---

**Última atualização**: 2024-01-XX
**Versão**: 1.0.0
