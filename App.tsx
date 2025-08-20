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
import PaymentHistoryScreen from './src/screens/PaymentHistoryScreen';
import SubscriptionScreen from './src/screens/SubscriptionScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Import types
import { RootStackParamList, MainTabParamList } from './src/types';

// Navigation setup
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Custom theme
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2196F3',
    secondary: '#03DAC6',
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
  const { isAuthenticated, loading } = useAuth();

  console.log('🚀 AppNavigator - Auth Status:', { isAuthenticated, loading });

  if (loading) {
    console.log('🚀 AppNavigator - Showing loading state');
    return null; // You could show a loading screen here
  }

  console.log('🚀 AppNavigator - Rendering navigation with auth:', isAuthenticated);

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
      ) : (
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
