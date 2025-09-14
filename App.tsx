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
import LoginScreen from './src/screens/LoginScreen';
import VehicleListScreen from './src/screens/VehicleListScreen';
import VehicleDetailScreen from './src/screens/VehicleDetailScreen';
import VehicleEditScreen from './src/screens/VehicleEditScreen';
import PaymentHistoryScreen from './src/screens/PaymentHistoryScreen';
import SubscriptionScreen from './src/screens/SubscriptionScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';

// Import types
import { RootStackParamList, MainTabParamList } from './src/types';

// Navigation setup
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Custom theme - Nanquim Locações (Black, Orange, White)
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FF8C00', // Dark Orange
    secondary: '#FFA500', // Orange
    background: '#FFFFFF', // White
    surface: '#FFFFFF', // White
    accent: '#FF8C00', // Dark Orange
    text: '#000000', // Black
    placeholder: '#666666', // Dark Gray
    backdrop: 'rgba(0, 0, 0, 0.5)', // Black backdrop
    onSurface: '#000000', // Black text on surfaces
    notification: '#FF8C00', // Orange for notifications
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
  const isAdmin = user?.is_admin === true || 
                  user?.isAdmin === true || 
                  user?.email === 'admin@vehicles.com' || 
                  user?.email?.toLowerCase().includes('admin');

  console.log('🚀 AppNavigator - Auth Status:', { 
    isAuthenticated, 
    loading, 
    user: user?.email, 
    is_admin_field: user?.is_admin,
    isAdmin_field: user?.isAdmin,
    calculated_isAdmin: isAdmin 
  });

  if (loading) {
    console.log('🚀 AppNavigator - Showing loading state');
    return null; // You could show a loading screen here
  }

  console.log('🚀 AppNavigator - Rendering navigation with auth:', isAuthenticated, 'isAdmin:', isAdmin);

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
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      ) : isAdmin ? (
        // Admin Navigation
        <>
          <Stack.Screen 
            name="AdminDashboard" 
            component={AdminDashboardScreen}
            options={{ 
              title: 'Painel Administrativo',
              headerBackTitle: 'Voltar'
            }}
          />
          <Stack.Screen 
            name="UsersList" 
            component={require('./src/screens/UsersListScreen').default}
            options={{ 
              title: 'Lista de Usuários',
              headerBackTitle: 'Voltar'
            }}
          />
          <Stack.Screen 
            name="UserDetails" 
            component={require('./src/screens/UserDetailsScreen').default}
            options={{ 
              title: 'Detalhes do Usuário',
              headerBackTitle: 'Voltar'
            }}
          />
        </>
      ) : (
        // Regular User Navigation
        <>
          <Stack.Screen 
            name="Main" 
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="VehicleDetail" 
            component={VehicleDetailScreen}
            options={{ 
              title: 'Detalhes do Veículo',
              headerBackTitle: 'Voltar'
            }}
          />
          <Stack.Screen 
            name="VehicleEdit" 
            component={VehicleEditScreen}
            options={{ 
              title: 'Editar Veículo',
              headerBackTitle: 'Voltar'
            }}
          />
          <Stack.Screen 
            name="UsersList" 
            component={require('./src/screens/UsersListScreen').default}
            options={{ 
              title: 'Lista de Usuários',
              headerBackTitle: 'Voltar'
            }}
          />
          <Stack.Screen 
            name="UserDetails" 
            component={require('./src/screens/UserDetailsScreen').default}
            options={{ 
              title: 'Detalhes do Usuário',
              headerBackTitle: 'Voltar'
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
