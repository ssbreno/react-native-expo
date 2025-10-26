import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import {
  Card,
  Title,
  Text,
  ActivityIndicator,
  Surface,
  useTheme,
  Button,
  Divider,
  Chip,
  Portal,
  Dialog,
  TextInput,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { vehicleService } from '../../services/vehicleService';
import { vehicleCostService, VehicleCost, VehicleCostCreate } from '../../services/vehicleCostService';
import { Vehicle } from '../../types';
import { formatCurrency } from '../../utils/dateUtils';
import { Colors } from '../../constants/colors';
import { styles } from './VehicleDetailsScreen.styles';

interface VehicleDetailsScreenProps {
  route: any;
  navigation: any;
}

export default function VehicleDetailsScreen({ route, navigation }: VehicleDetailsScreenProps) {
  const { vehicleId } = route.params;
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [costs, setCosts] = useState<VehicleCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Custos - Modal Criar/Editar
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCost, setEditingCost] = useState<VehicleCost | null>(null);
  const [formData, setFormData] = useState<VehicleCostCreate>({
    vehicle_id: vehicleId,
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
  });
  const [displayDate, setDisplayDate] = useState(''); // Data no formato DD/MM/YYYY para exibição
  const [saving, setSaving] = useState(false);
  
  // Função para converter ISO (YYYY-MM-DD) para PT-BR (DD/MM/YYYY)
  const formatDateToBR = (isoDate: string): string => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  };
  
  // Função para converter PT-BR (DD/MM/YYYY) para ISO (YYYY-MM-DD)
  const formatDateToISO = (brDate: string): string => {
    if (!brDate) return '';
    const cleaned = brDate.replace(/\D/g, ''); // Remove não-números
    if (cleaned.length !== 8) return '';
    const day = cleaned.substring(0, 2);
    const month = cleaned.substring(2, 4);
    const year = cleaned.substring(4, 8);
    return `${year}-${month}-${day}`;
  };
  
  // Formatar data durante digitação (auto-insert /)
  const handleDateChange = (text: string) => {
    // Remover caracteres não numéricos
    const cleaned = text.replace(/\D/g, '');
    
    // Aplicar máscara DD/MM/YYYY
    let formatted = cleaned;
    if (cleaned.length >= 3) {
      formatted = `${cleaned.substring(0, 2)}/${cleaned.substring(2)}`;
    }
    if (cleaned.length >= 5) {
      formatted = `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}/${cleaned.substring(4, 8)}`;
    }
    
    setDisplayDate(formatted);
    
    // Se tiver 8 dígitos, converter para ISO e atualizar formData
    if (cleaned.length === 8) {
      const isoDate = formatDateToISO(formatted);
      setFormData({ ...formData, date: isoDate });
    }
  };
  
  // Filtros de custos
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [totalCosts, setTotalCosts] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  
  const theme = useTheme();

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [vehicleResult, costsResult] = await Promise.all([
        vehicleService.getVehicleById(vehicleId),
        vehicleCostService.getCosts({
          vehicle_id: vehicleId,
          month: selectedMonth,
          year: selectedYear,
        }),
      ]);

      if (vehicleResult.success && vehicleResult.data) {
        setVehicle(vehicleResult.data);
      }

      if (costsResult.success && costsResult.data) {
        setCosts(costsResult.data.costs);
        setTotalAmount(costsResult.data.total_amount);
        setTotalCosts(costsResult.data.total);
      }
    } catch (error) {
      console.error('Error loading vehicle details:', error);
      Alert.alert('Erro', 'Erro ao carregar detalhes do veículo');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const openCreateModal = () => {
    setEditingCost(null);
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      vehicle_id: vehicleId,
      description: '',
      amount: 0,
      date: today,
    });
    setDisplayDate(formatDateToBR(today));
    setModalVisible(true);
  };

  const openEditModal = (cost: VehicleCost) => {
    setEditingCost(cost);
    setFormData({
      vehicle_id: cost.vehicle_id,
      description: cost.description,
      amount: cost.amount,
      date: cost.date,
    });
    setDisplayDate(formatDateToBR(cost.date));
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingCost(null);
  };

  const handleSave = async () => {
    if (!formData.description.trim()) {
      Alert.alert('Erro', 'Descrição é obrigatória');
      return;
    }

    if (formData.amount <= 0) {
      Alert.alert('Erro', 'Valor deve ser maior que zero');
      return;
    }

    setSaving(true);
    try {
      let result;
      if (editingCost) {
        result = await vehicleCostService.updateCost(editingCost.id, formData);
      } else {
        result = await vehicleCostService.createCost(formData);
      }

      if (result.success) {
        Alert.alert('Sucesso', editingCost ? 'Custo atualizado' : 'Custo criado');
        closeModal();
        loadData();
      } else {
        Alert.alert('Erro', result.error || 'Erro ao salvar custo');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao salvar custo');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (cost: VehicleCost) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja excluir o custo "${cost.description}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            const result = await vehicleCostService.deleteCost(cost.id);
            if (result.success) {
              Alert.alert('Sucesso', 'Custo excluído');
              loadData();
            } else {
              Alert.alert('Erro', result.error || 'Erro ao excluir custo');
            }
          },
        },
      ]
    );
  };

  if (loading && !vehicle) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando detalhes...</Text>
      </View>
    );
  }

  if (!vehicle) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Veículo não encontrado</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      {/* Header com Informações do Veículo */}
      <Surface style={styles.header}>
        <View style={styles.headerContent}>
          <View style={{ flex: 1 }}>
            <Title style={styles.vehicleTitle}>
              {vehicle.brand} {vehicle.model}
            </Title>
            <Text style={styles.vehiclePlate}>{vehicle.license_plate}</Text>
            
            {vehicle.user_id ? (
              <Chip
                mode="flat"
                style={{ backgroundColor: '#FFF3E0', marginTop: 8, alignSelf: 'flex-start' }}
                textStyle={{ color: '#FF9800' }}
                icon="account"
              >
                Vinculado
              </Chip>
            ) : (
              <Chip
                mode="flat"
                style={{ backgroundColor: '#E8F5E9', marginTop: 8, alignSelf: 'flex-start' }}
                textStyle={{ color: '#4CAF50' }}
                icon="check-circle"
              >
                Disponível
              </Chip>
            )}
          </View>
          
          <View style={styles.vehicleIconContainer}>
            <Ionicons name="car-sport" size={48} color={Colors.primary} />
          </View>
        </View>
      </Surface>

      {/* Informações Detalhadas */}
      <Surface style={styles.detailsCard}>
        <Title style={styles.sectionTitle}>Informações do Veículo</Title>
        <Divider style={{ marginBottom: 16 }} />

        <View style={styles.detailRow}>
          <Ionicons name="car-outline" size={20} color="#666" />
          <Text style={styles.detailLabel}>Marca/Modelo:</Text>
          <Text style={styles.detailValue}>
            {vehicle.brand} {vehicle.model}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="card-outline" size={20} color="#666" />
          <Text style={styles.detailLabel}>Placa:</Text>
          <Text style={styles.detailValue}>{vehicle.license_plate}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={20} color="#666" />
          <Text style={styles.detailLabel}>Ano:</Text>
          <Text style={styles.detailValue}>{vehicle.year || 'N/A'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="color-palette-outline" size={20} color="#666" />
          <Text style={styles.detailLabel}>Cor:</Text>
          <Text style={styles.detailValue}>{vehicle.color || 'N/A'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="water-outline" size={20} color="#666" />
          <Text style={styles.detailLabel}>Combustível:</Text>
          <Text style={styles.detailValue}>{vehicle.fuel_type || 'N/A'}</Text>
        </View>

        {vehicle.weekly_cost && (
          <View style={styles.detailRow}>
            <Ionicons name="cash-outline" size={20} color="#666" />
            <Text style={styles.detailLabel}>Valor Semanal:</Text>
            <Text style={[styles.detailValue, { fontWeight: '700', color: Colors.primary }]}>
              {formatCurrency(vehicle.weekly_cost)}
            </Text>
          </View>
        )}
      </Surface>

      {/* Seção de Custos */}
      <Surface style={styles.costsCard}>
        <View style={styles.costsHeader}>
          <View style={{ flex: 1 }}>
            <Title style={styles.sectionTitle}>Custos do Veículo</Title>
            <Text style={styles.costsSubtitle}>
              {totalCosts} custos • {formatCurrency(totalAmount)}
            </Text>
          </View>
          <Button
            mode="contained"
            onPress={openCreateModal}
            icon="plus"
            compact
          >
            Adicionar
          </Button>
        </View>

        {/* Filtro de Mês */}
        <View style={styles.monthFilter}>
          <Button
            mode="outlined"
            onPress={() => {
              if (selectedMonth > 1) {
                setSelectedMonth(selectedMonth - 1);
              } else {
                setSelectedMonth(12);
                setSelectedYear(selectedYear - 1);
              }
            }}
            icon="chevron-left"
            compact
          >
            {' '}
          </Button>

          <Chip style={{ marginHorizontal: 8 }}>
            {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('pt-BR', {
              month: 'long',
              year: 'numeric',
            })}
          </Chip>

          <Button
            mode="outlined"
            onPress={() => {
              if (selectedMonth < 12) {
                setSelectedMonth(selectedMonth + 1);
              } else {
                setSelectedMonth(1);
                setSelectedYear(selectedYear + 1);
              }
            }}
            icon="chevron-right"
            compact
          >
            {' '}
          </Button>
        </View>

        <Divider style={{ marginVertical: 16 }} />

        {/* Lista de Custos */}
        {costs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cash-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>Nenhum custo registrado</Text>
          </View>
        ) : (
          costs.map(cost => (
            <Card key={cost.id} style={styles.costCard}>
              <Card.Content>
                <View style={styles.costHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.costDescription}>{cost.description}</Text>
                    <Text style={styles.costDate}>
                      {new Date(cost.date).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                  <Text style={styles.costAmount}>{formatCurrency(cost.amount)}</Text>
                </View>

                <Divider style={{ marginVertical: 8 }} />

                <View style={styles.costActions}>
                  <Button
                    mode="outlined"
                    onPress={() => openEditModal(cost)}
                    icon="pencil"
                    compact
                    style={{ flex: 1, marginRight: 8 }}
                  >
                    Editar
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => handleDelete(cost)}
                    icon="delete"
                    compact
                    textColor="#F44336"
                    style={{ flex: 1 }}
                  >
                    Excluir
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </Surface>

      {/* Modal Criar/Editar Custo */}
      <Portal>
        <Dialog visible={modalVisible} onDismiss={closeModal}>
          <Dialog.Title>{editingCost ? 'Editar Custo' : 'Novo Custo'}</Dialog.Title>

          <Dialog.Actions style={{ paddingHorizontal: 24, paddingTop: 8 }}>
            <Button onPress={closeModal} disabled={saving}>
              Cancelar
            </Button>
            <Button onPress={handleSave} mode="contained" loading={saving} disabled={saving}>
              Salvar
            </Button>
          </Dialog.Actions>

          <Dialog.ScrollArea>
            <ScrollView style={{ maxHeight: 300 }}>
              <TextInput
                label="Descrição *"
                value={formData.description}
                onChangeText={text => setFormData({ ...formData, description: text })}
                mode="outlined"
                style={{ marginBottom: 12 }}
                disabled={saving}
              />

              <TextInput
                label="Valor *"
                value={formData.amount.toString()}
                onChangeText={text => {
                  // Permitir apenas números e ponto/vírgula decimal
                  const cleanText = text.replace(',', '.');
                  const value = parseFloat(cleanText) || 0;
                  setFormData({ ...formData, amount: value });
                }}
                mode="outlined"
                keyboardType="decimal-pad"
                style={{ marginBottom: 12 }}
                disabled={saving}
                left={<TextInput.Affix text="R$" />}
                placeholder="0.00"
              />

              <TextInput
                label="Data *"
                value={displayDate}
                onChangeText={handleDateChange}
                mode="outlined"
                keyboardType="numeric"
                style={{ marginBottom: 12 }}
                disabled={saving}
                placeholder="DD/MM/YYYY"
                maxLength={10}
              />
            </ScrollView>
          </Dialog.ScrollArea>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}
