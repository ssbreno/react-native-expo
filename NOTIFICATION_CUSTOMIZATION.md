# 🎨 Personalização de Notificações (Opcional)

## Configuração Atual

A configuração básica de notificações já está funcionando com as configurações padrão do sistema:

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

## 🔔 Como Adicionar Ícone e Som Personalizados (Opcional)

Se você quiser personalizar o ícone e o som das notificações, siga os passos abaixo:

### 1. **Criar Ícone de Notificação (Android)**

#### Requisitos:

- Formato: PNG
- Tamanho: 96x96px (mdpi) ou maior
- Estilo: Monocromático (transparente com branco)
- Localização: `./assets/notification-icon.png`

#### Como criar:

**Opção 1: A partir do ícone existente**

```bash
# Converter o ícone atual para monocromático
# Use um editor de imagem ou ferramenta online
```

**Opção 2: Usar ferramenta online**

- Acesse: https://romannurik.github.io/AndroidAssetStudio/icons-notification.html
- Upload seu logo
- Download o ícone gerado
- Salve em `./assets/notification-icon.png`

### 2. **Criar Som de Notificação (Opcional)**

#### Requisitos:

- Formato: WAV ou MP3
- Duração: Máximo 5 segundos
- Qualidade: 16kHz, 16-bit
- Localização: `./assets/notification-sound.wav`

#### Sons recomendados:

```bash
# Você pode usar sons do sistema ou criar customizados
# Sites gratuitos para sons:
# - https://mixkit.co/free-sound-effects/
# - https://freesound.org/
```

### 3. **Atualizar app.json**

Após criar os arquivos, atualize o `app.json`:

```json
{
  "plugins": [
    "expo-secure-store",
    [
      "expo-notifications",
      {
        "icon": "./assets/notification-icon.png",
        "color": "#ffffff",
        "sounds": ["./assets/notification-sound.wav"],
        "mode": "production"
      }
    ]
  ],
  "notification": {
    "icon": "./assets/notification-icon.png",
    "color": "#000000",
    "androidMode": "default",
    "androidCollapsedTitle": "Nanquim Locações"
  }
}
```

### 4. **Rebuild do App**

Após adicionar os arquivos personalizados, é necessário rebuild:

```bash
npx expo prebuild --clean
npx expo run:android
npx expo run:ios
```

## 📱 Configurações por Plataforma

### **Android**

```json
{
  "notification": {
    "icon": "./assets/notification-icon.png",
    "color": "#4CAF50",
    "androidMode": "default",
    "androidCollapsedTitle": "Nanquim Locações"
  }
}
```

**Opções:**

- `icon`: Caminho para o ícone monocromático
- `color`: Cor de destaque (hexadecimal)
- `androidMode`: "default" ou "collapse"
- `androidCollapsedTitle`: Título quando múltiplas notificações

### **iOS**

```json
{
  "notification": {
    "sounds": ["./assets/notification-sound.wav"]
  }
}
```

**iOS usa o ícone do app automaticamente**, não precisa configurar.

## 🎨 Exemplos de Customização

### Exemplo 1: Notificação Simples (Atual)

```json
{
  "expo-notifications": {
    "mode": "production"
  }
}
```

✅ **Usa ícones e sons padrão do sistema**

### Exemplo 2: Com Ícone Customizado

```json
{
  "expo-notifications": {
    "icon": "./assets/notification-icon.png",
    "color": "#4CAF50",
    "mode": "production"
  }
}
```

✅ **Ícone personalizado verde**

### Exemplo 3: Completo

```json
{
  "expo-notifications": {
    "icon": "./assets/notification-icon.png",
    "color": "#4CAF50",
    "sounds": ["./assets/notification-sound.wav"],
    "mode": "production"
  }
}
```

✅ **Ícone + cor + som personalizados**

## 🔧 Troubleshooting

### Ícone não aparece

- Verifique se o arquivo está em `./assets/notification-icon.png`
- Confirme que é PNG monocromático (transparente + branco)
- Faça rebuild do app

### Som não toca

- Verifique formato do arquivo (WAV recomendado)
- Confirme que está em `./assets/notification-sound.wav`
- Verifique se o dispositivo não está em modo silencioso
- Faça rebuild do app

### Cor não aplica

- Cor só funciona em Android
- Use formato hexadecimal: `"#4CAF50"`
- Faça rebuild do app

## 📝 Notas Importantes

1. **Arquivos são OPCIONAIS**
   - Sem eles, usa padrões do sistema
   - Funciona perfeitamente sem personalização

2. **Rebuild Necessário**
   - Mudanças em `app.json` requerem rebuild
   - Use `npx expo run:android` ou `npx expo run:ios`

3. **Plataformas Diferentes**
   - Android: Ícone monocromático + cor
   - iOS: Usa ícone do app + som opcional

4. **Tamanho dos Arquivos**
   - Mantenha arquivos pequenos (< 500KB)
   - Ícone: Recomendado 96x96px
   - Som: Máximo 5 segundos

## 🎯 Recomendação

**Para começar**, use a configuração padrão (atual):

```json
{
  "expo-notifications": {
    "mode": "production"
  }
}
```

**Quando necessário**, adicione customizações gradualmente:

1. Primeiro teste com padrões
2. Depois adicione ícone
3. Por último, som personalizado

## 📚 Recursos

- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Android Icon Generator](https://romannurik.github.io/AndroidAssetStudio/)
- [Free Sound Effects](https://mixkit.co/free-sound-effects/)
- [Notification Best Practices](https://developer.android.com/design/ui/mobile/guides/foundations/notifications)

---

**Status Atual:** ✅ Configuração básica funcionando  
**Personalização:** ⚪ Opcional - Adicione quando necessário
