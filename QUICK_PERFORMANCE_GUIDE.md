# ⚡ Guia Rápido de Performance

## 🎯 Checklist para Novos Componentes

Ao criar ou modificar componentes, siga este checklist para garantir performance otimizada:

### ✅ Para Listas (FlatList)

```typescript
import { FLATLIST_PERFORMANCE_PROPS, createGetItemLayout } from '../utils/performanceUtils';

<FlatList
  data={myData}
  renderItem={renderMyItem}
  keyExtractor={(item) => item.id.toString()}

  // ⚡ Adicione estas props para performance
  {...FLATLIST_PERFORMANCE_PROPS}
  getItemLayout={createGetItemLayout(300)} // Altura do seu item
/>
```

### ✅ Para Cálculos Pesados

```typescript
import { useMemo } from 'react';

// ❌ EVITE - Recalcula a cada render
const total = items.reduce((sum, item) => sum + item.value, 0);

// ✅ USE - Só recalcula quando items mudar
const total = useMemo(() => items.reduce((sum, item) => sum + item.value, 0), [items]);
```

### ✅ Para Funções de Callback

```typescript
import { useCallback } from 'react';

// ❌ EVITE - Nova função a cada render
const handlePress = item => {
  doSomething(item);
};

// ✅ USE - Mesma referência de função
const handlePress = useCallback(item => {
  doSomething(item);
}, []); // Adicione dependencies se necessário
```

### ✅ Para Componentes Filhos

```typescript
import React from 'react';

// ✅ Evite re-renders desnecessários
const MyCard = React.memo(({ title, value, onPress }) => {
  return (
    <Card onPress={onPress}>
      <Title>{title}</Title>
      <Text>{value}</Text>
    </Card>
  );
});
```

---

## 🔍 Debugging de Performance

### 1. Identificar Componentes Lentos

```typescript
import { useRenderPerformance } from '../utils/performanceUtils';

function MyComponent() {
  useRenderPerformance('MyComponent');

  // Verá logs no console mostrando quantas vezes o componente renderiza
  return <View>...</View>;
}
```

### 2. Medir Tempo de Operações

```typescript
console.time('operação-pesada');
const result = heavyCalculation();
console.timeEnd('operação-pesada'); // Mostra quanto tempo levou
```

### 3. Verificar Re-renders

```typescript
// Adicione ao início do componente
console.log('🔄 Component re-rendered');
```

---

## 🚀 Comandos Úteis

### Limpar Cache e Rebuild

```bash
# Limpar cache do Metro Bundler
npx expo start -c

# Limpar cache do Yarn/NPM
rm -rf node_modules
yarn install

# Build otimizado para produção
eas build --platform android --profile production
```

### Analisar Bundle Size

```bash
# Analisar tamanho do bundle
npx react-native-bundle-visualizer

# Ver dependências pesadas
npx npm-why package-name
```

---

## 📊 Métricas Alvo

| Métrica                | Target  | Crítico |
| ---------------------- | ------- | ------- |
| Tempo de inicialização | < 2s    | > 4s    |
| FPS durante scroll     | > 55    | < 40    |
| Uso de memória (idle)  | < 150MB | > 250MB |
| Tamanho do APK         | < 25MB  | > 40MB  |

---

## 🎨 Otimizações Visuais

### Images

```typescript
// ✅ Use tamanhos específicos
<Image
  source={...}
  style={{ width: 100, height: 100 }}
  resizeMode="cover"
/>

// ❌ Evite
<Image source={...} /> // Sem dimensões definidas
```

### Animações

```typescript
// ✅ Use nativeDriver quando possível
Animated.timing(animatedValue, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true, // ⚡ Performance boost
}).start();
```

---

## 🛠️ Ferramentas Recomendadas

1. **React DevTools Profiler** - Identificar componentes lentos
2. **Flipper** - Debug completo (memória, network, logs)
3. **Android Studio Profiler** - Análise detalhada de performance
4. **Reactotron** - Debug e monitoramento em tempo real

---

## 📚 Recursos

- [PERFORMANCE_OPTIMIZATION.md](./PERFORMANCE_OPTIMIZATION.md) - Documentação completa
- [performanceUtils.ts](./src/utils/performanceUtils.ts) - Utilitários de performance
- [React Native Performance Docs](https://reactnative.dev/docs/performance)

---

## ⚠️ Anti-Patterns Comuns

### ❌ Não Faça

```typescript
// Renderizar em loop sem key estável
{items.map((item, index) => <Item key={index} />)}

// Criar objetos/funções inline
<Component style={{ marginTop: 10 }} onPress={() => doSomething()} />

// Fazer cálculos pesados no render
const filtered = bigArray.filter(...).map(...).sort(...);
```

### ✅ Faça

```typescript
// Use keys estáveis
{items.map(item => <Item key={item.id} />)}

// Use estilos/funções de fora do render
const styles = StyleSheet.create({ container: { marginTop: 10 } });
const handlePress = useCallback(() => doSomething(), []);

// Memoize cálculos
const filtered = useMemo(() =>
  bigArray.filter(...).map(...).sort(...),
  [bigArray]
);
```

---

**Dica:** Se não tiver certeza se precisa otimizar, **meça primeiro!** Use as ferramentas de profiling antes de otimizar prematuramente.
