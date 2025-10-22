# 📱 Push Notifications - Guia de Implementação

## Visão Geral

Sistema completo de notificações push para lembrar usuários sobre pagamentos pendentes e vencidos no app Nanquim Locações.

## 🎯 Funcionalidades Implementadas

### 1. **Serviço de Notificações** (`notificationService.ts`)

- Registro de dispositivos para push notifications
- Gerenciamento de tokens Expo Push
- Notificações locais e remotas
- Listeners para interação com notificações
- Controle de badges e canais de notificação

### 2. **Admin Service** (`adminService.ts`)

- `notifyOverdueUsers()` - Notifica usuários com pagamentos vencidos
- `notifyPendingPayments(days)` - Notifica usuários com pagamentos próximos do vencimento
- `sendUserNotification(userId, title, message)` - Envia notificação para usuário específico
- `sendBroadcastNotification(title, message)` - Envia notificação para todos os usuários
- `registerPushToken(userId, token)` - Registra token push no servidor

### 3. **Admin Dashboard**

- Botão "Notificar Pagamentos Vencidos" (vermelho)
- Botão "Lembrar Pagamentos Pendentes" (laranja)
- Confirmação antes de enviar notificações
- Feedback visual durante o envio

## 📦 Dependências

```json
{
  "expo-notifications": "~0.31.4",
  "expo-device": "~7.1.4",
  "expo-constants": "~17.1.7"
}
```

## ⚙️ Configuração

### 1. **Instalar Dependências**

```bash
npm install expo-notifications expo-device
```

ou

```bash
npx expo install expo-notifications expo-device
```

### 2. **Rebuild do App**

Após adicionar as dependências, é necessário fazer rebuild:

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

### 3. **Configurações Android (FCM)**

Para Android, você precisa:

