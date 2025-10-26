import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card, Title, Divider, Surface, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { AdminUser } from '../../services/adminService';
import { formatCurrency } from '../../utils/dateUtils';
import { Colors } from '../../constants/colors';

// Types
export interface QuickStat {
  label: string;
  value: number;
  color: string;
  icon: string;
  filter: string;
}

export interface PaymentSummary {
  up_to_date_users?: number;
  overdue_users?: number;
}

// ============================================
// RENDER QUICK STATS
// ============================================
export const renderQuickStats = (
  paymentSummary: PaymentSummary | null,
  usersWithPaymentStatus: AdminUser[],
  statusFilter: string,
  filterUsersByStatus: (status: string) => void,
  styles: any
) => {
  if (!paymentSummary) return null;

  const stats: QuickStat[] = [
    {
      label: 'Em Dia',
      value: paymentSummary.up_to_date_users || 0,
      color: '#4CAF50',
      icon: 'checkmark-circle',
      filter: 'up_to_date',
    },
    {
      label: 'Vencidos',
      value: paymentSummary.overdue_users || 0,
      color: '#F44336',
      icon: 'warning',
      filter: 'overdue',
    },
    {
      label: 'Sem Pagamentos',
      value: usersWithPaymentStatus.filter(u => u.payment_status === 'no_payments').length,
      color: '#FF9800',
      icon: 'alert-circle',
      filter: 'no_payments',
    },
  ];

  return (
    <Surface style={styles.quickStatsCard}>
      <Title style={styles.sectionTitle}>Status dos Usuários</Title>
      <View style={styles.quickStatsGrid}>
        {stats.map((stat, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.quickStatItem,
              { borderColor: stat.color },
              statusFilter === stat.filter && { backgroundColor: stat.color + '15' },
            ]}
            onPress={() => filterUsersByStatus(stat.filter)}
          >
            <Ionicons name={stat.icon as any} size={24} color={stat.color} />
            <Text style={[styles.quickStatValue, { color: stat.color }]}>{stat.value}</Text>
            <Text style={styles.quickStatLabel}>{stat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Surface>
  );
};

// ============================================
// GET PAYMENT STATUS COLOR
// ============================================
export const getPaymentStatusColor = (status?: string): string => {
  switch (status) {
    case 'up_to_date':
      return '#4CAF50';
    case 'overdue':
      return '#F44336';
    case 'no_payments':
      return '#FF9800';
    default:
      return '#9E9E9E';
  }
};

// ============================================
// GET PAYMENT STATUS TEXT
// ============================================
export const getPaymentStatusText = (status?: string): string => {
  switch (status) {
    case 'up_to_date':
      return 'Em Dia';
    case 'overdue':
      return 'Vencido';
    case 'no_payments':
      return 'Sem Pagamentos';
    default:
      return 'Desconhecido';
  }
};

// ============================================
// RENDER PAYMENT STATUS USER CARD
// ============================================
export const renderPaymentStatusUserCard = (
  user: AdminUser,
  navigation: any,
  styles: any
) => {
  const statusColor = getPaymentStatusColor(user.payment_status);
  const statusText = getPaymentStatusText(user.payment_status);

  return (
    <TouchableOpacity
      key={user.id}
      onPress={() => navigation.navigate('UserDetails', { userId: user.id })}
    >
      <Card style={styles.paymentStatusCard}>
        <Card.Content>
          <View style={styles.userHeader}>
            <View style={styles.userMainInfo}>
              <View style={styles.userNameHeader}>
                <Title style={styles.userName}>{user.name}</Title>
                <Chip
                  mode="flat"
                  style={[styles.statusChip, { backgroundColor: statusColor + '20' }]}
                  textStyle={{ color: statusColor, fontSize: 12, fontWeight: '600' }}
                >
                  {statusText}
                </Chip>
              </View>

              <View style={styles.contactInfo}>
                <View style={styles.contactRow}>
                  <Ionicons name="mail-outline" size={14} color="#666" />
                  <Text style={styles.contactTextSmall}>{user.email}</Text>
                </View>
                {!!user.phone && (
                  <View style={styles.contactRow}>
                    <Ionicons name="call-outline" size={14} color="#666" />
                    <Text style={styles.contactTextSmall}>{user.phone}</Text>
                  </View>
                )}
                {!!user.vehicle_name && (
                  <View style={styles.contactRow}>
                    <Ionicons name="car-outline" size={14} color="#4CAF50" />
                    <Text style={[styles.contactTextSmall, { color: '#4CAF50', fontWeight: '500' }]}>
                      {user.vehicle_name}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <Divider style={styles.modernDivider} />

          {/* Status-specific information */}
          <View style={styles.userStats}>
            {user.payment_status === 'overdue' && (
              <>
                <View style={styles.userStat}>
                  <Text style={styles.userStatLabel}>Dias em Atraso</Text>
                  <Text style={[styles.userStatValue, { color: '#F44336' }]}>
                    {user.days_overdue || 0} dias
                  </Text>
                </View>
                <View style={styles.userStat}>
                  <Text style={styles.userStatLabel}>Valor Pendente</Text>
                  <Text style={[styles.userStatValue, { color: '#F44336' }]}>
                    {formatCurrency(user.pending_amount || 0)}
                  </Text>
                </View>
              </>
            )}
            {user.payment_status === 'up_to_date' && (
              <View style={styles.userStat}>
                <Text style={styles.userStatLabel}>Último Pagamento</Text>
                <Text style={[styles.userStatValue, { color: '#4CAF50' }]}>
                  {user.last_payment
                    ? new Date(user.last_payment).toLocaleDateString('pt-BR')
                    : 'N/A'}
                </Text>
              </View>
            )}
            {user.payment_status === 'no_payments' && (
              <View style={styles.userStat}>
                <Text style={styles.userStatLabel}>Status</Text>
                <Text style={[styles.userStatValue, { color: '#FF9800' }]}>
                  Nenhum pagamento registrado
                </Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

// ============================================
// RENDER STATS CARD
// ============================================
export const renderStatsCard = (
  label: string,
  value: number,
  icon: string,
  color: string,
  styles: any
) => (
  <Card style={styles.statCard}>
    <Card.Content style={styles.statCardContent}>
      <Ionicons name={icon as any} size={32} color={color} />
      <View style={styles.statCardInfo}>
        <Text style={styles.statCardValue}>{value}</Text>
        <Text style={styles.statCardLabel}>{label}</Text>
      </View>
    </Card.Content>
  </Card>
);

// ============================================
// FILTER USERS BY STATUS
// ============================================
export const createFilterUsersByStatus = (
  usersWithPaymentStatus: AdminUser[],
  setStatusFilter: (status: string) => void,
  setFilteredUsers: (users: AdminUser[]) => void
) => {
  return (status: string) => {
    setStatusFilter(status);
    if (status === 'all') {
      setFilteredUsers(usersWithPaymentStatus);
    } else {
      const filtered = usersWithPaymentStatus.filter(user => user.payment_status === status);
      setFilteredUsers(filtered);
    }
  };
};
