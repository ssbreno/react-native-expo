import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {
  TextInput,
  Button,
  Title,
  Text,
  ActivityIndicator,
  useTheme
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';

const CREDENTIALS_KEY = '@nanquim_saved_credentials';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loadingCredentials, setLoadingCredentials] = useState(true);
  const { login } = useAuth();
  const theme = useTheme();
  
  // Animação para o checkbox
  const checkboxScale = new Animated.Value(1);

  // Carregar credenciais salvas ao montar o componente
  useEffect(() => {
    loadSavedCredentials();
  }, []);

  const animateCheckbox = () => {
    Animated.sequence([
      Animated.timing(checkboxScale, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(checkboxScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadSavedCredentials = async () => {
    try {
      const savedCredentials = await AsyncStorage.getItem(CREDENTIALS_KEY);
      if (savedCredentials) {
        const { email: savedEmail, password: savedPassword } = JSON.parse(savedCredentials);
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      }
    } catch (error) {
      console.error('Erro ao carregar credenciais salvas:', error);
    } finally {
      setLoadingCredentials(false);
    }
  };

  const saveCredentials = async () => {
    try {
      await AsyncStorage.setItem(
        CREDENTIALS_KEY,
        JSON.stringify({ email, password })
      );
    } catch (error) {
      console.error('Erro ao salvar credenciais:', error);
    }
  };

  const clearSavedCredentials = async () => {
    try {
      await AsyncStorage.removeItem(CREDENTIALS_KEY);
    } catch (error) {
      console.error('Erro ao limpar credenciais:', error);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    const result = await login(email.trim(), password.trim());
    
    if (result.success) {
      // Salvar ou limpar credenciais baseado no checkbox
      if (rememberMe) {
        await saveCredentials();
      } else {
        await clearSavedCredentials();
      }
    }
    
    setLoading(false);

    if (!result.success) {
      Alert.alert('Erro no Login', result.error || 'Erro desconhecido');
    }
  };


  // Mostrar loading enquanto carrega credenciais salvas
  if (loadingCredentials) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <View style={[styles.logoCircle, { backgroundColor: theme.colors.primary }]}>
            <Ionicons name="car" size={50} color="white" />
          </View>
          <Title style={styles.title}>
            Nanquim Locações
          </Title>
          <Text style={styles.subtitle}>
            Faça login para acessar seus veículos
          </Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            style={styles.input}
            outlineStyle={styles.inputOutline}
            left={<TextInput.Icon icon="email-outline" />}
            disabled={loading}
            selectTextOnFocus={true}
            contextMenuHidden={false}
          />

          <TextInput
            label="Senha"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            autoComplete="password"
            style={styles.input}
            outlineStyle={styles.inputOutline}
            left={<TextInput.Icon icon="lock-outline" />}
            right={
              <TextInput.Icon 
                icon={showPassword ? "eye-off-outline" : "eye-outline"} 
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            disabled={loading}
          />

          {/* Checkbox Lembrar Senha - Redesenhado */}
          <TouchableOpacity
            style={styles.rememberMeContainer}
            onPress={() => {
              animateCheckbox();
              setRememberMe(!rememberMe);
            }}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Animated.View style={[
              styles.checkboxCustom,
              { transform: [{ scale: checkboxScale }] },
              rememberMe && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
            ]}>
              {rememberMe && (
                <Ionicons name="checkmark" size={16} color="white" />
              )}
            </Animated.View>
            <Text style={styles.rememberMeText}>Lembrar minha senha</Text>
          </TouchableOpacity>

          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.button}
            disabled={loading}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            {loading ? <ActivityIndicator color="white" /> : 'Entrar'}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '400',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  inputOutline: {
    borderRadius: 12,
    borderWidth: 1.5,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  checkboxCustom: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  rememberMeText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 10,
    fontWeight: '500',
  },
  button: {
    marginTop: 8,
    borderRadius: 12,
    elevation: 0,
  },
  buttonContent: {
    paddingVertical: 12,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
