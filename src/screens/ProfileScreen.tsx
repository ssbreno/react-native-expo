import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  Avatar,
  List,
  Switch,
  Divider,
  Surface,
  useTheme
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useVehicle } from '../contexts/VehicleContext';

interface ProfileScreenProps {
  navigation: any;
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user, logout } = useAuth();
  const { vehicles, paymentHistory } = useVehicle();
  const [notifications, setNotifications] = useState(true);
  const theme = useTheme();

  const handleLogout = () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: performLogout }
      ]
    );
  };

  const performLogout = async () => {
    try {
      await logout();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao sair da conta. Tente novamente.');
    }
  };

  const handleEditProfile = () => {
    Alert.alert(
      'Editar Perfil',
      'Funcionalidade em desenvolvimento. Em breve você poderá editar suas informações pessoais.',
      [{ text: 'OK' }]
    );
  };

  const handleSupport = () => {
    Alert.alert(
      'Suporte',
      'Entre em contato conosco:\n\nTelefone: (11) 99999-9999\nEmail: suporte@vehiclerental.com\nHorário: 8h às 18h',
      [{ text: 'OK' }]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'Sobre o App',
      'Nanquim Locações App\nVersão 1.0.0\n\n© 2024 Nanquim Locações\nTodos os direitos reservados.',
      [{ text: 'OK' }]
    );
  };

  const paidPayments = paymentHistory.filter(p => p.status === 'pago');
  const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <Surface style={styles.header}>
        <View style={styles.profileHeader}>
          <Avatar.Text
            size={80}
            label={user.name.charAt(0).toUpperCase()}
            style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
          />
          <View style={styles.userInfo}>
            <Title style={styles.userName}>{user.name}</Title>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.userPhone}>{user.phone}</Text>
          </View>
        </View>

        <Button
          mode="outlined"
          onPress={handleEditProfile}
          style={styles.editButton}
          contentStyle={styles.editButtonContent}
          icon="account-edit"
        >
          Editar Perfil
        </Button>
      </Surface>

      {/* Statistics */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Suas Estatísticas</Title>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Ionicons name="car" size={24} color={theme.colors.primary} />
              </View>
              <Text style={styles.statValue}>{vehicles.length}</Text>
              <Text style={styles.statLabel}>Veículos</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Ionicons name="receipt" size={24} color="#4caf50" />
              </View>
              <Text style={styles.statValue}>{paidPayments.length}</Text>
              <Text style={styles.statLabel}>Pagamentos</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Ionicons name="cash" size={24} color="#ff9800" />
              </View>
              <Text style={styles.statValue}>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(totalPaid)}
              </Text>
              <Text style={styles.statLabel}>Total Pago</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Settings */}
      <Card style={styles.settingsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Configurações</Title>
          
          <List.Section>
            <List.Item
              title="Notificações"
              description="Receber notificações sobre vencimentos e pagamentos"
              left={(props) => <List.Icon {...props} icon="bell" />}
              right={() => (
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  color={theme.colors.primary}
                />
              )}
            />
            
          </List.Section>
        </Card.Content>
      </Card>

      {/* Account Options */}
      <Card style={styles.optionsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Conta</Title>
          
          <List.Section>
            <List.Item
              title="Histórico Completo"
              description="Ver todo o histórico de pagamentos e aluguéis"
              left={(props) => <List.Icon {...props} icon="history" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('Histórico')}
            />
            
            <List.Item
              title="Suporte"
              description="Precisa de ajuda? Entre em contato conosco"
              left={(props) => <List.Icon {...props} icon="help-circle" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleSupport}
            />
            
            <List.Item
              title="Sobre o App"
              description="Informações sobre a versão e termos de uso"
              left={(props) => <List.Icon {...props} icon="information" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={handleAbout}
            />
          </List.Section>
        </Card.Content>
      </Card>

      {/* Logout */}
      <Card style={styles.logoutCard}>
        <Card.Content>
          <Button
            mode="contained"
            onPress={handleLogout}
            style={[styles.logoutButton, { backgroundColor: '#f44336' }]}
            contentStyle={styles.logoutButtonContent}
            icon="logout"
          >
            Sair da Conta
          </Button>
        </Card.Content>
      </Card>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    elevation: 2,
    backgroundColor: 'white',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    marginRight: 20,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 16,
    color: '#000000',
  },
  editButton: {
    alignSelf: 'flex-start',
  },
  editButtonContent: {
    paddingVertical: 4,
  },
  statsCard: {
    margin: 16,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: '#e0e0e0',
  },
  settingsCard: {
    margin: 16,
    marginTop: 8,
    elevation: 4,
  },
  optionsCard: {
    margin: 16,
    marginTop: 8,
    elevation: 4,
  },
  logoutCard: {
    margin: 16,
    marginTop: 8,
    elevation: 4,
  },
  logoutButton: {
    marginTop: 8,
  },
  logoutButtonContent: {
    paddingVertical: 8,
  },
  bottomSpacing: {
    height: 32,
  },
});
