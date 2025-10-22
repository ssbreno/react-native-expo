import React, { useState, useEffect } from 'react';
import {
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { TextInput, Button, Title, Text, ActivityIndicator, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';
import { styles } from './LoginScreen.styles';

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
      await AsyncStorage.setItem(CREDENTIALS_KEY, JSON.stringify({ email, password }));
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
          <Title style={styles.title}>Nanquim Locações</Title>
          <Text style={styles.subtitle}>Faça login para acessar seus veículos</Text>
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
                icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
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
            <Animated.View
              style={[
                styles.checkboxCustom,
                { transform: [{ scale: checkboxScale }] },
                rememberMe && {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.primary,
                },
              ]}
            >
              {rememberMe && <Ionicons name="checkmark" size={16} color="white" />}
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
            {loading ? <ActivityIndicator color="white" /> : <Text>Entrar</Text>}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
