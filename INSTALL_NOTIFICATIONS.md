# 🚀 Guia Rápido de Instalação - Push Notifications

## ⚡ Instalação em 5 Passos

### 1️⃣ Instalar Dependências

```bash
npx expo install expo-notifications expo-device
```

### 2️⃣ Rebuild do App

**IMPORTANTE**: É necessário fazer rebuild após adicionar as dependências.

```bash
# Para iOS
npx expo run:ios

# Para Android
npx expo run:android

# Ou rebuild para ambos
npx expo prebuild --clean
```

### 3️⃣ Configurar Firebase (Android)

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Crie ou selecione seu projeto
3. Adicione um app Android com package name: `com.nanquim.locacoes`
4. Baixe o arquivo `google-services.json`
5. Coloque o arquivo na **raiz do projeto** (mesmo nível do `app.json`)

### 4️⃣ Configurar Apple Developer (iOS - Produção)

Para notificações em produção no iOS:

1. Acesse [Apple Developer Portal](https://developer.apple.com/account/)
2. Vá em **Certificates, Identifiers & Profiles**
3. Crie um **APNs Key** para push notifications
4. Baixe a chave `.p8`
5. Upload no [Expo Dashboard](https://expo.dev/) em **Credentials**

**Nota**: Em desenvolvimento, o Expo Go já suporta notificações.

### 5️⃣ Testar

```bash
# Iniciar app
npx expo start

# No dispositivo físico:
# - Pressione "i" para iOS
# - Pressione "a" para Android

# Ou use Expo Go
# Escaneie o QR code com a câmera (iOS) ou Expo Go app (Android)
```

## ✅ Verificação da Instalação

### Verificar se as dependências foram instaladas:

```bash
# Ver package.json
cat package.json | grep "expo-notifications"
cat package.json | grep "expo-device"
```

Deve aparecer:

```json
"expo-notifications": "~0.31.4",
"expo-device": "~7.1.4"
```

### Verificar configuração no app.json:

```bash
# Ver plugins
cat app.json | grep -A 10 "plugins"
```

Deve conter:

```json
"plugins": [
  "expo-secure-store",
  [
    "expo-notifications",
    {
      "mode": "production"
    }
  ]
]
```

## 🧪 Teste Rápido

Adicione este código na sua tela principal para testar:

```typescript
import { useEffect } from 'react';
import { useNotifications } from './src/hooks/useNotifications';
import { Alert } from 'react-native';

export function HomeScreen() {
  const { expoPushToken } = useNotifications({
    onNotificationReceived: notification => {
      Alert.alert('Notificação Recebida!', notification.request.content.title || 'Teste');
    },
    autoRegister: true,
  });

  useEffect(() => {
    if (expoPushToken) {
      console.log('✅ Push Token:', expoPushToken);
      Alert.alert('Sucesso!', 'Notificações configuradas!');
    }
  }, [expoPushToken]);

  // ... resto do componente
}
```

## 🔧 Troubleshooting

### ❌ Erro: "Cannot find module 'expo-notifications'"

**Solução:**

```bash
# Limpar cache e reinstalar
rm -rf node_modules
npm install
npx expo start --clear
```

### ❌ Token não está sendo gerado

**Possíveis causas:**

- Rodando em simulador (iOS) → Use dispositivo físico
- Permissão negada → Reinstale o app e aceite permissões
- Google Play Services não instalado (Android) → Use emulador com Google Play

### ❌ Notificações não aparecem (Android)

**Solução:**

```bash
# Verificar se google-services.json está presente
ls -la google-services.json

# Se não estiver, baixe do Firebase Console
```

### ❌ Rebuild não funciona

**Solução:**

```bash
# Limpar tudo e reconstruir
rm -rf node_modules ios android
npm install
npx expo prebuild --clean
npx expo run:ios
```

## 📱 Testar Notificações Push

### Método 1: Expo Push Tool (Rápido)

1. Obtenha seu Expo Push Token do console
2. Acesse: https://expo.dev/notifications
3. Cole o token
4. Envie uma notificação de teste

### Método 2: Admin Dashboard (Produção)

1. Faça login como admin
2. Vá para Dashboard Administrativo
3. Clique em "Notificar Pagamentos Vencidos" ou "Lembrar Pagamentos Pendentes"

### Método 3: Notificação Local (Desenvolvimento)

Adicione um botão de teste:

```typescript
import { Button } from 'react-native';
import { notificationService } from './src/services/notificationService';

<Button
  title="Testar Notificação"
  onPress={async () => {
    await notificationService.sendImmediateNotification(
      'Teste',
      'Esta é uma notificação de teste!',
      { type: 'test' }
    );
  }}
/>
```

## 🎯 Próximos Passos Backend

O backend precisa implementar estes endpoints:

```
POST /api/v1/admin/users/register-push-token
POST /api/v1/admin/notifications/overdue-payments
POST /api/v1/admin/notifications/pending-payments
POST /api/v1/admin/notifications/send/:userId
POST /api/v1/admin/notifications/broadcast
```

Ver arquivo `PUSH_NOTIFICATIONS.md` para detalhes completos.

## 📚 Arquivos Criados

- ✅ `/src/services/notificationService.ts` - Serviço de notificações
- ✅ `/src/services/adminService.ts` - Endpoints de admin (atualizado)
- ✅ `/src/hooks/useNotifications.ts` - Hook React para notificações
- ✅ `/src/screens/admin/AdminDashboardScreen.tsx` - Botões de ação (atualizado)
- ✅ `package.json` - Dependências adicionadas
- ✅ `app.json` - Configurações de notificações
- ✅ `PUSH_NOTIFICATIONS.md` - Documentação completa
- ✅ `NOTIFICATION_USAGE_EXAMPLE.tsx` - Exemplos de uso
- ✅ `INSTALL_NOTIFICATIONS.md` - Este arquivo

## ⚠️ Checklist Final

Antes de fazer deploy em produção:

- [ ] Dependências instaladas (`expo-notifications`, `expo-device`)
- [ ] Rebuild do app concluído
- [ ] Firebase configurado (Android)
- [ ] `google-services.json` no projeto
- [ ] APNs configurado (iOS - produção)
- [ ] Backend endpoints implementados
- [ ] Testado em dispositivo físico
- [ ] Permissões concedidas pelo usuário
- [ ] Token registrado no servidor
- [ ] Notificações funcionando em background
- [ ] Deep links configurados (opcional)

## 🎉 Está Tudo Pronto!

Agora você pode:

1. ✅ Enviar notificações para usuários com pagamentos vencidos
2. ✅ Enviar lembretes de pagamentos próximos do vencimento
3. ✅ Enviar notificações personalizadas para usuários específicos
4. ✅ Fazer broadcast para todos os usuários
5. ✅ Gerenciar badges e notificações locais

## 💡 Dica Final

Para ambiente de desenvolvimento, use o **Expo Go** para testar rapidamente sem precisar fazer rebuild toda vez.

```bash
npx expo start
# Escaneie o QR code com Expo Go
```

---

**Dúvidas?** Consulte `PUSH_NOTIFICATIONS.md` para documentação completa.

**Problemas?** Verifique a seção de Troubleshooting acima.

**Exemplos?** Veja `NOTIFICATION_USAGE_EXAMPLE.tsx` para código pronto.
