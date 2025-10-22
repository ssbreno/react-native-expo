import React, { useState } from 'react';
import { View, ScrollView, Alert, StyleSheet } from 'react-native';
import { TextInput, Button, Text, Card, Title, HelperText, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../services/authService';
import { changePasswordSchema, validateWithSchema } from '../../utils/validationSchemas';

interface ChangePasswordScreenProps {
  navigation: any;
}

export default function ChangePasswordScreen({ navigation }: ChangePasswordScreenProps) {
  const theme = useTheme();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validations using Zod
  const validateForm = () => {
    const validation = validateWithSchema(changePasswordSchema, {
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: confirmPassword,
    });

    if (!validation.success) {
      setErrors(validation.errors);
      return false;
    }

    setErrors({});
    return true;
  };

  const isPasswordValid = newPassword.length >= 6;
  const doPasswordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const handleChangePassword = async () => {
    if (!validateForm()) {
      const firstError =
        Object.values(errors)[0] || 'Por favor, preencha todos os campos corretamente';
      Alert.alert('Erro', firstError);
      return;
    }

    setLoading(true);
    try {
      const result = await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      if (result.success) {
        Alert.alert('Sucesso!', result.message || 'Senha alterada com sucesso', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
        // Clear form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Erro', result.error || 'Erro ao alterar senha');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro inesperado ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card style={styles.card}>
        <Card.Content>
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="lock-closed" size={48} color={theme.colors.primary} />
            <Title style={styles.title}>Alterar Senha</Title>
            <Text style={styles.subtitle}>Crie uma senha forte com pelo menos 6 caracteres</Text>
          </View>

          {/* Current Password */}
          <TextInput
            label="Senha Atual"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry={!showCurrentPassword}
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="lock-outline" />}
            right={
              <TextInput.Icon
                icon={showCurrentPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              />
            }
            disabled={loading}
            error={!!errors.current_password}
          />
          {!!errors.current_password && (
            <HelperText type="error" visible={true}>
              {errors.current_password}
            </HelperText>
          )}

          {/* New Password */}
          <TextInput
            label="Nova Senha"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNewPassword}
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showNewPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowNewPassword(!showNewPassword)}
              />
            }
            disabled={loading}
            error={!!errors.new_password || (newPassword.length > 0 && !isPasswordValid)}
          />
          <HelperText
            type="error"
            visible={!!errors.new_password || (newPassword.length > 0 && !isPasswordValid)}
          >
            {errors.new_password || 'A senha deve ter pelo menos 6 caracteres'}
          </HelperText>

          {/* Confirm Password */}
          <TextInput
            label="Confirmar Nova Senha"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="lock-check" />}
            right={
              <TextInput.Icon
                icon={showConfirmPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            }
            disabled={loading}
            error={!!errors.confirm_password || (confirmPassword.length > 0 && !doPasswordsMatch)}
          />
          <HelperText
            type="error"
            visible={!!errors.confirm_password || (confirmPassword.length > 0 && !doPasswordsMatch)}
          >
            {errors.confirm_password || 'As senhas não coincidem'}
          </HelperText>

          {/* Password Requirements */}
          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>Requisitos da senha:</Text>
            <View style={styles.requirement}>
              <Ionicons
                name={isPasswordValid ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={isPasswordValid ? '#4CAF50' : '#999'}
              />
              <Text style={[styles.requirementText, isPasswordValid && styles.requirementMet]}>
                Mínimo de 6 caracteres
              </Text>
            </View>
            <View style={styles.requirement}>
              <Ionicons
                name={doPasswordsMatch && confirmPassword ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={doPasswordsMatch && confirmPassword ? '#4CAF50' : '#999'}
              />
              <Text
                style={[
                  styles.requirementText,
                  doPasswordsMatch && confirmPassword && styles.requirementMet,
                ]}
              >
                Senhas coincidem
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={[styles.button, styles.cancelButton]}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleChangePassword}
              style={[styles.button, styles.submitButton]}
              loading={loading}
              disabled={
                !currentPassword ||
                !newPassword ||
                !confirmPassword ||
                !isPasswordValid ||
                !doPasswordsMatch ||
                loading
              }
            >
              Alterar Senha
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Security Tips */}
      <Card style={[styles.card, styles.tipsCard]}>
        <Card.Content>
          <View style={styles.tipsHeader}>
            <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
            <Text style={styles.tipsTitle}>Dicas de Segurança</Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.tipText}>Use letras maiúsculas e minúsculas</Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.tipText}>Inclua números e caracteres especiais</Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.tipText}>Evite informações pessoais óbvias</Text>
          </View>
          <View style={styles.tip}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.tipText}>Não reutilize senhas de outros sites</Text>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bulletPoint: {
    color: '#1976D2',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  button: {
    flex: 1,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    borderColor: '#999',
  },
  card: {
    borderRadius: 12,
    elevation: 2,
    marginBottom: 16,
  },
  container: {
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  input: {
    marginBottom: 4,
  },
  requirement: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 4,
  },
  requirementMet: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  requirementText: {
    color: '#999',
    fontSize: 13,
    marginLeft: 8,
  },
  requirementsContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 24,
    marginTop: 16,
    padding: 12,
  },
  requirementsTitle: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  subtitle: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  tip: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 8,
  },
  tipText: {
    color: '#555',
    flex: 1,
    fontSize: 14,
  },
  tipsCard: {
    backgroundColor: '#E3F2FD',
  },
  tipsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  tipsTitle: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
    textAlign: 'center',
  },
});
