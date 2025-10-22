/**
 * Performance Utilities
 *
 * Funções e constantes para otimizar performance do app
 */

/**
 * Configurações otimizadas para FlatList
 *
 * Use estas props em todas as FlatLists do app para melhor performance
 */
export const FLATLIST_PERFORMANCE_PROPS = {
  // Remove views que não estão visíveis na tela
  removeClippedSubviews: true,

  // Renderiza apenas 5 itens por batch
  maxToRenderPerBatch: 5,

  // Atualiza células a cada 50ms
  updateCellsBatchingPeriod: 50,

  // Renderiza 5 itens inicialmente (ajuste conforme necessário)
  initialNumToRender: 5,

  // Janela de visualização = 5 telas (ajuste conforme necessário)
  windowSize: 5,

  // Desabilita scroll automático para o topo
  maintainVisibleContentPosition: {
    minIndexForVisible: 0,
  },
};

/**
 * Cria uma função getItemLayout otimizada para FlatList
 *
 * @param itemHeight Altura fixa de cada item
 * @returns Função getItemLayout configurada
 *
 * @example
 * <FlatList
 *   getItemLayout={createGetItemLayout(300)}
 * />
 */
export const createGetItemLayout = (itemHeight: number) => {
  return (data: any, index: number) => ({
    length: itemHeight,
    offset: itemHeight * index,
    index,
  });
};

/**
 * Debounce function para limitar chamadas frequentes
 *
 * @param func Função a ser debounced
 * @param wait Tempo de espera em ms
 * @returns Função debounced
 *
 * @example
 * const handleSearch = debounce((text) => {
 *   searchAPI(text);
 * }, 300);
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function para limitar taxa de execução
 *
 * @param func Função a ser throttled
 * @param limit Tempo mínimo entre execuções em ms
 * @returns Função throttled
 *
 * @example
 * const handleScroll = throttle((event) => {
 *   updateScrollPosition(event);
 * }, 100);
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Compara objetos de forma superficial para React.memo
 *
 * @param prevProps Props anteriores
 * @param nextProps Próximas props
 * @returns true se props são iguais (previne re-render)
 *
 * @example
 * export default React.memo(MyComponent, shallowEqual);
 */
export const shallowEqual = (prevProps: any, nextProps: any): boolean => {
  const prevKeys = Object.keys(prevProps);
  const nextKeys = Object.keys(nextProps);

  if (prevKeys.length !== nextKeys.length) return false;

  return prevKeys.every(key => prevProps[key] === nextProps[key]);
};

/**
 * Agrupa atualizações de estado em batch (React 18+)
 *
 * @param updates Array de funções de atualização de estado
 *
 * @example
 * batchStateUpdates([
 *   () => setName('João'),
 *   () => setAge(30),
 *   () => setCity('São Paulo')
 * ]);
 */
export const batchStateUpdates = (updates: Array<() => void>): void => {
  // React 18+ automaticamente faz batch de updates
  // Esta função garante que updates são aplicados juntos
  Promise.resolve().then(() => {
    updates.forEach(update => update());
  });
};

/**
 * Limita o tamanho de um array mantendo apenas os últimos N itens
 * Útil para listas de histórico que crescem indefinidamente
 *
 * @param array Array original
 * @param maxSize Tamanho máximo
 * @returns Array limitado
 *
 * @example
 * const recentPayments = limitArraySize(allPayments, 50);
 */
export const limitArraySize = <T>(array: T[], maxSize: number): T[] => {
  if (array.length <= maxSize) return array;
  return array.slice(-maxSize);
};

/**
 * Cria um key extractor otimizado para FlatList
 *
 * @param keyProperty Nome da propriedade que contém o ID único
 * @returns Função keyExtractor
 *
 * @example
 * <FlatList
 *   keyExtractor={createKeyExtractor('id')}
 * />
 */
export const createKeyExtractor = <T extends Record<string, any>>(
  keyProperty: keyof T = 'id' as keyof T
) => {
  return (item: T, index: number): string => {
    return item[keyProperty]?.toString() || index.toString();
  };
};

/**
 * Constantes de performance para configurações do app
 */
export const PERFORMANCE_CONSTANTS = {
  // Timeouts
  API_TIMEOUT: 10000, // 10 segundos
  DEBOUNCE_SEARCH: 300, // 300ms para search
  THROTTLE_SCROLL: 100, // 100ms para scroll events

  // Limites de listas
  MAX_VISIBLE_ITEMS: 50, // Máximo de itens visíveis em listas
  INITIAL_ITEMS: 10, // Itens iniciais a carregar
  PAGE_SIZE: 20, // Tamanho da página para pagination

  // Cache
  IMAGE_CACHE_SIZE: 100, // MB
  API_CACHE_DURATION: 300000, // 5 minutos

  // Animações
  ANIMATION_DURATION_SHORT: 200, // ms
  ANIMATION_DURATION_MEDIUM: 300, // ms
  ANIMATION_DURATION_LONG: 500, // ms
};

/**
 * Hook para monitorar performance de renders
 * Útil para debugging
 *
 * @param componentName Nome do componente
 *
 * @example
 * function MyComponent() {
 *   useRenderPerformance('MyComponent');
 *   // ...
 * }
 */
export const useRenderPerformance = (componentName: string): void => {
  if (__DEV__) {
    const renderCount = React.useRef(0);
    const renderTime = React.useRef(Date.now());

    React.useEffect(() => {
      renderCount.current += 1;
      const now = Date.now();
      const timeSinceLastRender = now - renderTime.current;
      renderTime.current = now;

      console.log(
        `🎯 [${componentName}] Render #${renderCount.current} (${timeSinceLastRender}ms since last)`
      );
    });
  }
};

// Re-export React para evitar import adicional
import React from 'react';
