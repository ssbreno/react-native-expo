// Nanquim Locações - Color Palette
// Principal: Azul | Secundária: Preto | Terciária: Branco

export const Colors = {
  // Cores principais
  primary: '#4169E1', // Azul Royal
  primaryDark: '#2E4A9E', // Azul Royal escuro para variações
  primaryLight: '#5B7FE8', // Azul Royal claro para hover/states

  // Cores secundárias
  secondary: '#000000', // Preto
  secondaryLight: '#1A1A1A', // Preto suave para variações

  // Cores terciárias
  tertiary: '#FFFFFF', // Branco
  tertiaryDark: '#F5F5F5', // Branco acinzentado para backgrounds

  // Cores de texto
  text: {
    primary: '#000000', // Texto principal (preto)
    secondary: '#666666', // Texto secundário (cinza)
    tertiary: '#999999', // Texto terciário (cinza claro)
    onPrimary: '#FFFFFF', // Texto em fundo azul
  },

  // Cores de status
  success: '#4CAF50', // Verde para sucesso
  warning: '#FF9800', // Laranja para avisos
  error: '#F44336', // Vermelho para erros
  info: '#2196F3', // Azul para informações

  // Cores de background
  background: {
    primary: '#FFFFFF', // Background principal
    secondary: '#F5F5F5', // Background secundário
    tertiary: '#FAFAFA', // Background terciário
    card: '#FFFFFF', // Background de cards
  },

  // Cores de borda
  border: {
    light: '#E0E0E0',
    medium: '#BDBDBD',
    dark: '#757575',
  },

  // Cores neutras
  gray: {
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // Overlay e backdrop
  overlay: 'rgba(0, 0, 0, 0.5)',
  backdropLight: 'rgba(0, 0, 0, 0.3)',
};

export default Colors;