1. Criar projeto no [Firebase Console](https://console.firebase.google.com/)
2. Adicionar app Android com package name: `com.nanquim.locacoes`
3. Baixar `google-services.json`
4. Colocar o arquivo na raiz do projeto
5. O plugin já está configurado em `app.json`

### 4. **Configurações iOS (APNs)**

Para iOS em produção:

1. Configurar APNs no [Apple Developer Portal](https://developer.apple.com/)
2. Criar Push Notification certificate
3. Upload do certificado no [Expo Dashboard](https://expo.dev/)
4. As permissões já estão configuradas em `app.json`

## 🚀 Como Usar

### **No Admin Dashboard**

#### 1. Notificar Pagamentos Vencidos

```typescript
// Envia notificação para todos os usuários com pagamentos vencidos
await adminService.notifyOverdueUsers();
```

Mensagem enviada:

- **Título**: "Pagamento Vencido"
- **Corpo**: "Você tem pagamentos em atraso. Regularize sua situação."

#### 2. Lembrar Pagamentos Pendentes

```typescript
// Envia lembrete para usuários com pagamentos vencendo em 3 dias
await adminService.notifyPendingPayments(3);
```

Mensagem enviada:

- **Título**: "Lembrete de Pagamento"
- **Corpo**: "Seu pagamento vence em breve. Não esqueça!"

#### 3. Notificação Personalizada

```typescript
await adminService.sendUserNotification(
  'user_id',
  'Título Personalizado',
  'Mensagem personalizada',
  { extra_data: 'value' }
);
```

### **Registro de Token (Lado do Cliente)**

```typescript
import { notificationService } from './services/notificationService';
import { adminService } from './services/adminService';

// Registrar para notificações ao fazer login
const registerForNotifications = async (userId: string) => {
  const token = await notificationService.registerForPushNotifications();

  if (token) {
    // Enviar token para o servidor
    await adminService.registerPushToken(userId, token);
  }
};
```

### **Listeners de Notificação**

```typescript
import { notificationService } from './services/notificationService';

// Listener para notificações recebidas
const subscription1 = notificationService.addNotificationReceivedListener(notification => {
  console.log('📬 Notificação recebida:', notification);
});

// Listener para quando usuário toca na notificação
const subscription2 = notificationService.addNotificationResponseListener(response => {
  console.log('👆 Usuário tocou na notificação:', response);
  const data = response.notification.request.content.data;

  // Navegar para tela específica
  if (data.type === 'payment_reminder') {
    navigation.navigate('PaymentHistory');
  }
});

// Remover listeners ao desmontar
return () => {
  notificationService.removeNotificationSubscription(subscription1);
  notificationService.removeNotificationSubscription(subscription2);
};
```

## 🔧 Backend (Endpoints Necessários)

O backend precisa implementar os seguintes endpoints:

### 1. Registrar Push Token

```
POST /api/v1/admin/users/register-push-token
Body: {
  "user_id": "string",
  "push_token": "ExponentPushToken[xxxxxx]"
}
```

### 2. Notificar Pagamentos Vencidos

```
POST /api/v1/admin/notifications/overdue-payments
Response: {
  "notified_count": 5
}
```

### 3. Notificar Pagamentos Pendentes

```
POST /api/v1/admin/notifications/pending-payments
Body: {
  "days_before_due": 3
}
Response: {
  "notified_count": 10
}
```

### 4. Enviar Notificação Individual

```
POST /api/v1/admin/notifications/send/:userId
Body: {
  "title": "string",
  "message": "string",
  "data": {}
}
```

### 5. Broadcast

```
POST /api/v1/admin/notifications/broadcast
Body: {
  "title": "string",
  "message": "string",
  "data": {}
}
Response: {
  "sent_count": 50
}
```

## 📤 Enviar Notificações do Backend

O backend deve usar o [Expo Push Notification Service](https://docs.expo.dev/push-notifications/sending-notifications/):

```javascript
// Exemplo Node.js
const { Expo } = require('expo-server-sdk');
const expo = new Expo();

async function sendPushNotification(pushToken, title, body, data) {
  const message = {
    to: pushToken,
    sound: 'default',
    title: title,
    body: body,
    data: data,
    priority: 'high',
    channelId: 'default',
  };

  try {
    const ticket = await expo.sendPushNotificationsAsync([message]);
    console.log('✅ Notificação enviada:', ticket);
  } catch (error) {
    console.error('❌ Erro ao enviar notificação:', error);
  }
}
```

## 🧪 Testar Notificações

### Método 1: Usando Expo Push Tool

1. Acesse: https://expo.dev/notifications
2. Cole o Expo Push Token
3. Envie notificação de teste

### Método 2: Notificação Local

```typescript
await notificationService.sendImmediateNotification('Teste', 'Esta é uma notificação de teste', {
  type: 'test',
});
```

## ⚠️ Limitações e Considerações

1. **Simulador iOS**: Push notifications não funcionam no simulador
2. **Emulador Android**: Precisa de Google Play Services
3. **Rate Limiting**: Expo limita o número de notificações por segundo
4. **TTL**: Notificações expiram após 30 dias
5. **Bateria**: Muitas notificações podem afetar a bateria

## 📊 Melhores Práticas

1. ✅ **Horário Adequado**: Evite enviar notificações à noite
2. ✅ **Frequência**: Não envie muitas notificações
3. ✅ **Relevância**: Apenas notifique informações importantes
4. ✅ **Personalização**: Use o nome do usuário quando possível
5. ✅ **Deep Links**: Permita navegação direta ao tocar
6. ✅ **Opt-out**: Permita que usuários desabilitem notificações

## 🔐 Segurança

- Push tokens são únicos por dispositivo
- Tokens podem expirar e precisam ser renovados
- Não envie informações sensíveis no corpo da notificação
- Use dados criptografados quando necessário
- Valide permissões no backend antes de enviar

## 📱 Permissões

### iOS

```xml
<key>NSUserNotificationsUsageDescription</key>
<string>Este app envia notificações sobre lembretes de pagamento</string>
```

### Android

```xml
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.VIBRATE" />
```

## 🐛 Troubleshooting

### Push Token não está sendo gerado

- Verifique se está rodando em dispositivo físico
- Confirme que as permissões foram concedidas
- Rebuild do app após adicionar dependências

### Notificações não aparecem

- Verifique configuração do canal (Android)
- Confirme que o app não está em primeiro plano
- Verifique se o token está registrado no servidor

### Erro ao enviar do backend

- Valide formato do push token
- Verifique credenciais do Expo
- Confirme que não ultrapassou rate limit

## 📚 Recursos Adicionais

- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Expo Push Notifications Guide](https://docs.expo.dev/push-notifications/overview/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Apple Push Notification Service](https://developer.apple.com/documentation/usernotifications)

## 🎉 Próximos Passos

1. ✅ Implementar agendamento automático de notificações
2. ✅ Adicionar templates de mensagens personalizadas
3. ✅ Criar dashboard de analytics de notificações
4. ✅ Implementar notificações silenciosas para sync
5. ✅ Adicionar notificações ricas com imagens e ações

---

**Desenvolvido por:** Nanquim Locações  
**Última atualização:** 2025-01-15
