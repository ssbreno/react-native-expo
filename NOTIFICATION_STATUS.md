# 📱 Status: Notificações Push - DESABILITADAS

## 🔴 Estado Atual: DESABILITADO

As notificações push estão **temporariamente desabilitadas** mas toda a estrutura foi criada e está pronta para ser ativada quando necessário.

## 📦 O Que Foi Mantido

### **Código Fonte (Preservado)**

- ✅ `/src/services/notificationService.ts` - Serviço completo
- ✅ `/src/services/adminService.ts` - Métodos de notificação
- ✅ `/src/hooks/useNotifications.ts` - Hook React
- ✅ `/src/screens/admin/AdminDashboardScreen.tsx` - Botões comentados

### **Documentação (Disponível)**

- ✅ `PUSH_NOTIFICATIONS.md` - Guia completo
- ✅ `INSTALL_NOTIFICATIONS.md` - Guia de instalação
- ✅ `NOTIFICATION_USAGE_EXAMPLE.tsx` - 12 exemplos
- ✅ `NOTIFICATION_CUSTOMIZATION.md` - Personalização
- ✅ `NOTIFICATION_STATUS.md` - Este arquivo

## ⚙️ O Que Foi Desabilitado

### **Configurações**

- ❌ Plugin `expo-notifications` removido de `app.json`
- ❌ Flag `EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS` = false
- ❌ Dependências `expo-notifications` e `expo-device` removidas
- ❌ Botões de notificação comentados no Admin Dashboard

### **Interface**

- ❌ Botões "Notificar Pagamentos Vencidos" - Oculto
- ❌ Botões "Lembrar Pagamentos Pendentes" - Oculto

## 🚀 Como Reativar (Quando Necessário)

### **Passo 1: Instalar Dependências**

```bash
npx expo install expo-notifications expo-device
```

### **Passo 2: Atualizar app.json**

Adicione o plugin:

```json
{
  "plugins": [
    "expo-secure-store",
    [
      "expo-notifications",
      {
        "mode": "production"
      }
    ]
  ]
}
```

Altere a flag:

```json
{
  "extra": {
    "EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS": "true"
  }
}
```

### **Passo 3: Descomentar Botões**

Em `/src/screens/admin/AdminDashboardScreen.tsx`, **descomentar** as linhas 598-626:

```typescript
// Remover /* e */ do bloco de código
<Button
  mode="contained"
  onPress={handleNotifyOverdueUsers}
  disabled={notifyingOverdue}
  style={[styles.actionButton, { backgroundColor: '#F44336' }]}
  icon="notifications-outline"
  buttonColor="#F44336"
>
  {notifyingOverdue ? 'Enviando...' : 'Notificar Pagamentos Vencidos'}
</Button>

<Button
  mode="contained"
  onPress={handleNotifyPendingPayments}
  disabled={notifyingPending}
  style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
  icon="alarm-outline"
  buttonColor="#FF9800"
>
  {notifyingPending ? 'Enviando...' : 'Lembrar Pagamentos Pendentes'}
</Button>
```

### **Passo 4: Configurar Backend**

O backend precisa implementar os endpoints:

- `POST /api/v1/admin/users/register-push-token`
- `POST /api/v1/admin/notifications/overdue-payments`
- `POST /api/v1/admin/notifications/pending-payments`
- `POST /api/v1/admin/notifications/send/:userId`
- `POST /api/v1/admin/notifications/broadcast`

Ver `PUSH_NOTIFICATIONS.md` seção "Backend (Endpoints Necessários)"

### **Passo 5: Configurar Firebase (Android)**

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Adicione app Android: `com.nanquim.locacoes`
3. Baixe `google-services.json`
4. Coloque na raiz do projeto
5. Configure no `app.json`:

```json
{
  "android": {
    "googleServicesFile": "./google-services.json"
  }
}
```

### **Passo 6: Rebuild do App**

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

### **Passo 7: Testar**

```bash
# Iniciar app
npx expo start

# Verificar se token é gerado
# Ver logs no console
```

## 📝 Checklist de Reativação

Quando for reativar, marque cada item:

- [ ] Instalar dependências (`expo-notifications`, `expo-device`)
- [ ] Adicionar plugin no `app.json`
- [ ] Alterar flag para `"true"` no `app.json`
- [ ] Descomentar botões no `AdminDashboardScreen.tsx`
- [ ] Implementar endpoints no backend
- [ ] Configurar Firebase (Android)
- [ ] Configurar APNs (iOS - produção)
- [ ] Fazer rebuild do app
- [ ] Testar registro de token
- [ ] Testar envio de notificações
- [ ] Testar notificações em background
- [ ] Testar deep links (opcional)

## 🎯 Por Que Foi Desabilitado?

Motivos comuns para desabilitar temporariamente:

- ⏳ Backend ainda não implementou endpoints
- 🔧 Configuração de Firebase/APNs pendente
- 🧪 Foco em outras funcionalidades primeiro
- 📱 Testes em dispositivos físicos necessários

## 💡 Vantagens de Desabilitar Temporariamente

1. **App funciona normalmente** sem erros
2. **Código preservado** para reativação rápida
3. **Sem dependências desnecessárias** no build
4. **Build mais rápido** sem módulos nativos extras
5. **Foco no essencial** primeiro

## 📚 Recursos Disponíveis

Toda a documentação está pronta para quando reativar:

1. **Guia Técnico**: `PUSH_NOTIFICATIONS.md`
2. **Instalação Rápida**: `INSTALL_NOTIFICATIONS.md`
3. **Exemplos de Código**: `NOTIFICATION_USAGE_EXAMPLE.tsx`
4. **Personalização**: `NOTIFICATION_CUSTOMIZATION.md`
5. **Status**: `NOTIFICATION_STATUS.md` (este arquivo)

## ⚠️ Importante

**Não delete os arquivos de serviços e hooks!**

Mantidos para reativação futura:

- `/src/services/notificationService.ts`
- `/src/services/adminService.ts` (métodos de notificação)
- `/src/hooks/useNotifications.ts`

Esses arquivos não causam problemas mesmo desabilitados, pois não são importados no código ativo.

## 🔄 Histórico

- **2025-01-15**: Sistema de notificações implementado
- **2025-01-15**: Sistema desabilitado temporariamente
- **Próximo**: Reativar quando backend estiver pronto

---

**Status**: 🔴 Desabilitado  
**Código**: ✅ Preservado  
**Pronto para**: 🚀 Reativação rápida quando necessário
