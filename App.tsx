import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';

// Import contexts
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { VehicleProvider } from './src/contexts/VehicleContext';

// Import screens
// Auth screens
import LoginScreen from './src/screens/auth/LoginScreen';

// User screens
import VehicleListScreen from './src/screens/user/VehicleListScreen';
import VehicleDetailScreen from './src/screens/user/VehicleDetailScreen';
import VehicleEditScreen from './src/screens/user/VehicleEditScreen';
import PaymentHistoryScreen from './src/screens/user/PaymentHistoryScreen';
import SubscriptionScreen from './src/screens/user/SubscriptionScreen';
import ProfileScreen from './src/screens/user/ProfileScreen';
import ChangePasswordScreen from './src/screens/user/ChangePasswordScreen';

// Import types
import { RootStackParamList, MainTabParamList } from './src/types';

// Import colors
import { Colors } from './src/constants/colors';

// Navigation setup
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Custom theme - Nanquim Locações (Azul, Preto, Branco)
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary, // Azul
    secondary: Colors.secondary, // Preto
    background: Colors.background.primary, // Branco
    surface: Colors.background.card, // Branco
    accent: Colors.primaryLight, // Azul claro
    text: Colors.text.primary, // Preto
    placeholder: Colors.text.secondary, // Cinza
    backdrop: Colors.overlay, // Overlay preto
    onSurface: Colors.text.primary, // Texto preto em superfícies
    notification: Colors.primary, // Azul para notificações
    error: Colors.error, // Vermelho para erros
  },
};

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Veículos') {
            iconName = focused ? 'car' : 'car-outline';
          } else if (route.name === 'Histórico') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'Assinatura') {
            iconName = focused ? 'card' : 'card-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="Veículos"
        component={VehicleListScreen}
        options={{
          title: 'Meus Veículos',
        }}
      />
      <Tab.Screen
        name="Histórico"
        component={PaymentHistoryScreen}
        options={{
          title: 'Pagamentos',
        }}
      />
      <Tab.Screen
        name="Assinatura"
        component={SubscriptionScreen}
        options={{
          title: 'Assinatura',
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          title: 'Meu Perfil',
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { isAuthenticated, loading, user } = useAuth();

  // Check if user is admin using multiple criteria
  const isAdmin =
    user?.is_admin === true ||
    user?.isAdmin === true ||
    user?.email === 'admin@vehicles.com' ||
    user?.email?.toLowerCase().includes('admin');

  if (loading) {
    return null; // You could show a loading screen here
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {!isAuthenticated ? (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      ) : isAdmin ? (
        // Admin Navigation
        <>
          <Stack.Screen
            name="AdminDashboard"
            component={require('./src/screens/admin/AdminDashboardScreen').default}
            options={{
              title: 'Painel Administrativo',
              headerBackTitle: 'Voltar',
            }}
          />
          <Stack.Screen
            name="UsersList"
            component={require('./src/screens/admin/UsersListScreen').default}
            options={{
              title: 'Lista de Usuários',
              headerBackTitle: 'Voltar',
            }}
          />
          <Stack.Screen
            name="UserDetails"
            component={require('./src/screens/admin/UserDetailsScreen').default}
            options={{
              title: 'Detalhes do Usuário',
              headerBackTitle: 'Voltar',
            }}
          />
          <Stack.Screen
            name="UpdateOverduePayments"
            component={require('./src/screens/admin/UpdateOverduePaymentsScreen').default}
            options={{
              title: 'Pagamentos Vencidos',
              headerBackTitle: 'Voltar',
            }}
          />
          <Stack.Screen
            name="VehiclesManagement"
            component={require('./src/screens/admin/VehiclesManagementScreen').default}
            options={{
              title: 'Gerenciar Veículos',
              headerBackTitle: 'Voltar',
            }}
          />
        </>
      ) : (
        // Regular User Navigation
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} options={{ headerShown: false }} />
          <Stack.Screen
            name="VehicleDetail"
            component={VehicleDetailScreen}
            options={{
              title: 'Detalhes do Veículo',
              headerBackTitle: 'Voltar',
            }}
          />
          <Stack.Screen
            name="VehicleEdit"
            component={VehicleEditScreen}
            options={{
              title: 'Editar Veículo',
              headerBackTitle: 'Voltar',
            }}
          />
          <Stack.Screen
            name="ChangePassword"
            component={ChangePasswordScreen}
            options={{
              title: 'Alterar Senha',
              headerBackTitle: 'Voltar',
            }}
          />
          <Stack.Screen
            name="UsersList"
            component={require('./src/screens/admin/UsersListScreen').default}
            options={{
              title: 'Lista de Usuários',
              headerBackTitle: 'Voltar',
            }}
          />
          <Stack.Screen
            name="UserDetails"
            component={require('./src/screens/admin/UserDetailsScreen').default}
            options={{
              title: 'Detalhes do Usuário',
              headerBackTitle: 'Voltar',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const [fontsLoaded, setFontsLoaded] = React.useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        // Load any custom fonts here if needed
        await Font.loadAsync({
          // Add custom fonts if required
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
        setFontsLoaded(true); // Continue even if fonts fail
      }
    }

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null; // You could show a splash screen here
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <VehicleProvider>
            <NavigationContainer>
              <StatusBar style="light" backgroundColor={theme.colors.primary} />
              <AppNavigator />
            </NavigationContainer>
          </VehicleProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
