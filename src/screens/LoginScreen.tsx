import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import {
  TextInput,
  Button,
  Title,
  Card,
  Text,
  ActivityIndicator,
  useTheme
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const theme = useTheme();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Erro no Login', result.error || 'Erro desconhecido');
    }
  };

  const fillDemoCredentials = () => {
    setEmail('demo@vehiclerental.com');
    setPassword('123456');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <View style={[styles.logoCircle, { backgroundColor: theme.colors.primary }]}>
            <Ionicons name="car" size={60} color="white" />
          </View>
          <Title style={[styles.title, { color: theme.colors.primary }]}>
            Vehicle Rental
          </Title>
          <Text style={styles.subtitle}>
            Faça login para acessar seus veículos
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={styles.input}
              left={<TextInput.Icon icon="email" />}
              disabled={loading}
            />

            <TextInput
              label="Senha"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              autoComplete="password"
              style={styles.input}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon 
                  icon={showPassword ? "eye-off" : "eye"} 
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              disabled={loading}
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.button}
              disabled={loading}
              contentStyle={styles.buttonContent}
            >
              {loading ? <ActivityIndicator color="white" /> : 'Entrar'}
            </Button>

            <TouchableOpacity
              style={styles.demoButton}
              onPress={fillDemoCredentials}
              disabled={loading}
            >
              <Text style={[styles.demoText, { color: theme.colors.primary }]}>
                Preencher dados de demonstração
              </Text>
            </TouchableOpacity>

            <View style={styles.helpContainer}>
              <Text style={styles.helpText}>
                Use qualquer email válido e senha para testar
              </Text>
              <Text style={styles.helpSubText}>
                Exemplo: demo@vehiclerental.com
              </Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  card: {
    elevation: 4,
    backgroundColor: 'white',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  demoButton: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 16,
  },
  demoText: {
    fontSize: 14,
    fontWeight: '500',
  },
  helpContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  helpSubText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
